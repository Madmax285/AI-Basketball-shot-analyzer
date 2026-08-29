'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Truck, Filter, MoreHorizontal, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DeliveriesPage() {
  const firestore = useFirestore();
  const deliveriesQuery = useMemoFirebase(() => collection(firestore, 'deliveries'), [firestore]);
  const { data: deliveries, isLoading } = useCollection(deliveriesQuery);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Deliveries</h1>
          <p className="text-muted-foreground">Track order fulfillment and logistics status in real-time.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Truck className="h-4 w-4" />
          Assign Courier
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by Order ID or Carrier..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold">Delivery ID</TableHead>
                  <TableHead className="font-semibold">Sales Order</TableHead>
                  <TableHead className="font-semibold">Carrier / Tracking</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                      Syncing delivery data...
                    </TableCell>
                  </TableRow>
                ) : deliveries?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400 text-sm">
                      No active deliveries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveries?.map((delivery) => (
                    <TableRow key={delivery.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-xs font-bold text-slate-900">
                        {delivery.id.substring(0, 10).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-blue-600">
                        #{delivery.orderId.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-semibold text-slate-900">{delivery.carrier || 'Pending'}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{delivery.trackingNumber || 'No tracking available'}</p>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {delivery.deliveryDate ? format(new Date(delivery.deliveryDate), 'MMM dd, HH:mm') : 'Unscheduled'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase font-bold",
                          delivery.status === 'In Transit' ? 'border-blue-500 text-blue-600 bg-blue-50' :
                          delivery.status === 'Delivered' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' :
                          'border-slate-200 text-slate-500'
                        )}>
                          {delivery.status}
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
