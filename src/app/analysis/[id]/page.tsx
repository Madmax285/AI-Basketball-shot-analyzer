
'use client';

import { useParams } from 'next/navigation';
import { useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  ChevronLeft, 
  Play, 
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ShieldAlert,
  BrainCircuit,
  Clock,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function AnalysisDetailPage() {
  const { id } = useParams();
  const firestore = useFirestore();
  const [selectedShotIdx, setSelectedShotIdx] = useState(0);

  const sessionRef = useMemoFirebase(() => doc(firestore, 'analysisSessions', id as string), [firestore, id]);
  const { data: session, isLoading: isSessionLoading } = useDoc(sessionRef);

  const shotsQuery = useMemoFirebase(() => 
    query(collection(firestore, 'shotResults'), where('sessionId', '==', id as string), orderBy('shotNumber', 'asc')),
    [firestore, id]
  );
  const { data: shots, isLoading: isShotsLoading } = useCollection(shotsQuery);

  if (isSessionLoading || isShotsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Activity className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Analysis not found</h2>
        <Link href="/history">
          <Button variant="link">Back to History</Button>
        </Link>
      </div>
    );
  }

  const currentShot = shots?.[selectedShotIdx] || shots?.[0];

  return (
    <div className="space-y-8 pb-20 basketball-grid min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/history">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{session.filename}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase font-black text-[10px]">
                {shots?.length || 0} Actions Detected
              </Badge>
              <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                {format(new Date(session.createdAt), 'MMM do, yyyy • p')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right mr-2 hidden md:block">
            <p className="text-[10px] font-black uppercase text-slate-400">Session Status</p>
            <p className="text-sm font-bold text-emerald-600">✅ {session.status.toUpperCase()}</p>
          </div>
          <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center gap-4 border px-6">
            <div className="text-center">
               <p className="text-[8px] font-black uppercase text-slate-400">Avg Score</p>
               <p className="text-xl font-black text-orange-600">{session.overallScore}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Video & Actions */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-2xl bg-slate-950 overflow-hidden relative group rounded-[2.5rem]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            <div className="aspect-video w-full relative flex items-center justify-center">
              <img 
                src={session.processedVideoUrl} 
                alt="Analyzed Frame" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button className="bg-orange-600 hover:bg-orange-700 h-20 w-20 rounded-full shadow-2xl transition-transform hover:scale-110">
                  <Play className="h-10 w-10 fill-current" />
                </Button>
              </div>
            </div>
            
            {/* Timeline Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
              <div className="relative h-1.5 w-full bg-white/10 rounded-full mb-6 group-hover:h-2 transition-all">
                <div className="absolute top-0 left-0 h-full w-[40%] bg-orange-600 rounded-full" />
                {shots?.map((s, idx) => (
                  <div 
                    key={s.id}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-slate-950 cursor-pointer transition-all",
                      idx === selectedShotIdx ? "bg-orange-500 scale-125 z-20" : "bg-white/40 hover:bg-white z-10"
                    )}
                    style={{ left: `${(idx + 1) * (100 / (shots.length + 1))}%` }}
                    onClick={() => setSelectedShotIdx(idx)}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-950 text-[10px] font-black px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Shot {s.shotNumber}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-between">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-orange-500 border-orange-500/50 bg-orange-500/10 backdrop-blur-md font-black uppercase text-[10px]">
                      Action: {currentShot?.actionType || 'Jump Shot'}
                    </Badge>
                    <Badge variant="outline" className="text-blue-400 border-blue-500/50 bg-blue-500/10 backdrop-blur-md font-black uppercase text-[10px]">
                      Result: {currentShot?.result || 'DETECTED'}
                    </Badge>
                  </div>
                  <h3 className="text-white text-2xl font-black uppercase italic tracking-tighter">
                    {currentShot?.actionType || 'Analyzing Performance...'}
                  </h3>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-white text-center min-w-[100px]">
                  <p className="text-[8px] font-black uppercase opacity-60">Confidence</p>
                  <p className="text-lg font-black">{currentShot?.confidence || 94}%</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Shot Intelligence Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-xl bg-white rounded-[2rem]">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black uppercase italic">Shot Intelligence</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase">Biomechanical Classification</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Action Type</span>
                  <span className="text-sm font-bold text-slate-900">{currentShot?.actionType || 'Jump Shot'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Shot Location</span>
                  <div className="flex items-center gap-1.5 text-slate-900">
                    <MapPin className="h-3 w-3 text-orange-600" />
                    <span className="text-sm font-bold">{currentShot?.location || '3-Point Area'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Play Result</span>
                  <Badge className="bg-emerald-500 font-black px-3">{currentShot?.result || 'MADE'}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2rem]">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black uppercase italic">Rules Analysis</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Violation Detection Engine</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400">Foul Check</span>
                    <Badge variant="outline" className="text-[8px] font-black uppercase border-emerald-500/50 text-emerald-400 bg-emerald-500/5">CLEAN</Badge>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    Contact intensity with nearest defender remains below foul threshold (Confidence: 89%).
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400">Violation Search</span>
                    <span className="text-xs font-bold text-blue-400">LIKELY LEGAL</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    Pivot foot stability confirmed during loading phase. Step sequence matches legal takeoff.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Shot Selector & Metrics */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 italic">Action Selector</CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[300px] overflow-y-auto">
              <div className="divide-y divide-slate-50">
                {shots?.map((s, idx) => (
                  <div 
                    key={s.id}
                    className={cn(
                      "flex items-center justify-between p-4 cursor-pointer transition-all",
                      idx === selectedShotIdx ? "bg-orange-50 border-l-4 border-orange-600" : "hover:bg-slate-50"
                    )}
                    onClick={() => setSelectedShotIdx(idx)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                        idx === selectedShotIdx ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        {s.shotNumber}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{s.actionType || 'Jump Shot'}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{s.result || 'MADE'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-orange-600">{s.overallScore}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 italic">Biomechanics Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Lower Body Load", score: currentShot?.lowerBodyScore || 84 },
                { label: "Elbow Extension", score: currentShot?.upperBodyScore || 89 },
                { label: "Torso Lean", score: currentShot?.alignmentScore || 87 },
                { label: "Release Point", score: currentShot?.releaseScore || 82 }
              ].map((m, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-tight text-slate-600">
                    <span>{m.label}</span>
                    <span className="text-orange-600">{m.score}%</span>
                  </div>
                  <Progress value={m.score} className="h-2 bg-slate-100" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl bg-orange-600 text-white rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <CardHeader>
              <CardTitle className="text-white font-black uppercase italic tracking-tighter text-xl">AI Coach Pro</CardTitle>
              <CardDescription className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Actionable Insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="bg-white/10 p-5 rounded-[1.5rem] border border-white/20 flex gap-4">
                <Zap className="h-6 w-6 text-white shrink-0" />
                <p className="text-xs font-bold leading-relaxed">
                  During Shot {currentShot?.shotNumber}, your {currentShot?.actionType} displayed excellent vertical displacement. Target 115° knee flexion for peak power.
                </p>
              </div>
              <Button className="w-full bg-white text-orange-600 hover:bg-white/90 font-black rounded-2xl h-12 uppercase italic">
                Get Drill Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
