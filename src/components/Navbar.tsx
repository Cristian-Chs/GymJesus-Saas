"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { userProfile, logout, loading } = useAuth();

  if (loading || !userProfile) return null;

  const isAdmin = userProfile.role === "admin";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-surface-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-lime">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-surface-900"
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
          <span className="text-lg font-bold text-gray-100">
            Gym<span className="text-brand-lime">Pro</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            {userProfile.photoURL && (
              <img
                src={userProfile.photoURL}
                alt=""
                className="h-8 w-8 rounded-full border border-white/10"
              />
            )}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-200">
                {userProfile.displayName}
              </p>
              <p className="text-xs text-gray-500">
                {isAdmin ? "Administrador" : "Cliente"}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
