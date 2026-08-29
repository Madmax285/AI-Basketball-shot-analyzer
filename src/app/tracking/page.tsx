
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Truck, CheckCircle, Package, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getStatusColor } from '@/lib/erp-logic';

export default function TrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTracking, setActiveTracking] = useState<any>(null);
  const firestore = useFirestore();

  // Search logic
  const handleSearch = async () => {
    // In a real app, we'd query multiple collections. For prototype, we search deliveries.
    // We fetch all and filter in memory for speed in this demo
  };

  const steps = [
    { label: 'Order Created', icon: Package, status: 'completed' },
    { label: 'Confirmed', icon: CheckCircle, status: 'completed' },
    { label: 'Processing', icon: Clock, status: 'current' },
    { label: 'Shipped', icon: Truck, status: 'upcoming' },
    { label: 'Delivered', icon: MapPin, status: 'upcoming' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Delivery Tracking</h1>
        <p className="text-muted-foreground">Monitor the real-time status of your shipments.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Enter Delivery ID, Order ID or Tracking Number..." 
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700" onClick={handleSearch}>
              Track
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Tracking Timeline</CardTitle>
                  <CardDescription>Status history for DEL1001</CardDescription>
                </div>
                <Badge className={getStatusColor('PROCESSING')}>PROCESSING</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100" />
                
                <div className="space-y-8">
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-6 group">
                      <div className={`relative z-10 w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-colors ${
                        step.status === 'completed' ? 'bg-emerald-500 text-white' :
                        step.status === 'current' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 pt-2">
                        <p className={`text-sm font-bold ${step.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}>
                          {step.label}
                        </p>
                        {step.status !== 'upcoming' && (
                          <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">
                            {format(new Date(), 'MMM dd, HH:mm')}
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
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-500 uppercase">Shipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Customer</p>
                <p className="text-sm font-bold">Acme Corp Solutions</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Carrier</p>
                <p className="text-sm font-bold">Logistics Express</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Tracking #</p>
                <p className="text-sm font-bold font-mono">TRK-990-221-X</p>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-blue-600">
                  <Calendar className="h-4 w-4" />
                  <p className="text-xs font-bold">Est: Oct 28, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
