import { db } from "../src/lib/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

const plans = [
  {
    id: "plan_basico",
    name: "Rutina Básica de Gym",
    description: "Ideal para principiantes que buscan familiarizarse con las máquinas.",
    exercises: [
      { name: "Press de Pecho (Máquina)", sets: 3, reps: "12", restSeconds: 60, notes: "Movimiento controlado" },
      { name: "Prensa de Piernas", sets: 3, reps: "15", restSeconds: 90 },
      { name: "Remo en Polea Baja", sets: 3, reps: "12", restSeconds: 60 }
    ],
    diet: [
      {
        day: "Lunes",
        meals: [
          { time: "08:00", name: "Desayuno", foods: ["Avena con frutas", "Huevos revueltos"], calories: 450 },
          { time: "13:00", name: "Almuerzo", foods: ["Pollo a la plancha", "Arroz blanco", "Ensalada"], calories: 600 }
        ]
      }
    ],
    createdAt: Timestamp.now()
  },
  {
    id: "plan_pro",
    name: "Entrenamiento Pro - Hipertrofia",
    description: "Enfocado en el crecimiento muscular y fuerza avanzada.",
    exercises: [
      { name: "Press de Banca con Barra", sets: 4, reps: "8-10", restSeconds: 90, notes: "Carga pesada" },
      { name: "Sentadillas Libres", sets: 4, reps: "10", restSeconds: 120 },
      { name: "Dominadas", sets: 3, reps: "Fallo", restSeconds: 90 }
    ],
    diet: [
      {
        day: "Lunes",
        meals: [
          { time: "07:00", name: "Pre-entreno", foods: ["Banano", "Café negro"], calories: 150 },
          { time: "12:00", name: "Comida Post-entreno", foods: ["Atún", "Camote", "Aguacate"], calories: 700 }
        ]
      }
    ],
    createdAt: Timestamp.now()
  },
  {
    id: "plan_elite",
    name: "Elite Performance & Nutrition",
    description: "Plan integral con seguimiento de alta intensidad y nutrición optimizada.",
    exercises: [
      { name: "Peso Muerto", sets: 5, reps: "5", restSeconds: 180, notes: "Enfoque en técnica" },
      { name: "Clean & Jerk", sets: 4, reps: "6", restSeconds: 120 },
      { name: "Sprints en Cinta", sets: 10, reps: "30s", restSeconds: 30, notes: "HIIT" }
    ],
    diet: [
      {
        day: "Lunes",
        meals: [
          { time: "06:00", name: "Desayuno Elite", foods: ["Tortilla de claras", "Salmón", "Espárragos"], calories: 550 },
          { time: "20:00", name: "Cena Recuperadora", foods: ["Corte de Res", "Quinoa", "Brócoli"], calories: 800 }
        ]
      }
    ],
    createdAt: Timestamp.now()
  }
];

async function seed() {
  console.log("Iniciando carga de planes...");
  for (const plan of plans) {
    try {
      await setDoc(doc(db, "plans", plan.id), plan);
      console.log(`✅ Plan cargado: ${plan.id}`);
    } catch (e) {
      console.error(`❌ Error cargando ${plan.id}:`, e);
    }
  }
  console.log("Proceso finalizado.");
}

seed();
