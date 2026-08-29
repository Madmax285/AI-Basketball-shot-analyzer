
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Truck, CheckCircle, Package, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { getStatusColor } from '@/lib/erp-logic';
import { useToast } from '@/hooks/use-toast';

export default function TrackingPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTracking, setActiveTracking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    setActiveTracking(null);

    try {
      // 1. Try Delivery ID
      const delRef = collection(firestore, 'deliveries');
      const delQuery = query(delRef, where('id', '==', searchQuery), limit(1));
      const delSnap = await getDocs(delQuery);

      if (!delSnap.empty) {
        const deliveryData = delSnap.docs[0].data();
        
        // Find associated shipment
        const shipRef = collection(firestore, 'shipments');
        const shipQuery = query(shipRef, where('deliveryId', '==', deliveryData.id), limit(1));
        const shipSnap = await getDocs(shipQuery);
        
        setActiveTracking({
          delivery: deliveryData,
          shipment: shipSnap.empty ? null : shipSnap.docs[0].data()
        });
        toast({ title: 'Tracking Found', description: `Retrieved status for ${searchQuery}` });
      } else {
        toast({ variant: 'destructive', title: 'Not Found', description: 'No matching records found for this ID.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to retrieve tracking data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { label: 'Order Created', icon: Package, status: activeTracking ? 'completed' : 'upcoming' },
    { label: 'Processing', icon: Clock, status: activeTracking?.delivery?.status === 'PROCESSING' ? 'current' : activeTracking?.delivery?.status === 'PENDING' ? 'upcoming' : 'completed' },
    { label: 'Shipped', icon: Truck, status: activeTracking?.delivery?.status === 'SHIPPED' ? 'current' : activeTracking?.delivery?.status === 'DELIVERED' ? 'completed' : 'upcoming' },
    { label: 'Delivered', icon: CheckCircle, status: activeTracking?.delivery?.status === 'DELIVERED' ? 'completed' : 'upcoming' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Delivery Tracking</h1>
        <p className="text-muted-foreground text-sm font-medium">Monitor real-time status using Delivery or Sales Order IDs.</p>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Enter Delivery ID (e.g. DEL-1001)..." 
                className="pl-10 h-14 bg-slate-50 border-none shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button className="h-14 px-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeTracking ? (
        <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="border-b border-slate-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-bold">Logistics Timeline</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Path: {activeTracking.delivery.id}</CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(activeTracking.delivery.status.toUpperCase())} px-3 py-1 text-[10px] font-black uppercase tracking-widest`}>
                    {activeTracking.delivery.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-10 pb-10">
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-100 rounded-full" />
                  <div className="space-y-10">
                    {steps.map((step, idx) => (
                      <div key={idx} className="relative flex items-center gap-6 group">
                        <div className={`relative z-10 w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all duration-300 ${
                          step.status === 'completed' ? 'bg-emerald-500 text-white scale-110' :
                          step.status === 'current' ? 'bg-blue-600 text-white animate-pulse ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-bold transition-colors ${step.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}>
                            {step.label}
                          </p>
                          {step.status !== 'upcoming' && (
                            <p className="text-[10px] text-slate-500 uppercase font-black mt-0.5 tracking-tight">
                              Updated on {format(new Date(), 'MMM dd, HH:mm')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Record Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Consignee</p>
                  <p className="text-sm font-black text-slate-900">{activeTracking.delivery.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Carrier Network</p>
                  <p className="text-sm font-black text-slate-900">{activeTracking.shipment?.carrier || 'Carrier Unassigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Waybill / Tracking</p>
                  <p className="text-sm font-black font-mono text-blue-600">{activeTracking.shipment?.trackingNumber || 'Pending Manifest'}</p>
                </div>
                <div className="pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-900 bg-slate-50 p-3 rounded-lg border">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Est. Arrival</p>
                      <p className="text-xs font-black">
                        {activeTracking.delivery.expectedDeliveryDate ? format(new Date(activeTracking.delivery.expectedDeliveryDate), 'MMM dd, yyyy') : 'No Est. Date'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
            <Package className="h-8 w-8 text-slate-200" />
          </div>
          <div>
            <p className="text-slate-900 font-bold">No active manifest search</p>
            <p className="text-slate-400 text-xs font-medium">Enter a valid ID above to initialize real-time tracking.</p>
          </div>
        </div>
      )}
    </div>
  );
}
