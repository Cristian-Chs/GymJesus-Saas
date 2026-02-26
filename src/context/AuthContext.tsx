"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { addMonths } from "date-fns";

interface AuthContextType {
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged:", user ? `Usuario: ${user.email}` : "Sin usuario");
      setFirebaseUser(user);

      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            console.log("Perfil encontrado.");
            setUserProfile({ uid: user.uid, ...snap.data() } as UserProfile);
            
            // Set cookie for middleware
            const role = snap.data().role || "client";
            document.cookie = `session=${role};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
          } else {
            console.log("Creando perfil nuevo...");
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email ?? "",
              displayName: user.displayName ?? "",
              photoURL: user.photoURL ?? "",
              role: "client",
              subscriptionEnd: Timestamp.fromDate(addMonths(new Date(), 1)),
              status: "active",
              createdAt: Timestamp.now(),
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
            document.cookie = `session=client;path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
          }
        } catch (error: any) {
          console.error("Error en Firestore:", error);
          if (error.code === "permission-denied") {
            alert("Firestore Error: Permisos denegados. Revisa la pestaña 'Reglas' en Firebase.");
          }
        }
      } else {
        setUserProfile(null);
        document.cookie = "session=;path=/;max-age=0;SameSite=Lax";
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      alert("Error: " + error.message);
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    document.cookie = "session=;path=/;max-age=0;SameSite=Lax";
    setUserProfile(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ firebaseUser, userProfile, loading, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
