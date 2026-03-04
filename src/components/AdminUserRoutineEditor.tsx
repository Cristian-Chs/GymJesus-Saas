"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, doc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, ExerciseDay, DietDay, Plan } from "@/types";

export default function AdminUserRoutineEditor() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"exercises" | "diet">("exercises");

  // Editable state
  const [customExercises, setCustomExercises] = useState<ExerciseDay[]>([]);
  const [customDiet, setCustomDiet] = useState<DietDay[]>([]);

  const selectedUser = users.find((u: UserProfile) => u.uid === selectedUserId);

  useEffect(() => {
    // 1. Listen to clients
    const q = query(collection(db, "users"), where("role", "==", "client"));
    const unsubscribeUsers = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      setLoading(false);
    });

    // 2. Fetch plans (for templates)
    const fetchPlans = async () => {
      const pSnap = await getDocs(collection(db, "plans"));
      setPlans(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Plan)));
    };
    fetchPlans();

    return () => unsubscribeUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setCustomExercises(selectedUser.customExercises || []);
      setCustomDiet(selectedUser.customDiet || []);
    }
  }, [selectedUserId, users]);

  const handleUpdateRoutine = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", selectedUserId), {
        customExercises,
        customDiet
      });
      alert("Rutina personalizada actualizada");
    } catch (e) {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = (planId: string) => {
    const plan = plans.find((p: Plan) => p.id === planId);
    if (plan) {
      if (confirm(`¿Cargar plantilla de ${plan.name}? Esto sobrescribirá los cambios no guardados.`)) {
        setCustomExercises(JSON.parse(JSON.stringify(plan.exercises)));
        setCustomDiet(JSON.parse(JSON.stringify(plan.diet)));
      }
    }
  };

  // Reusable logic from PlanEditor
  const updateExercise = (dayIdx: number, exIdx: number, field: string, value: any) => {
    const newEx = [...customExercises];
    const dayExList = [...newEx[dayIdx].exercises];
    dayExList[exIdx] = { ...dayExList[exIdx], [field]: value };
    newEx[dayIdx] = { ...newEx[dayIdx], exercises: dayExList };
    setCustomExercises(newEx);
  };

  const addExercise = (dayIdx: number) => {
    const newEx = [...customExercises];
    newEx[dayIdx].exercises.push({ name: "Nuevo Ejercicio", sets: 3, reps: "12", restSeconds: 60 });
    setCustomExercises(newEx);
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    const newEx = [...customExercises];
    newEx[dayIdx].exercises.splice(exIdx, 1);
    setCustomExercises(newEx);
  };

  const addExerciseDay = () => {
    setCustomExercises([...customExercises, { day: "Nuevo Día", exercises: [] }]);
  };

  const updateMeal = (dayIdx: number, mealIdx: number, field: string, value: any) => {
    const newDiet = [...customDiet];
    const meals = [...newDiet[dayIdx].meals];
    if (field === "foods") {
      meals[mealIdx] = { ...meals[mealIdx], foods: value.split(",").map((s: string) => s.trim()) };
    } else {
      meals[mealIdx] = { ...meals[mealIdx], [field]: value };
    }
    newDiet[dayIdx] = { ...newDiet[dayIdx], meals };
    setCustomDiet(newDiet);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse uppercase text-xs font-bold">Cargando Usuarios...</div>;

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-700 p-6">
      <div className="mb-8 border-b border-white/5 pb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-primary">Personalizador de Rutinas</h3>
        <p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-tighter">Modifica el entrenamiento específico de cada cliente</p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <select 
            value={selectedUserId}
            onChange={(e: any) => setSelectedUserId(e.target.value)}
            className="rounded-lg bg-surface-800 border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-brand-primary/50 min-w-[200px]"
          >
            <option value="">Seleccionar Cliente...</option>
            {users.map((u: UserProfile) => (
              <option key={u.uid} value={u.uid}>{u.displayName} ({u.email})</option>
            ))}
          </select>

          {selectedUserId && (
             <div className="flex gap-2">
               <select 
                 onChange={(e: any) => handleApplyTemplate(e.target.value)}
                 className="rounded-lg bg-surface-900 border border-white/5 px-3 py-1.5 text-[10px] text-gray-400 uppercase font-bold outline-none"
               >
                 <option value="">Cargar Plantilla...</option>
                 {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
               
               <button
                 onClick={handleUpdateRoutine}
                 disabled={saving}
                 className="rounded-lg bg-brand-primary px-6 py-2 text-xs font-black text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-glow shadow-brand-primary/20"
               >
                 {saving ? "Guardando..." : "Guardar Personalizada"}
               </button>
             </div>
          )}
        </div>
      </div>

      {!selectedUserId ? (
        <div className="py-20 text-center text-xs text-gray-600 italic font-medium uppercase tracking-widest">
          Selecciona un cliente para comenzar a personalizar su rutina.
        </div>
      ) : (
        <>
          <div className="mb-6 flex gap-2 rounded-xl bg-surface-800 p-1 w-fit">
            <button
              onClick={() => setActiveTab("exercises")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === "exercises" ? "bg-surface-600 text-brand-primary shadow-xl" : "text-gray-500 hover:text-gray-300"}`}
            >
              Ejercicios
            </button>
            <button
              onClick={() => setActiveTab("diet")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === "diet" ? "bg-surface-600 text-brand-primary shadow-xl" : "text-gray-500 hover:text-gray-300"}`}
            >
              Alimentación
            </button>
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === "exercises" ? (
              <div className="space-y-6">
                 {customExercises.map((day: ExerciseDay, dayIdx: number) => (
                   <div key={dayIdx} className="space-y-4 rounded-xl border border-white/5 bg-surface-800/50 p-5">
                     <div className="flex items-center justify-between">
                       <input 
                         type="text" value={day.day} onChange={(e: any) => {
                           const newEx = [...customExercises];
                           newEx[dayIdx].day = e.target.value;
                           setCustomExercises(newEx);
                         }}
                         className="bg-transparent text-xs font-black text-brand-primary uppercase tracking-widest outline-none border-b border-white/0 focus:border-brand-primary/30"
                       />
                       <button onClick={() => {
                         const newEx = [...customExercises];
                         newEx.splice(dayIdx, 1);
                         setCustomExercises(newEx);
                       }} className="text-[10px] text-red-500/50 hover:text-red-500 font-bold uppercase">Eliminar Día</button>
                     </div>
                     <div className="space-y-3">
                       {day.exercises.map((ex, exIdx) => (
                         <div key={exIdx} className="group relative grid gap-4 grid-cols-1 sm:grid-cols-5 rounded-xl border border-white/5 bg-surface-900/50 p-4 hover:border-brand-primary/30">
                           <div className="sm:col-span-2 space-y-1">
                             <label className="text-[9px] font-black text-gray-500 uppercase">Nombre</label>
                             <input type="text" value={ex.name} onChange={(e: any) => updateExercise(dayIdx, exIdx, "name", e.target.value)} className="w-full rounded bg-surface-950 p-2 text-xs text-white outline-none" />
                           </div>
                           <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                             <input type="number" value={ex.sets} onChange={(e: any) => updateExercise(dayIdx, exIdx, "sets", parseInt(e.target.value))} className="rounded bg-surface-950 p-2 text-xs text-white outline-none" />
                             <input type="text" value={ex.reps} onChange={(e: any) => updateExercise(dayIdx, exIdx, "reps", e.target.value)} className="rounded bg-surface-950 p-2 text-xs text-white outline-none" />
                             <input type="number" value={ex.restSeconds} onChange={(e: any) => updateExercise(dayIdx, exIdx, "restSeconds", parseInt(e.target.value))} className="rounded bg-surface-950 p-2 text-xs text-white outline-none" />
                           </div>
                           <button onClick={() => removeExercise(dayIdx, exIdx)} className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex hover:bg-red-500 hover:text-white">✕</button>
                         </div>
                       ))}
                       <button onClick={() => addExercise(dayIdx)} className="w-full rounded-xl border border-dashed border-white/5 p-3 text-[10px] font-bold text-gray-600 hover:text-brand-primary">+ Añadir Ejercicio</button>
                     </div>
                   </div>
                 ))}
                 <button onClick={addExerciseDay} className="w-full rounded-xl border border-dashed border-brand-primary/20 p-4 text-xs font-bold text-brand-primary hover:bg-brand-primary/5">+ Añadir Día de Entrenamiento</button>
              </div>
            ) : (
              <div className="space-y-6">
                {customDiet.map((day: DietDay, dIdx: number) => (
                  <div key={dIdx} className="space-y-4 rounded-xl border border-white/5 bg-surface-800/50 p-5">
                    <h4 className="text-xs font-black text-brand-primary uppercase tracking-widest">{day.day}</h4>
                    <div className="space-y-4">
                      {day.meals.map((meal: any, mIdx: number) => (
                        <div key={mIdx} className="grid gap-4 sm:grid-cols-4 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                          <input type="text" value={meal.time} onChange={(e: any) => updateMeal(dIdx, mIdx, "time", e.target.value)} className="rounded bg-surface-950 p-2 text-xs text-white outline-none" />
                          <div className="sm:col-span-2">
                            <input type="text" value={meal.foods.join(", ")} onChange={(e: any) => updateMeal(dIdx, mIdx, "foods", e.target.value)} className="w-full rounded bg-surface-950 p-2 text-xs text-white outline-none" placeholder="Alimentos..." />
                          </div>
                          <input type="number" value={meal.calories} onChange={(e: any) => updateMeal(dIdx, mIdx, "calories", parseInt(e.target.value))} className="rounded bg-surface-950 p-2 text-xs text-white outline-none" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {customDiet.length === 0 && (
                  <button onClick={() => setCustomDiet([{ day: "Lunes", meals: [] }])} className="w-full rounded-xl border border-dashed border-brand-primary/20 p-4 text-xs font-bold text-brand-primary">Inicializar Dieta Personalizada</button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
