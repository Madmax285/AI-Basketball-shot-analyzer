
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { NavSidebar } from "@/components/nav-sidebar";
import { Toaster } from "@/components/ui/toaster";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (!isUserLoading && !user && !isAuthPage) {
      router.replace('/login');
    } else if (!isUserLoading && user && isAuthPage) {
      router.replace('/');
    }
  }, [user, isUserLoading, isAuthPage, router]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Initializing ERP Services...</p>
        </div>
      </div>
    );
  }

  if (!user && !isAuthPage) {
    return null; // Don't render shell if redirecting
  }

  if (isAuthPage) {
    return <>{children}<Toaster /></>;
  }

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
