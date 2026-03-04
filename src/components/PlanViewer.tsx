"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plan, UserProfile, ExerciseDay, DietDay } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface Props {
  planId?: string;
}

export default function PlanViewer({ planId }: Props) {
  const { userProfile } = useAuth();
  const [plan, setPlan] = useState<Partial<Plan> | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"exercises" | "diet">("exercises");

  useEffect(() => {
    const fetchPlan = async () => {
      // 1. Check for custom routine on user profile
      if (userProfile?.customExercises && userProfile.customExercises.length > 0) {
        setPlan({
          name: "Tu Rutina Personalizada",
          exercises: userProfile.customExercises,
          diet: userProfile.customDiet || []
        });
        setLoading(false);
        return;
      }

      // 2. Fallback to global plan
      if (!planId) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "plans", planId));
      if (snap.exists()) {
        setPlan({ id: snap.id, ...snap.data() } as Plan);
      }
      setLoading(false);
    };

    fetchPlan();
  }, [planId, userProfile]);

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
      <div className="rounded-2xl border border-white/5 bg-surface-700 p-8 text-center text-gray-400">
        <p className="text-xs font-black uppercase tracking-widest text-brand-primary">Sin Plan Asignado</p>
        <p className="mt-2 text-[10px] uppercase font-bold text-gray-500">Contacta al administrador para recibir tu rutina.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-700 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black tracking-widest text-brand-primary uppercase">
            {plan.name}
          </h3>
          {userProfile?.customExercises && userProfile.customExercises.length > 0 && (
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Modificado por el Administrador</span>
          )}
        </div>
        <div className="flex gap-1 rounded-lg bg-surface-800 p-1">
          <button
            onClick={() => setTab("exercises")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              tab === "exercises" ? "bg-brand-primary text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Ejercicios
          </button>
          <button
            onClick={() => setTab("diet")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              tab === "diet" ? "bg-brand-primary text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Dieta
          </button>
        </div>
      </div>

      {tab === "exercises" ? (
        <div className="space-y-6">
          {plan.exercises?.map((day, dIdx) => (
            <div key={dIdx} className="space-y-3">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-l-2 border-brand-primary pl-2">{day.day}</h4>
              <div className="grid gap-3">
                {day.exercises.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-surface-800/50 border border-white/5 px-4 py-3 hover:border-brand-primary/20 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                       <div>
                         <p className="text-sm font-bold text-gray-100">{ex.name}</p>
                         {ex.notes && <p className="mt-1 text-[10px] text-gray-500 italic">{ex.notes}</p>}
                       </div>
                       <div className="flex gap-4 items-center">
                         <div className="text-center">
                           <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Sets</p>
                           <p className="text-sm font-black text-brand-primary">{ex.sets}</p>
                         </div>
                         <div className="text-center">
                           <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Reps</p>
                           <p className="text-sm font-black text-gray-200">{ex.reps}</p>
                         </div>
                         <div className="text-center">
                           <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Rest</p>
                           <p className="text-sm font-black text-gray-500">{ex.restSeconds}s</p>
                         </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {(!plan.exercises || plan.exercises.length === 0) && (
            <p className="py-10 text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">No hay ejercicios asignados.</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {plan.diet?.map((day, i) => (
            <div key={i} className="space-y-3">
               <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-l-2 border-brand-primary pl-2">{day.day}</h4>
               <div className="space-y-2">
                 {day.meals.map((meal, j) => (
                   <div key={j} className="rounded-xl bg-surface-800/50 border border-white/5 px-4 py-3">
                     <div className="flex items-center justify-between mb-1">
                       <span className="text-[10px] font-black text-brand-primary uppercase">{meal.time}</span>
                       {meal.calories && <span className="text-[9px] font-bold text-gray-500">{meal.calories} KCAL</span>}
                     </div>
                     <p className="text-xs text-gray-300 leading-relaxed font-medium">
                       {meal.foods.join(", ")}
                     </p>
                   </div>
                 ))}
               </div>
            </div>
          ))}
          {(!plan.diet || plan.diet.length === 0) && (
            <p className="py-10 text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">No hay dieta asignada.</p>
          )}
        </div>
      )}
    </div>
  );
}
