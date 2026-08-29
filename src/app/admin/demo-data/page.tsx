
'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { initializeDemoDataset } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function DemoDataPage() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInitialize = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await initializeDemoDataset(firestore, user.uid);
      setIsSuccess(true);
      toast({
        title: "Database Initialized",
        description: "Realistic ERP dataset has been seeded into Firestore.",
      });
      setTimeout(() => router.push('/'), 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: error.message || "An error occurred while initializing data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Administration</h1>
        <p className="text-muted-foreground font-medium">System configuration and data management.</p>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <div className="bg-blue-600 h-2 w-full" />
        <CardHeader className="space-y-4">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center">
            <Database className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Initialize Demo Dataset</CardTitle>
            <CardDescription className="text-slate-500 font-medium mt-1">
              Populate your Firestore database with a comprehensive, realistic set of business records for demonstration purposes.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Records to be created</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Customers", count: 25 },
                { label: "Products", count: 40 },
                { label: "Sales Orders", count: 35 },
                { label: "Order Items", count: 70 },
                { label: "Deliveries", count: 30 },
                { label: "Shipments", count: 25 },
              ].map(stat => (
                <div key={stat.label} className="bg-white p-3 rounded-xl border border-slate-200/50 shadow-sm">
                  <p className="text-xl font-black text-slate-900">{stat.count}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-amber-800 leading-relaxed">
              <strong>Warning:</strong> This operation will add approximately 200+ documents to your Cloud Firestore. It will not delete existing records but may clutter your workspace if run multiple times.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6">
          {isSuccess ? (
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
              Success! Redirecting to Dashboard...
            </div>
          ) : (
            <Button 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 text-base font-bold"
              onClick={handleInitialize}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Writing to Firestore...
                </>
              ) : (
                "Execute System Initialization"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
