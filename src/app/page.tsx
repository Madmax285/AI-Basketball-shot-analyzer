'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Users, 
  Truck, 
  Package, 
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { isDeliveryDelayed, getStatusColor, calculateDaysDelayed } from '@/lib/erp-logic';
import Link from 'next/link';
import { format } from 'date-fns';

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

  // Aggregations
  const totalRevenue = orders?.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0) || 0;
  const pendingOrders = orders?.filter(o => ['NEW', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length || 0;
  const lowStockCount = products?.filter(p => p.availableStock <= p.reorderLevel).length || 0;
  const totalStockValue = products?.reduce((acc, p) => acc + (p.availableStock * (p.unitPrice || 0)), 0) || 0;
  
  const delayedDeliveries = deliveries?.filter(d => 
    d.expectedDeliveryDate && isDeliveryDelayed(d.expectedDeliveryDate, d.status)
  ) || [];

  const stats = [
    { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", link: "/reports" },
    { label: "Customers", value: customers?.length || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", link: "/customers" },
    { label: "Products", value: products?.length || 0, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50", link: "/products" },
    { label: "Exceptions", value: delayedDeliveries.length + lowStockCount, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", link: "/reports" },
  ];

  // Prepare monthly sales chart data
  const monthlyData = orders?.reduce((acc: any, order) => {
    try {
      const month = format(new Date(order.orderDate), 'MMM');
      if (!acc[month]) acc[month] = 0;
      acc[month] += (order.totalAmount || 0);
    } catch (e) {
      // Handle invalid dates
    }
    return acc;
  }, {}) || {};

  const chartData = Object.keys(monthlyData).map(month => ({
    name: month,
    value: monthlyData[month]
  })).sort((a, b) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(a.name) - months.indexOf(b.name);
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Enterprise Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Real-time Sales and Distribution Metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            System Live
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Revenue Trends</CardTitle>
                <CardDescription>Monthly aggregated sales performance.</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartData.length > 0 ? (
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
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 font-medium italic">
                  No sales data available. Initialize demo dataset.
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold">Inventory Summary</CardTitle>
              {lowStockCount > 0 && <Badge variant="destructive" className="bg-red-600 text-[10px] font-black">{lowStockCount}</Badge>}
            </div>
            <CardDescription>Stock health and catalog valuation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Value</p>
                <p className="text-xl font-black text-slate-900">${totalStockValue.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total SKU</p>
                <p className="text-xl font-black text-slate-900">{products?.length || 0}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Low Stock Alerts</h3>
              {products?.filter(p => p.availableStock <= p.reorderLevel).slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.name}</p>
                      <p className="text-[9px] text-amber-700 font-black uppercase">{p.availableStock} Units Left</p>
                    </div>
                  </div>
                  <Badge className="bg-white border-amber-200 text-amber-700 text-[8px] font-black">REORDER</Badge>
                </div>
              ))}
              {lowStockCount === 0 && <p className="text-xs text-slate-400 font-medium italic py-2">All inventory levels are healthy.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-7 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Logistics Exceptions</CardTitle>
              <CardDescription>Deliveries that require immediate coordination.</CardDescription>
            </div>
            <Link href="/reports">
              <Button variant="ghost" className="text-xs font-bold text-blue-600 hover:text-blue-700">View Full Report</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Delivery ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Expected Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Delay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {delayedDeliveries.length > 0 ? (
                    delayedDeliveries.slice(0, 5).map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-blue-600 text-xs">#{d.id}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-900">{d.customerName}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {d.expectedDeliveryDate ? format(new Date(d.expectedDeliveryDate), 'MMM dd, yyyy') : '--'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[8px] font-black uppercase">{d.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-rose-600 font-black text-xs">
                            +{d.expectedDeliveryDate ? calculateDaysDelayed(d.expectedDeliveryDate) : 0} Days
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-medium italic">
                        No logistics exceptions detected at this time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
