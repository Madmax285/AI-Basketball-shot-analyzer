'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { initializeDemoDataset } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, AlertTriangle, CheckCircle2, Loader2, BarChart3, Target } from 'lucide-react';
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
        title: "Training Database Initialized",
        description: "Your performance history has been populated with professional benchmarks.",
      });
      setTimeout(() => router.push('/'), 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: error.message || "An error occurred while initializing performance data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 basketball-grid p-8 rounded-[3rem]">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 italic uppercase">System Studio</h1>
        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">Environment & Data Control</p>
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem] ring-1 ring-slate-100">
        <div className="bg-orange-600 h-2 w-full" />
        <CardHeader className="space-y-4">
          <div className="bg-orange-50 w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner">
            <Trophy className="h-10 w-10 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black uppercase italic italic">Initialize Athlete Dataset</CardTitle>
            <CardDescription className="text-slate-500 font-medium mt-1">
              Populate your training dashboard with a month of realistic biomechanical data to test aggregate performance metrics.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Projected Simulation Data</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Historical Sessions", count: 15, icon: BarChart3 },
                { label: "Shot Analyses", count: 45, icon: Target },
              ].map(stat => (
                <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-sm flex items-center gap-4">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <stat.icon className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 leading-none">{stat.count}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase">
              Notice: This generates 60+ Firestore documents indexed to your current session UID. This process provides the context needed for the Biometrics Suite to function.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-8">
          {isSuccess ? (
            <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-xs">
              <CheckCircle2 className="h-5 w-5" />
              Dataset Live. Redirecting to Stadium...
            </div>
          ) : (
            <Button 
              className="w-full h-14 bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-200 text-base font-black rounded-2xl uppercase italic"
              onClick={handleInitialize}
              disabled={isLoading || !user}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Calibrating Biometrics...
                </>
              ) : (
                "Deploy Performance Dataset"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}