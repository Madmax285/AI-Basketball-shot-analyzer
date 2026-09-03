'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Upload, 
  History, 
  Activity,
  Trophy,
  BookOpen,
  Target,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Analyze Shot", icon: Upload },
  { href: "/history", label: "Session History", icon: History },
  { href: "/metrics", label: "Biometrics Suite", icon: Activity },
];

export function NavSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "Your session has ended." });
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <aside className="w-64 border-r bg-slate-950 text-slate-300 h-screen sticky top-0 flex flex-col">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-900/20">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
            Basketball<br/><span className="text-orange-500">AI Analyzer</span>
          </h1>
        </div>
        
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                pathname === item.href
                  ? "bg-orange-600 text-white shadow-md shadow-orange-900/30"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              )}
            >
              <item.icon className={cn("h-4 w-4", pathname === item.href ? "text-white" : "text-orange-500")} />
              {item.label}
            </Link>
          ))}
          
          <div className="pt-8 pb-2 px-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Resources</p>
          </div>
          
          <Link
            href="/methodology"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              pathname === "/methodology"
                ? "bg-orange-600 text-white shadow-md"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            )}
          >
            <BookOpen className="h-4 w-4 text-orange-500" />
            Methodology
          </Link>
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-900 bg-black/40 space-y-4">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase text-white">System Status</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold">
              <span className="text-slate-500">POSE ENGINE</span>
              <span className="text-emerald-500">ACTIVE</span>
            </div>
            <div className="flex justify-between text-[9px] font-bold">
              <span className="text-slate-500">GENKIT AI</span>
              <span className="text-emerald-500">ONLINE</span>
            </div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl gap-3 h-11 text-xs font-bold"
        >
          <LogOut className="h-4 w-4" />
          End Session
        </Button>
      </div>
    </aside>
  );
}
