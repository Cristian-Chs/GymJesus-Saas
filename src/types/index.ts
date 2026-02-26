import { Timestamp } from "firebase/firestore";

// ─── User ─────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: "admin" | "client";
  subscriptionEnd: Timestamp;
  status: "active" | "inactive";
  planId?: string;
  membershipTier?: "basico" | "pro" | "elite";
  cancelAtEnd?: boolean;
  createdAt: Timestamp;
}

// ─── Payment ──────────────────────────────────────────
export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  date: Timestamp;
  method: string;
  details?: string;
  status: "pending" | "completed" | "rejected";
  tier?: string;
  planId?: string;
}

// ─── Plan ─────────────────────────────────────────────
export interface Exercise {
  name: string;
  sets: number;
  reps: string;       // e.g. "8-12"
  restSeconds: number;
  notes?: string;
}

export interface DietMeal {
  time: string;        // e.g. "07:00"
  name: string;        // e.g. "Desayuno"
  foods: string[];
  calories?: number;
}

export interface DietDay {
  day: string;         // e.g. "Lunes"
  meals: DietMeal[];
}

// ─── Notification ─────────────────────────────────────
export interface AdminNotification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  tier: string;
  planId?: string;
  date: Timestamp;
  read: boolean;
  type: string;
  method?: string;
  details?: string;
  paymentId?: string;
  paymentStatus?: "pending" | "completed" | "rejected";
}

export interface GymEvent {
  id: string;
  date: any; // Timestamp
  title: string;
  description: string;
  isOpen: boolean; // false if gym is closed
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  diet: DietDay[];
  createdAt: Timestamp;
}
