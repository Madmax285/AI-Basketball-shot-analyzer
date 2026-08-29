'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Truck, 
  Ship,
  Globe, 
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/products", label: "Products", icon: Package },
  { href: "/sales-orders", label: "Sales Orders", icon: ShoppingCart },
  { href: "/deliveries", label: "Deliveries", icon: Truck },
  { href: "/shipments", label: "Shipments", icon: Ship },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Sales & Delivery
          </h1>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                pathname === item.href
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex flex-col gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Settings className="h-4 w-4" />
            <span className="text-xs">System Settings</span>
          </Button>
        </div>
        
        <p className="text-[10px] text-slate-600 text-center mt-6 uppercase tracking-widest font-bold">
          ERP Prototyper v1.0
        </p>
      </div>
    </aside>
  );
}
