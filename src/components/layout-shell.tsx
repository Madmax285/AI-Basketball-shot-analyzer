
"use client";

import { NavSidebar } from "@/components/nav-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Trophy, Activity } from 'lucide-react';
import { useUser } from '@/firebase';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isUserLoading } = useUser();

  // Removed authentication redirection logic to allow direct access to the analyzer.
  
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-[2rem] bg-orange-600 animate-bounce shadow-2xl shadow-orange-500/50 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/20 blur-md rounded-full" />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-lg font-black text-white uppercase tracking-[0.3em]">Basketball AI</p>
            <div className="flex items-center gap-2 mt-2">
              <Activity className="h-3 w-3 text-orange-500 animate-pulse" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initialising Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <NavSidebar />
      <main className="flex-1 overflow-y-auto max-h-screen">
        <div className="container mx-auto px-8 py-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
