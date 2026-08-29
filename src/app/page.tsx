
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ShoppingBag, 
  Users, 
  Truck, 
  Package, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { isDeliveryDelayed, getStatusColor } from '@/lib/erp-logic';
import Link from 'next/link';

export default function Dashboard() {
  const firestore = useFirestore();
  
  const ordersQuery = useMemoFirebase(() => collection(firestore, 'salesOrders'), [firestore]);
  const customersQuery = useMemoFirebase(() => collection(firestore, 'customers'), [firestore]);
  const deliveriesQuery = useMemoFirebase(() => collection(firestore, 'deliveries'), [firestore]);
  const productsQuery = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  
  const { data: orders } = useCollection(ordersQuery);
  const { data: customers } = useCollection(customersQuery);
  const { data: deliveries } = useCollection(deliveriesQuery);
  const { data: products } = useCollection(productsQuery);

  // Real-time aggregations
  const totalRevenue = orders?.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === 'NEW' || o.status === 'CONFIRMED').length || 0;
  const activeDeliveries = deliveries?.filter(d => d.status !== 'DELIVERED' && d.status !== 'CANCELLED').length || 0;
  const lowStockCount = products?.filter(p => p.availableStock <= p.reorderLevel).length || 0;
  
  const delayedDeliveries = deliveries?.filter(d => 
    d.expectedDeliveryDate && isDeliveryDelayed(d.expectedDeliveryDate, d.status)
  ) || [];

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", link: "/reports" },
    { label: "Customers", value: customers?.length || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", link: "/customers" },
    { label: "Pending Orders", value: pendingOrders, icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50", link: "/sales-orders" },
    { label: "Inventory Alerts", value: lowStockCount, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", link: "/products" },
  ];

  // Simulated chart data based on real volume if available
  const chartData = [
    { name: "Mon", value: orders?.filter(o => new Date(o.orderDate).getDay() === 1).length * 1000 || 2400 },
    { name: "Tue", value: 3000 },
    { name: "Wed", value: 2000 },
    { name: "Thu", value: 2780 },
    { name: "Fri", value: 1890 },
    { name: "Sat", value: 2390 },
    { name: "Sun", value: 3490 },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ERP Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Real-time Sales and Distribution Metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            Connected to Firestore
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link href={stat.link} key={stat.label}>
            <Card className="border-none shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Revenue Trends</CardTitle>
            <CardDescription>Daily sales performance visualization.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold">Priority Actions</CardTitle>
              <Badge variant="destructive" className="bg-red-600 text-[10px] font-black">{delayedDeliveries.length + lowStockCount}</Badge>
            </div>
            <CardDescription>Immediate logistics and inventory attention required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {delayedDeliveries.length > 0 ? (
              delayedDeliveries.slice(0, 3).map((d) => (
                <Link href="/reports" key={d.id}>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors mb-2">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{d.id.substring(0, 10)}</p>
                        <p className="text-[10px] text-red-700 font-bold uppercase">Delayed Delivery</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-red-200 text-red-700 bg-white">
                      Action Req
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs font-medium">Logistics are on schedule.</p>
              </div>
            )}
            
            {lowStockCount > 0 && (
              <Link href="/products">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3 hover:bg-amber-100 transition-colors mt-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">Inventory Alert</p>
                    <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight">{lowStockCount} items below threshold</p>
                  </div>
                </div>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
