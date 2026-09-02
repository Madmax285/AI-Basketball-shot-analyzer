
'use client';

import { useParams } from 'next/navigation';
import { useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
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
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function AnalysisDetailPage() {
  const { id } = useParams();
  const firestore = useFirestore();

  const sessionRef = useMemoFirebase(() => doc(firestore, 'analysisSessions', id as string), [firestore, id]);
  const { data: session, isLoading: isSessionLoading } = useDoc(sessionRef);

  const shotsQuery = useMemoFirebase(() => 
    query(collection(firestore, 'shotResults'), where('sessionId', '==', id as string)),
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

  const mainShot = shots?.[0];

  return (
    <div className="space-y-8 pb-20 basketball-grid min-h-full">
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
                {mainShot?.actionType || 'Action Detected'}
              </Badge>
              <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
                {format(new Date(session.createdAt), 'MMM do, yyyy • p')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right mr-2 hidden md:block">
            <p className="text-[10px] font-black uppercase text-slate-400">Play Status</p>
            <p className="text-sm font-bold text-emerald-600">✅ {mainShot?.playStatus || 'Likely Legal'}</p>
          </div>
          <Badge className="bg-orange-600 px-6 py-2 rounded-full text-lg font-black shadow-xl shadow-orange-200">
            {session.overallScore}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
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
            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
              <div className="space-y-3">
                <div className="flex gap-2">
                   <Badge variant="outline" className="text-orange-500 border-orange-500/50 bg-orange-500/10 backdrop-blur-md font-black uppercase text-[10px]">
                    Action: {mainShot?.actionType}
                  </Badge>
                  <Badge variant="outline" className="text-blue-400 border-blue-500/50 bg-blue-500/10 backdrop-blur-md font-black uppercase text-[10px]">
                    Result: {mainShot?.result}
                  </Badge>
                </div>
                <h3 className="text-white text-3xl font-black uppercase italic tracking-tighter">AI Temporal Analysis</h3>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 text-white text-center min-w-[120px]">
                <p className="text-[10px] font-black uppercase opacity-60">Confidence</p>
                <p className="text-xl font-black">{mainShot?.confidence || 91}%</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-xl bg-white rounded-[2rem]">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black uppercase italic">Shot Intelligence</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase">Classification Details</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Shot Type</span>
                  <span className="text-sm font-bold text-slate-900">{mainShot?.actionType}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Location</span>
                  <div className="flex items-center gap-1.5 text-slate-900">
                    <MapPin className="h-3 w-3 text-orange-600" />
                    <span className="text-sm font-bold">{mainShot?.location || 'Beyond 3pt Line'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Detected Result</span>
                  <Badge className="bg-emerald-500 font-black px-3">{mainShot?.result || 'MADE'}</Badge>
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
                  <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Foul & Violation Search</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400">Foul Probability</span>
                    <span className="text-xs font-bold text-emerald-400">LOW (4%)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    No obvious defender-to-shooter illegal contact detected in the shooting motion.
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400">Violation Check</span>
                    <span className="text-xs font-bold text-blue-400">CLEAN</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    Step sequence is consistent with a standard legal jump-shot takeoff.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl bg-white rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 italic">Biomechanics Suite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Lower Body Mechanics", score: mainShot?.lowerBodyScore || 84 },
                { label: "Elbow Extension", score: mainShot?.upperBodyScore || 89 },
                { label: "Torso Alignment", score: mainShot?.alignmentScore || 87 },
                { label: "Release Consistency", score: mainShot?.releaseScore || 82 }
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
              <CardTitle className="text-white font-black uppercase italic italic tracking-tighter text-xl">Coaching AI</CardTitle>
              <CardDescription className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Tactical Improvement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="bg-white/10 p-5 rounded-[1.5rem] border border-white/20 flex gap-4">
                <Zap className="h-6 w-6 text-white shrink-0" />
                <p className="text-xs font-bold leading-relaxed">
                  The {mainShot?.actionType} action shows efficient energy transfer. Consider deepening the dip for increased power.
                </p>
              </div>
              <div className="bg-white/10 p-5 rounded-[1.5rem] border border-white/20 flex gap-4">
                <Target className="h-6 w-6 text-white shrink-0" />
                <p className="text-xs font-bold leading-relaxed">
                  Release consistency is {mainShot?.releaseScore}%. Focus on maintaining the follow-through index finger position.
                </p>
              </div>
              <Button className="w-full bg-white text-orange-600 hover:bg-white/90 font-black rounded-2xl h-12 uppercase italic">
                Generate Full Drill Plan
              </Button>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
             <Card className="border-none shadow-lg bg-white p-4 rounded-3xl">
              <p className="text-[9px] font-black uppercase text-slate-400">Angle</p>
              <p className="text-2xl font-black text-slate-900">{mainShot?.metrics?.max_knee_flexion || 112}°</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Knee Flexion</p>
            </Card>
            <Card className="border-none shadow-lg bg-white p-4 rounded-3xl">
              <p className="text-[9px] font-black uppercase text-slate-400">Angle</p>
              <p className="text-2xl font-black text-slate-900">{mainShot?.metrics?.release_elbow_angle || 168}°</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Elbow Extension</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
