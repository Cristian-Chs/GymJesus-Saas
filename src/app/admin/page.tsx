"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, setDoc, Timestamp, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { differenceInDays } from "date-fns";
import TransactionTable from "@/components/TransactionTable";
import BcvRate from "@/components/BcvRate";
import AdminNotifications from "@/components/AdminNotifications";
import AdminGymEvents from "@/components/AdminGymEvents";
import AdminPlanEditor from "@/components/AdminPlanEditor";

export default function AdminDashboard() {
  const { userProfile, loading } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, verifying: 0 });

  useEffect(() => {
    // 1. Listen to Users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (uSnap) => {
      const users = uSnap.docs
        .map((d) => ({ uid: d.id, ...d.data() }) as UserProfile)
        .filter((u) => u.role !== "admin");

      // 2. Listen to Pending Payments (Nested to simplify, although separate is fine)
      const q = query(collection(db, "payments"), where("status", "==", "pending"));
      const unsubscribePayments = onSnapshot(q, (pSnap) => {
        const verifying = pSnap.size;
        const active = users.filter(
          (u) => differenceInDays(u.subscriptionEnd.toDate(), new Date()) >= 0
        ).length;

        setStats({
          total: users.length,
          active,
          pending: users.length - active,
          verifying
        });
      });

      return () => unsubscribePayments();
    });

    return () => unsubscribeUsers();
  }, []);

  const initializePlans = async () => {
    const plans = [
      { id: "plan_basico", name: "Rutina Básica", description: "Enfoque en máquinas y técnica.", exercises: [], diet: [], createdAt: Timestamp.now() },
      { id: "plan_pro", name: "Rutina Pro", description: "Hipertrofia y fuerza avanzada.", exercises: [], diet: [], createdAt: Timestamp.now() },
      { id: "plan_elite", name: "Rutina Elite", description: "Alto rendimiento y nutrición.", exercises: [], diet: [], createdAt: Timestamp.now() },
    ];

    try {
      for (const p of plans) {
        await setDoc(doc(db, "plans", p.id), p);
      }
      alert("Planes inicializados correctamente.");
    } catch (e) {
      alert("Error al inicializar planes.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-lime border-t-transparent" />
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Panel de Administración
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitorea suscripciones y gestiona los pagos de tus clientes.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={initializePlans}
            className="rounded-lg border border-white/5 bg-surface-800 px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-all hover:bg-surface-700 hover:text-white"
          >
            Inicializar Planes
          </button>
          <BcvRate />
          <div className="h-8 w-[1px] bg-white/5 mx-2" />
          <AdminNotifications />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card">
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Total Clientes
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-100">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Activos
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {stats.active}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            Expirados
          </p>
          <p className="mt-2 text-3xl font-bold text-red-400">
            {stats.pending}
          </p>
        </div>
        <div className="card border-orange-500/20 bg-orange-500/5">
          <p className="text-xs font-medium tracking-wider text-orange-500/70 uppercase">
            Por Verificar
          </p>
          <p className="mt-2 text-3xl font-bold text-orange-400">
            {stats.verifying}
          </p>
        </div>
      </div>

      {/* Top row: Events management */}
      <section className="mt-8">
        <AdminGymEvents />
      </section>

      {/* Main row: Transaction table */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-white uppercase tracking-widest text-sm opacity-50">Monitor de Transacciones</h2>
        <TransactionTable />
      </section>

      {/* Full width Plan Editor */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-white uppercase tracking-widest text-sm opacity-50">Gestión de Planes y Programas</h2>
        <AdminPlanEditor />
      </section>
    </div>
  );
}
