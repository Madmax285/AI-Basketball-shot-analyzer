'use client';

import { useCollection, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit, doc, where } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Upload, 
  TrendingUp, 
  Award, 
  Zap,
  ChevronRight,
  Activity,
  History,
  Sparkles,
  Loader2
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const sessionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'analysisSessions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [firestore, user]);

  const { data: sessions, isLoading: isQueryLoading } = useCollection(sessionsQuery);

  const isLoading = isUserLoading || isQueryLoading;

  const avgScore = sessions?.length 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / sessions.length) 
    : 0;

  const chartData = sessions?.map(s => ({
    date: s.createdAt ? format(new Date(s.createdAt), 'MMM d') : 'N/A',
    score: s.overallScore
  })).reverse() || [];

  const handleTryDemo = () => {
    if (!user) return;
    setIsSeeding(true);
    const sessionId = `demo-${crypto.randomUUID().substring(0,8)}`;
    const sessionRef = doc(firestore, 'analysisSessions', sessionId);
    
    setDocumentNonBlocking(sessionRef, {
      id: sessionId,
      userId: user.uid,
      filename: 'elite_jumpshot_sample.mp4',
      createdAt: new Date().toISOString(),
      status: 'completed',
      overallScore: 88,
      processedVideoUrl: 'https://picsum.photos/seed/demo-ball/1200/800',
      duration: 12.4,
      type: 'video'
    }, {});

    const shotData = [
      { id: 'shot-1', type: '3-Point Shot', result: 'MADE', score: 91 },
      { id: 'shot-2', type: 'Layup', result: 'MADE', score: 84 },
      { id: 'shot-3', type: '3-Point Shot', result: 'MISSED', score: 87 },
    ];

    shotData.forEach((shot, i) => {
      setDocumentNonBlocking(doc(firestore, 'shotResults', `${sessionId}-${shot.id}`), {
        id: `${sessionId}-${shot.id}`,
        sessionId,
        userId: user.uid,
        shotNumber: i + 1,
        actionType: shot.type,
        result: shot.result,
        location: shot.type === 'Layup' ? 'Restricted Area' : 'Beyond 3pt Line',
        confidence: 96,
        overallScore: shot.score,
        lowerBodyScore: shot.score - 2,
        upperBodyScore: shot.score + 1,
        alignmentScore: shot.score,
        releaseScore: shot.score + 3,
        consistencyScore: 92,
        metrics: { max_knee_flexion: 114, release_elbow_angle: 162, torso_angle: 5 }
      }, {});
    });

    setTimeout(() => {
      router.push(`/analysis/${sessionId}`);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-10 basketball-grid min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Training Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" />
            Performance insights powered by computer vision.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleTryDemo}
            disabled={isSeeding || isLoading}
            className="h-12 px-6 rounded-2xl border-2 border-orange-200 text-orange-600 font-bold hover:bg-orange-50 gap-2"
          >
            {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Try Demo
          </Button>
          <Link href="/upload">
            <Button className="bg-orange-600 hover:bg-orange-700 h-12 px-8 rounded-2xl shadow-lg shadow-orange-200 gap-2 font-bold text-base">
              <Upload className="h-5 w-5" />
              New Analysis
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avg Form Score</CardTitle>
            <Award className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : avgScore}</div>
            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest opacity-60">Based on last {sessions?.length || 0} shots</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Sessions</CardTitle>
            <History className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : sessions?.length || 0}</div>
            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest opacity-60">Videos analyzed to date</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Focus Area</CardTitle>
            <Zap className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">Knee Flexion</div>
            <p className="text-[9px] text-amber-600 font-bold mt-1 uppercase tracking-widest">Improve loading depth</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-slate-950 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 rounded-full -mr-16 -mt-16 blur-3xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pro Tier</CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white italic uppercase tracking-tighter">Elite</div>
            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest opacity-60">Top 15% athlete</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-100">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Score History</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Tracking form improvement over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                    Syncing Performance Graph...
                  </div>
                ) : chartData.length > 0 ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 gap-4">
                    <p className="font-bold uppercase tracking-widest text-[10px] text-center max-w-xs italic opacity-60">
                      No data points available. Upload a basketball clip to initialize performance tracking.
                    </p>
                    <Button variant="ghost" onClick={handleTryDemo} className="text-orange-600 font-black uppercase text-[10px] tracking-widest h-auto p-0">Try a demo session</Button>
                  </div>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden ring-1 ring-slate-100">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
            <div>
              <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Recent Sessions</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Detailed biomechanical dive</CardDescription>
            </div>
            <Link href="/history">
              <Button variant="ghost" className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {isLoading ? (
                <div className="py-20 text-center space-y-4 px-6">
                  <Activity className="h-8 w-8 text-slate-200 animate-spin mx-auto" />
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Syncing Cloud Sessions...</p>
                </div>
              ) : sessions?.length ? sessions.map((s, idx) => (
                <Link href={`/analysis/${s.id}`} key={s.id}>
                  <div className={cn(
                    "flex items-center justify-between p-5 hover:bg-orange-50 transition-colors group cursor-pointer",
                    idx !== (sessions.length - 1) && "border-b border-slate-50"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-300 shadow-inner overflow-hidden"
                      )}>
                        <Play className="h-5 w-5 text-slate-400 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 truncate max-w-[150px] uppercase italic tracking-tighter">{s.filename}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{s.createdAt ? format(new Date(s.createdAt), 'MMM d, h:mm a') : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 leading-none">{s.overallScore}</p>
                        <p className="text-[8px] font-black uppercase text-orange-600 tracking-widest">Score</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="py-24 text-center space-y-4 px-6 opacity-40">
                  <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Activity className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Waiting for first upload</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}