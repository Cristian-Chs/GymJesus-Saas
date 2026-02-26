"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plan } from "@/types";

interface Props {
  planId?: string;
}

export default function PlanViewer({ planId }: Props) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"exercises" | "diet">("exercises");

  useEffect(() => {
    if (!planId) {
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      const snap = await getDoc(doc(db, "plans", planId));
      if (snap.exists()) {
        setPlan({ id: snap.id, ...snap.data() } as Plan);
      }
      setLoading(false);
    };

    fetchPlan();
  }, [planId]);

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-white/5 bg-surface-700 p-6">
        <div className="h-4 w-40 rounded bg-surface-600" />
        <div className="mt-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-surface-600" />
          ))}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-700 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-800 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <p className="font-medium text-gray-200">No tienes un plan de entrenamiento asignado</p>
        <p className="mt-1 text-sm text-gray-500">
          Selecciona una membresía a continuación o contacta a tu administrador para recibir tu rutina.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-700 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium tracking-wider text-gray-400 uppercase">
          {plan.name}
        </h3>
        {/* Tab switcher */}
        <div className="flex gap-1 rounded-lg bg-surface-800 p-1">
          <button
            onClick={() => setTab("exercises")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              tab === "exercises"
                ? "bg-brand-lime text-surface-900"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Ejercicios
          </button>
          <button
            onClick={() => setTab("diet")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              tab === "diet"
                ? "bg-brand-lime text-surface-900"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Alimentación
          </button>
        </div>
      </div>

      {tab === "exercises" ? (
        <div className="space-y-2">
          {plan.exercises.map((ex, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-surface-800 px-4 py-3"
            >
              <div>
                <p className="font-medium text-gray-100">{ex.name}</p>
                {ex.notes && (
                  <p className="mt-0.5 text-xs text-gray-500">{ex.notes}</p>
                )}
              </div>
              <div className="flex gap-4 text-sm text-gray-400">
                <span>
                  <strong className="text-gray-200">{ex.sets}</strong> sets
                </span>
                <span>
                  <strong className="text-gray-200">{ex.reps}</strong> reps
                </span>
                <span>
                  <strong className="text-gray-200">{ex.restSeconds}s</strong>{" "}
                  descanso
                </span>
              </div>
            </div>
          ))}
          {plan.exercises.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">
              No hay ejercicios asignados.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {plan.diet.map((day, i) => (
            <div key={i}>
              <h4 className="mb-2 text-xs font-bold tracking-wider text-brand-lime uppercase">
                {day.day}
              </h4>
              <div className="space-y-1">
                {day.meals.map((meal, j) => (
                  <div
                    key={j}
                    className="rounded-xl bg-surface-800 px-4 py-3"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-500">{meal.time}</span>
                      <span className="font-medium text-gray-200">
                        {meal.name}
                      </span>
                      {meal.calories && (
                        <span className="ml-auto text-xs text-brand-lime">
                          {meal.calories} kcal
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      {meal.foods.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {plan.diet.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">
              No hay dieta asignada.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
