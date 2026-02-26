"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { userProfile, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile) {
      if (userProfile.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [userProfile, loading, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-lime/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-brand-neon/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-lime shadow-glow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-surface-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-100">
            Gym<span className="text-brand-lime">Pro</span>
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Gestión profesional de tu gimnasio
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/5 bg-surface-800/80 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="mb-2 text-center text-xl font-semibold text-gray-100">
            Inicia sesión
          </h2>
          <p className="mb-6 text-center text-sm text-gray-500">
            Usa tu cuenta de Google para acceder a la plataforma
          </p>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-surface-700 px-6 py-3.5 text-sm font-semibold text-gray-200 transition-all hover:border-brand-lime/30 hover:bg-surface-600 hover:shadow-glow active:scale-[0.98] disabled:cursor-wait disabled:opacity-50"
          >
            {/* Google icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? "Conectando…" : "Continuar con Google"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          Al iniciar sesión, aceptas los términos y condiciones de GymPro.
        </p>
      </div>
    </div>
  );
}
