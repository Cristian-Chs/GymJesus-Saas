"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, Timestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GymEvent } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminGymEvents() {
  const [events, setEvents] = useState<GymEvent[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIsOpen, setNewIsOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "gym_events"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as GymEvent)));
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTitle) return;

    await addDoc(collection(db, "gym_events"), {
      date: Timestamp.fromDate(new Date(newDate + "T00:00:00")),
      title: newTitle,
      description: newDesc,
      isOpen: newIsOpen,
    });

    setNewDate("");
    setNewTitle("");
    setNewDesc("");
    setNewIsOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "gym_events", id));
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-700 p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Calendario del Gym
        </h3>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-xl bg-surface-800/50 p-3 border border-white/5">
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-gray-500 uppercase">Fecha</label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="rounded-lg bg-surface-900 border border-white/10 p-1.5 text-xs text-white outline-none focus:border-brand-lime/50 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-gray-500 uppercase">Título</label>
            <input
              type="text"
              required
              placeholder="Ej. Feriado"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="rounded-lg bg-surface-900 border border-white/10 p-1.5 text-xs text-white outline-none focus:border-brand-lime/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              id="isOpenChecked"
              checked={newIsOpen}
              onChange={(e) => setNewIsOpen(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-white/10 bg-surface-900 text-brand-lime focus:ring-offset-0 focus:ring-brand-lime"
            />
            <label htmlFor="isOpenChecked" className="text-[10px] text-gray-400 font-bold uppercase cursor-pointer">
              ¿Abierto?
            </label>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-lime px-4 py-1.5 text-xs font-bold text-surface-900 transition-all hover:scale-105 active:scale-95"
          >
            Añadir
          </button>
        </form>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {events.map((ev) => (
          <div 
            key={ev.id} 
            className={`relative min-w-[200px] flex-shrink-0 rounded-xl border p-4 transition-all hover:bg-surface-800/80 ${
              ev.isOpen 
                ? "border-emerald-500/20 bg-emerald-500/5" 
                : "border-red-500/20 bg-red-500/5"
            }`}
          >
            <button
              onClick={() => handleDelete(ev.id)}
              className="absolute right-2 top-2 p-1 text-gray-600 hover:text-red-400 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-2 flex items-center justify-between">
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter ${
                ev.isOpen ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}>
                {ev.isOpen ? "Feriado Abierto" : "Cerrado"}
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                {format(ev.date.toDate(), "dd MMM", { locale: es })}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white truncate pr-4">{ev.title}</h4>
            <p className="mt-1 text-[10px] text-gray-500 line-clamp-2">{ev.description || "Sin descripción"}</p>
          </div>
        ))}
        {events.length === 0 && (
          <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-white/5 text-xs text-gray-600 italic">
            No hay eventos programados en el calendario.
          </div>
        )}
      </div>
    </div>
  );
}
