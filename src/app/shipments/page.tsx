'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Ship, Filter, MoreHorizontal, Box } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ShipmentsPage() {
  const firestore = useFirestore();
  const shipmentsQuery = useMemoFirebase(() => collection(firestore, 'shipments'), [firestore]);
  const { data: shipments, isLoading } = useCollection(shipmentsQuery);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Consolidated Shipments</h1>
          <p className="text-muted-foreground">Manage bulk transport groupings and vehicle assignments.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Ship className="h-4 w-4" />
          Plan Shipment
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search Shipments..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Fleet
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold">Shipment ID</TableHead>
                  <TableHead className="font-semibold">Vehicle / Fleet</TableHead>
                  <TableHead className="font-semibold">Departure</TableHead>
                  <TableHead className="font-semibold">Arrival (Est.)</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                      Loading shipment schedule...
                    </TableCell>
                  </TableRow>
                ) : shipments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400 text-sm">
                      No shipments scheduled.
                    </TableCell>
                  </TableRow>
                ) : (
                  shipments?.map((shipment) => (
                    <TableRow key={shipment.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-xs font-bold text-slate-900">
                        SHP-{shipment.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium">{shipment.vehicleId || 'Unassigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {shipment.departureDate ? format(new Date(shipment.departureDate), 'MMM dd, HH:mm') : 'Planned'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {shipment.arrivalDate ? format(new Date(shipment.arrivalDate), 'MMM dd, HH:mm') : '--'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className={cn(
                          "text-[10px] uppercase font-bold",
                          shipment.status === 'Arrived' ? 'bg-emerald-500' : 
                          shipment.status === 'Departed' ? 'bg-blue-500' :
                          shipment.status === 'Loaded' ? 'bg-orange-500' : 'bg-slate-400'
                        )}>
                          {shipment.status}
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
