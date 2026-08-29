
"use client";

import { NavSidebar } from "@/components/nav-sidebar";
import { Toaster } from "@/components/ui/toaster";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <NavSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
