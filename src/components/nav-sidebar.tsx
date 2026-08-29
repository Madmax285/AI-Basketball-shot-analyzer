
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UserPlus, Send, Search, AlertTriangle, Sparkles, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/register", label: "Volunteer Profile", icon: UserPlus },
  { href: "/post-mission", label: "Mission Posting", icon: Send },
  { href: "/matches", label: "AI Matching", icon: Search },
  { href: "/emergency", label: "Emergency Mode", icon: AlertTriangle },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <aside className="w-64 border-r bg-white/50 backdrop-blur-sm h-screen sticky top-0 flex flex-col">
      <div className="p-6 flex-1">
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
      
      <div className="p-4 border-t bg-secondary/10">
        {!isUserLoading && user ? (
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {user.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user.email || 'Guest User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">Signed in</p>
            </div>
          </div>
        ) : null}
        
        {user ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        ) : (
          <Link href="/login">
            <Button size="sm" className="w-full gap-2">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
        )}
        
        <p className="text-[10px] text-muted-foreground text-center mt-4">
          © 2024 VolunteerBridge AI
        </p>
      </div>
    </aside>
  );
}
