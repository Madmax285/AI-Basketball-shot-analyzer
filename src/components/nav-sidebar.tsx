
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Upload, 
  History, 
  Settings,
  LogOut,
  User as UserIcon,
  Activity,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Analyze Shot", icon: Upload },
  { href: "/history", label: "Analysis History", icon: History },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/login');
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Advanced</p>
          </div>
          
          <Link
            href="/metrics"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              pathname === "/metrics"
                ? "bg-orange-600 text-white shadow-md"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            )}
          >
            <Activity className="h-4 w-4 text-orange-500" />
            Biomechanics
          </Link>
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-900 bg-black/40 space-y-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 bg-slate-800 border border-slate-700">
              <AvatarFallback className="text-xs font-bold text-orange-500">
                {user.email?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.email}</p>
              <p className="text-[10px] text-orange-600 uppercase font-black tracking-widest">Athlete</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-900 h-9 rounded-lg"
          >
            <Settings className="h-4 w-4" />
            <span className="text-xs font-medium">Settings</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="justify-start gap-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 h-9 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-medium">Sign Out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
