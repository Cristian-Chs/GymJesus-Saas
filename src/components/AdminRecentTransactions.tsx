"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Payment } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminRecentTransactions() {
  const [transactions, setTransactions] = useState([] as Payment[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startTimestamp = Timestamp.fromDate(startOfMonth);

    const q = query(
      collection(db, "payments"),
      where("date", ">=", startTimestamp),
      orderBy("date", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
      setTransactions(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-white/5 rounded-xl block"></div>
      ))}
    </div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Fecha</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Usuario</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Plan</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Monto</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Detalles</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No hay transacciones registradas este mes.
                </td>
              </tr>
            ) : (
              transactions.map((tx: Payment) => (
                <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {format(tx.date.toDate(), "dd MMM, HH:mm", { locale: es })}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-100">{tx.userName}</p>
                    <p className="text-[10px] text-gray-500">{tx.userId.substring(0, 8)}...</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase text-brand-primary">
                      {tx.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-white">
                    ${tx.amount}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {tx.details || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      tx.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                      tx.status === 'pending' ? 'bg-orange-400/10 text-orange-400' :
                      'bg-red-400/10 text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
