"use client";

import AdminSidebar from "@/components/AdminSidebar";
import React, { useState } from "react";
import { Menu } from "@/components/Icons";
import { AdminProvider } from "@/context/AdminContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-surface-900">
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header Toggle */}
          <header className="flex h-16 items-center border-b border-white/5 bg-[#121212]/50 px-4 backdrop-blur-md lg:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1 text-center">
              <span className="text-sm font-bold tracking-tight text-white uppercase italic">Power<span className="text-brand-primary">Gym</span></span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
