'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Filter, MoreHorizontal, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function SalesOrdersPage() {
  const firestore = useFirestore();
  const ordersQuery = useMemoFirebase(() => collection(firestore, 'salesOrders'), [firestore]);
  const { data: orders, isLoading } = useCollection(ordersQuery);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'default';
      case 'Shipped': return 'secondary';
      case 'Delivered': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sales Orders</h1>
          <p className="text-muted-foreground">Monitor and manage customer purchase requests and transactions.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <ShoppingCart className="h-4 w-4" />
          New Sales Order
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search orders..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold">Order ID</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Order Date</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                      Fetching sales records...
                    </TableCell>
                  </TableRow>
                ) : orders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400 text-sm">
                      No sales orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders?.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-blue-600">
                        #{order.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-semibold text-slate-900">{order.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">UID: {order.customerId.substring(0, 8)}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Calendar className="h-3 w-3" />
                          {order.orderDate ? format(new Date(order.orderDate), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono font-bold">
                        ${order.totalAmount?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)} className="text-[10px] uppercase font-bold px-2 py-0.5">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
