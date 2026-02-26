"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plan } from "@/types";

export default function AdminPlanEditor() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"exercises" | "diet">("exercises");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "plans"), (snap) => {
      const p = snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan));
      setPlans(p);
      if (!selectedPlanId && p.length > 0) setSelectedPlanId(p[0].id);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "plans", selectedPlanId), {
        exercises: selectedPlan.exercises,
        diet: selectedPlan.diet
      });
      alert("Plan actualizado con éxito");
    } catch (e) {
      alert("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  // Logic for Exercises
  const updateExercise = (idx: number, field: string, value: any) => {
    if (!selectedPlan) return;
    const newPlans = [...plans];
    const pIdx = newPlans.findIndex(p => p.id === selectedPlanId);
    const newExercises = [...newPlans[pIdx].exercises];
    newExercises[idx] = { ...newExercises[idx], [field]: value };
    newPlans[pIdx] = { ...newPlans[pIdx], exercises: newExercises };
    setPlans(newPlans);
  };

  const addExercise = () => {
    if (!selectedPlan) return;
    const newPlans = [...plans];
    const pIdx = newPlans.findIndex(p => p.id === selectedPlanId);
    newPlans[pIdx].exercises.push({
      name: "Nuevo Ejercicio",
      sets: 3,
      reps: "12",
      restSeconds: 60,
      notes: ""
    });
    setPlans(newPlans);
  };

  const removeExercise = (idx: number) => {
    if (!selectedPlan) return;
    const newPlans = [...plans];
    const pIdx = newPlans.findIndex(p => p.id === selectedPlanId);
    newPlans[pIdx].exercises.splice(idx, 1);
    setPlans(newPlans);
  };

  // Logic for Diet
  const updateMeal = (dayIdx: number, mealIdx: number, field: string, value: any) => {
    if (!selectedPlan) return;
    const newPlans = [...plans];
    const pIdx = newPlans.findIndex(p => p.id === selectedPlanId);
    const newDiet = [...newPlans[pIdx].diet];
    const newMeals = [...newDiet[dayIdx].meals];
    
    if (field === "foods") {
      newMeals[mealIdx] = { ...newMeals[mealIdx], foods: value.split(",").map((s: string) => s.trim()) };
    } else {
      newMeals[mealIdx] = { ...newMeals[mealIdx], [field]: value };
    }

    newDiet[dayIdx] = { ...newDiet[dayIdx], meals: newMeals };
    newPlans[pIdx] = { ...newPlans[pIdx], diet: newDiet };
    setPlans(newPlans);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando editor de planes...</div>;

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-700 p-6">
      {/* Header with Selector and Save */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Editor de Planes por Nivel</h3>
          <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Membresías: Básico, Pro, Elite</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedPlanId} 
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="rounded-lg bg-surface-800 border border-white/10 px-3 py-2 text-xs text-brand-lime font-black uppercase outline-none focus:border-brand-lime/50"
          >
            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button
            onClick={handleUpdatePlan}
            disabled={saving}
            className="rounded-lg bg-brand-lime px-6 py-2 text-xs font-black text-surface-900 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-glow shadow-brand-lime/20"
          >
            {saving ? "Guardando..." : "Guardar Global"}
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mb-6 flex gap-2 rounded-xl bg-surface-800 p-1 w-fit">
        <button
          onClick={() => setActiveTab("exercises")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === "exercises" ? "bg-surface-600 text-brand-lime shadow-xl" : "text-gray-500 hover:text-gray-300"}`}
        >
          Rutina de Ejercicios
        </button>
        <button
          onClick={() => setActiveTab("diet")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === "diet" ? "bg-surface-600 text-brand-lime shadow-xl" : "text-gray-500 hover:text-gray-300"}`}
        >
          Plan de Alimentación
        </button>
      </div>

      {selectedPlan && (
        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {activeTab === "exercises" ? (
            <div className="space-y-3">
              {selectedPlan.exercises.map((ex, idx) => (
                <div key={idx} className="group relative grid gap-4 grid-cols-1 sm:grid-cols-5 rounded-xl border border-white/5 bg-surface-800/50 p-4 hover:border-brand-lime/30 transition-all">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase">Nombre / Máquina</label>
                    <input 
                      type="text" value={ex.name} onChange={(e) => updateExercise(idx, "name", e.target.value)}
                      className="w-full rounded bg-surface-900 p-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Sets</label>
                      <input 
                        type="number" value={ex.sets} onChange={(e) => updateExercise(idx, "sets", parseInt(e.target.value))}
                        className="w-full rounded bg-surface-900 p-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Reps</label>
                      <input 
                        type="text" value={ex.reps} onChange={(e) => updateExercise(idx, "reps", e.target.value)}
                        className="w-full rounded bg-surface-900 p-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase">Descanso(s)</label>
                      <input 
                        type="number" value={ex.restSeconds} onChange={(e) => updateExercise(idx, "restSeconds", parseInt(e.target.value))}
                        className="w-full rounded bg-surface-900 p-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeExercise(idx)}
                    className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex hover:bg-red-500 hover:text-white"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={addExercise}
                className="w-full rounded-xl border border-dashed border-white/10 p-4 text-xs font-bold text-gray-500 hover:border-brand-lime/50 hover:text-brand-lime transition-all"
              >
                + Añadir Nuevo Ejercicio
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedPlan.diet.map((day, dIdx) => (
                <div key={dIdx} className="space-y-4 rounded-xl border border-white/5 bg-surface-800/50 p-5">
                  <h4 className="text-xs font-black text-brand-lime uppercase tracking-widest">{day.day}</h4>
                  <div className="space-y-4">
                    {day.meals.map((meal, mIdx) => (
                      <div key={mIdx} className="grid gap-4 sm:grid-cols-4 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase">Hora</label>
                          <input 
                            type="text" value={meal.time} onChange={(e) => updateMeal(dIdx, mIdx, "time", e.target.value)}
                            className="w-full rounded bg-surface-900 p-2 text-xs text-white outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase">Nombre / Alimentos</label>
                          <input 
                            type="text" value={meal.foods.join(", ")} onChange={(e) => updateMeal(dIdx, mIdx, "foods", e.target.value)}
                            className="w-full rounded bg-surface-900 p-2 text-xs text-white outline-none placeholder:text-gray-700"
                            placeholder="Pollo, Arroz, Ensalada..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase">Calorías</label>
                          <input 
                            type="number" value={meal.calories} onChange={(e) => updateMeal(dIdx, mIdx, "calories", parseInt(e.target.value))}
                            className="w-full rounded bg-surface-900 p-2 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
