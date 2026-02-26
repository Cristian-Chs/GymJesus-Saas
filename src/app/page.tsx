"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!userProfile) {
      router.replace("/login");
    } else if (userProfile.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  }, [userProfile, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-lime border-t-transparent" />
        <p className="text-sm text-gray-500">Redirigiendo…</p>
      </div>
    </div>
  );
}
