
'use client';

import { useParams } from 'next/navigation';
import { useDoc, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Activity, 
  AlertCircle, 
  ChevronLeft, 
  Play, 
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/history">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{session.filename}</h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">
              Analyzed on {format(new Date(session.createdAt), 'MMMM do, yyyy • p')}
            </p>
          </div>
        </div>
        <Badge className="bg-orange-600 px-4 py-1 rounded-full text-sm font-black shadow-lg shadow-orange-200">
          Form Score: {session.overallScore}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-2xl bg-slate-950 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          <div className="aspect-video w-full relative flex items-center justify-center">
            {/* Mocking video display with a placeholder image */}
            <img 
              src={session.processedVideoUrl} 
              alt="Analyzed Frame" 
              className="w-full h-full object-cover opacity-60"
            />
            <Button className="absolute z-10 bg-orange-600 hover:bg-orange-700 h-16 w-16 rounded-full shadow-2xl">
              <Play className="h-8 w-8 fill-current" />
            </Button>
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="space-y-2">
              <Badge variant="outline" className="text-orange-500 border-orange-500/50 bg-orange-500/10 backdrop-blur-md">
                Phase: Release
              </Badge>
              <h3 className="text-white text-xl font-black">Frame Analysis Detail</h3>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-white text-xs font-bold">
              Confidence: 94.2%
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Biomechanics Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span>Lower Body Mechanics</span>
                  <span>{mainShot?.lowerBodyScore}%</span>
                </div>
                <Progress value={mainShot?.lowerBodyScore} className="h-2 bg-slate-100" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span>Elbow Extension</span>
                  <span>{mainShot?.upperBodyScore}%</span>
                </div>
                <Progress value={mainShot?.upperBodyScore} className="h-2 bg-slate-100" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span>Torso Alignment</span>
                  <span>{mainShot?.alignmentScore}%</span>
                </div>
                <Progress value={mainShot?.alignmentScore} className="h-2 bg-slate-100" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span>Release Consistency</span>
                  <span>{mainShot?.releaseScore}%</span>
                </div>
                <Progress value={mainShot?.releaseScore} className="h-2 bg-slate-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-orange-600 text-white">
            <CardHeader>
              <CardTitle className="text-white font-black">AI Recommendations</CardTitle>
              <CardDescription className="text-white/70 text-xs font-medium">Actionable form improvements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20 flex gap-3">
                <Zap className="h-5 w-5 text-white shrink-0" />
                <p className="text-xs font-bold leading-relaxed">
                  Deepen your knee bend during the loading phase to generate more upward power.
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20 flex gap-3">
                <Target className="h-5 w-5 text-white shrink-0" />
                <p className="text-xs font-bold leading-relaxed">
                  Focus on full elbow extension at peak height for a better release arc.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black">Knee Flexion</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold">Max Dip Angle</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{mainShot?.metrics?.max_knee_flexion}°</div>
            <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Optimal range
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black">Elbow Angle</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold">Release Point</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{mainShot?.metrics?.release_elbow_angle}°</div>
            <p className="text-xs text-amber-600 font-bold mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Slightly early release
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black">Torso Lean</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold">Center of Gravity</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{mainShot?.metrics?.torso_angle}°</div>
            <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Excellent balance
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
