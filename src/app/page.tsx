
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingBag, Users, Truck, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const firestore = useFirestore();
  
  const ordersQuery = useMemoFirebase(() => collection(firestore, 'salesOrders'), [firestore]);
  const customersQuery = useMemoFirebase(() => collection(firestore, 'customers'), [firestore]);
  const deliveriesQuery = useMemoFirebase(() => collection(firestore, 'deliveries'), [firestore]);
  
  const { data: orders } = useCollection(ordersQuery);
  const { data: customers } = useCollection(customersQuery);
  const { data: deliveries } = useCollection(deliveriesQuery);

  const totalRevenue = orders?.reduce((acc, o) => acc + (o.totalAmount || 0), 0) || 0;
  const pendingDeliveries = deliveries?.filter(d => d.status === 'Pending').length || 0;

  const chartData = [
    { name: "Mon", value: 4000 },
    { name: "Tue", value: 3000 },
    { name: "Wed", value: 2000 },
    { name: "Thu", value: 2780 },
    { name: "Fri", value: 1890 },
    { name: "Sat", value: 2390 },
    { name: "Sun", value: 3490 },
  ];

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Sales Orders", value: orders?.length || 0, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Customers", value: customers?.length || 0, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Pending Deliveries", value: pendingDeliveries, icon: Truck, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Enterprise Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time oversight of sales performance and supply chain logistics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Live System Data
          </Badge>
          <Badge className="bg-blue-600">Q1 Period</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm overflow-hidden group">
            <div className={`h-1 w-full ${stat.color.replace('text', 'bg')}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.label}</CardTitle>
              <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Projection</CardTitle>
            <CardDescription>Daily sales volume and financial performance tracking.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Priority Shipments</CardTitle>
              <Badge variant="secondary" className="bg-red-500/10 text-red-600">Critical</Badge>
            </div>
            <CardDescription>Deliveries requiring immediate intervention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg border shadow-sm">
                    <Truck className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">ORD-2024-{1000 + i}</p>
                    <p className="text-xs text-slate-500">Expedited Shipping</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-orange-600">Pending</p>
                  <p className="text-[10px] text-slate-400">Due in 2h</p>
                </div>
              </div>
            ))}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mt-6 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900">System Notice</p>
                <p className="text-xs text-blue-700">Inventory levels for "SKU-990" are critically low across North regions.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
