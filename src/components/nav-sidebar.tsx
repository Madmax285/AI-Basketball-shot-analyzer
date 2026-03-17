
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserPlus, Send, Search, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/register", label: "Volunteer Registration", icon: UserPlus },
  { href: "/post-mission", label: "Mission Posting", icon: Send },
  { href: "/matches", label: "AI Matching", icon: Search },
  { href: "/emergency", label: "Emergency Mode", icon: AlertTriangle },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white/50 backdrop-blur-sm h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary p-1.5 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">
            VolunteerBridge
          </h1>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t bg-secondary/30">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 VolunteerBridge AI
        </p>
      </div>
    </aside>
  );
}
