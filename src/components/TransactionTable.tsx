"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, Payment } from "@/types";
import { differenceInDays, format, addMonths } from "date-fns";
import { es } from "date-fns/locale";

export default function TransactionTable() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "expired" | "verifying">("all");

  useEffect(() => {
    // 1. Listen for Users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (uSnap) => {
      const usersList = uSnap.docs.map(
        (d) => ({ uid: d.id, ...d.data() }) as UserProfile
      );

      // 2. Listen for Pending Payments
      const q = query(collection(db, "payments"), where("status", "==", "pending"));
      const unsubscribePayments = onSnapshot(q, (pSnap) => {
        const pendingMap: Record<string, boolean> = {};
        pSnap.docs.forEach(d => {
          const p = d.data() as Payment;
          pendingMap[p.userId] = true;
        });

        setUsers(usersList);
        setPendingPayments(pendingMap);
        setLoading(false);
      });

      return () => unsubscribePayments();
    });

    return () => unsubscribeUsers();
  }, []);

  const extendSubscription = async (uid: string) => {
    const user = users.find(u => u.uid === uid);
    if (!user) return;

    const now = new Date();
    const currentEnd = user.subscriptionEnd.toDate();
    const baseDate = currentEnd > now ? currentEnd : now;
    const newEnd = Timestamp.fromDate(addMonths(baseDate, 1));

    await updateDoc(doc(db, "users", uid), {
      subscriptionEnd: newEnd,
      status: "active",
    });
    
    setUsers((prev) =>
      prev.map((u) =>
        u.uid === uid
          ? { ...u, subscriptionEnd: newEnd, status: "active" }
          : u
      )
    );
  };

  const subtractSubscription = async (uid: string) => {
    const user = users.find(u => u.uid === uid);
    if (!user) return;

    const currentEnd = user.subscriptionEnd.toDate();
    const newEnd = Timestamp.fromDate(addMonths(currentEnd, -1));

    await updateDoc(doc(db, "users", uid), {
      subscriptionEnd: newEnd,
    });
    
    setUsers((prev) =>
      prev.map((u) =>
        u.uid === uid
          ? { ...u, subscriptionEnd: newEnd }
          : u
      )
    );
  };

  const getStatus = (u: UserProfile) => {
    if (pendingPayments[u.uid]) return "verifying";
    const end = u.subscriptionEnd.toDate();
    return differenceInDays(end, new Date()) >= 0 ? "paid" : "expired";
  };

  const filtered = users.filter((u) => {
    if (u.role === "admin") return false;
    if (filter === "all") return true;
    return getStatus(u) === filter;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-surface-700" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "paid", "expired", "verifying"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === f
                ? "bg-brand-lime text-surface-900"
                : "bg-surface-700 text-gray-400 hover:bg-surface-600"
            }`}
          >
            {f === "all" ? "Todos" : f === "paid" ? "Pagado" : f === "expired" ? "Expirados" : "Por Verificar"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-surface-800 text-xs uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Usuario</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Vencimiento</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((u) => {
              const status = getStatus(u);
              const end = u.subscriptionEnd.toDate();
              return (
                <tr
                  key={u.uid}
                  className="bg-surface-700 transition-colors hover:bg-surface-600"
                >
                  <td className="px-5 py-4 font-medium text-gray-100">
                    {u.displayName || "Sin nombre"}
                  </td>
                  <td className="px-5 py-4 text-gray-400">{u.email}</td>
                  <td className="px-5 py-4 text-gray-400">
                    {format(end, "d MMM yyyy", { locale: es })}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        status === "paid"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : status === "verifying"
                          ? "bg-orange-500/10 text-orange-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          status === "paid" ? "bg-emerald-400" : status === "verifying" ? "bg-orange-400 animate-pulse" : "bg-red-400"
                        }`}
                      />
                      {status === "paid" ? "Pagado" : status === "verifying" ? "En Verificación" : "Expirado"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {status === "verifying" ? (
                      <span className="text-[10px] text-gray-500 italic">Usar buzón para aprobar</span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => subtractSubscription(u.uid)}
                          className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20"
                          title="Quitar 1 mes"
                        >
                          -1 Mes
                        </button>
                        <button
                          onClick={() => extendSubscription(u.uid)}
                          className="rounded-lg bg-brand-lime/10 px-3 py-1.5 text-xs font-semibold text-brand-lime transition-all hover:bg-brand-lime/20 hover:shadow-glow"
                        >
                          +1 Mes
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-gray-500"
                >
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 flex gap-6 text-xs text-gray-500">
        <span>
          Total:{" "}
          <strong className="text-gray-300">
            {users.filter((u) => u.role !== "admin").length}
          </strong>
        </span>
        <span>
          Pagados:{" "}
          <strong className="text-emerald-400">
            {users.filter((u) => u.role !== "admin" && getStatus(u) === "paid").length}
          </strong>
        </span>
        <span>
          Expirados:{" "}
          <strong className="text-red-400">
            {users.filter((u) => u.role !== "admin" && getStatus(u) === "expired").length}
          </strong>
        </span>
        <span>
          Por Verificar:{" "}
          <strong className="text-orange-400">
            {users.filter((u) => u.role !== "admin" && getStatus(u) === "verifying").length}
          </strong>
        </span>
      </div>
    </div>
  );
}
