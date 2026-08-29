
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShoppingBag, Truck, FileText, Download } from 'lucide-react';
import { getStatusColor, isDeliveryDelayed, calculateDaysDelayed } from '@/lib/erp-logic';
import { format } from 'date-fns';

export default function ReportsPage() {
  const firestore = useFirestore();
  
  const ordersQuery = useMemoFirebase(() => collection(firestore, 'salesOrders'), [firestore]);
  const deliveriesQuery = useMemoFirebase(() => collection(firestore, 'deliveries'), [firestore]);
  
  const { data: orders } = useCollection(ordersQuery);
  const { data: deliveries } = useCollection(deliveriesQuery);

  const delayedDeliveries = deliveries?.filter(d => 
    d.expectedDeliveryDate && isDeliveryDelayed(d.expectedDeliveryDate, d.status)
  ) || [];

  const salesByStatus = [
    { name: 'New', count: orders?.filter(o => o.status === 'NEW').length || 0 },
    { name: 'Confirmed', count: orders?.filter(o => o.status === 'CONFIRMED').length || 0 },
    { name: 'Processing', count: orders?.filter(o => o.status === 'PROCESSING').length || 0 },
    { name: 'Completed', count: orders?.filter(o => o.status === 'COMPLETED').length || 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Enterprise Reports</h1>
          <p className="text-muted-foreground">Strategic analytics and business intelligence summaries.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
          <Download className="h-4 w-4" />
          Export All Data
        </button>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="bg-slate-100 p-1 mb-8">
          <TabsTrigger value="sales" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ShoppingBag className="h-4 w-4" /> Sales Analysis
          </TabsTrigger>
          <TabsTrigger value="logistics" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Truck className="h-4 w-4" /> Logistics Exceptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Order Distribution</CardTitle>
                <CardDescription>Sales orders by current processing status.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByStatus}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {salesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#64748b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-white/80 text-xs font-black uppercase tracking-widest">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                <div>
                  <p className="text-4xl font-black">${orders?.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}</p>
                  <p className="text-xs font-bold text-white/60 uppercase mt-1">Total Sales Value</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{orders?.length || 0}</p>
                    <p className="text-[10px] font-bold text-white/50 uppercase">Total Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${orders?.length ? Math.round(orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0) / orders.length).toLocaleString() : 0}</p>
                    <p className="text-[10px] font-bold text-white/50 uppercase">Avg Order Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logistics" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Delayed Deliveries Report</CardTitle>
                  <CardDescription>Shipments that have exceeded their expected delivery date.</CardDescription>
                </div>
                <Badge variant="destructive" className="bg-red-600">{delayedDeliveries.length} Exceptions</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold">Delivery ID</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Expected Date</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Days Delayed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {delayedDeliveries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                        All deliveries are currently on schedule.
                      </TableCell>
                    </TableRow>
                  ) : (
                    delayedDeliveries.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-bold text-blue-600">{d.id.toUpperCase()}</TableCell>
                        <TableCell className="font-medium">{d.customerName}</TableCell>
                        <TableCell className="text-slate-600">
                          {d.expectedDeliveryDate ? format(new Date(d.expectedDeliveryDate), 'MMM dd, yyyy') : '--'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor('DELAYED')}>DELAYED</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-red-600 font-black">
                            {d.expectedDeliveryDate ? calculateDaysDelayed(d.expectedDeliveryDate) : 0} Days
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
