'use client';

import { useCollection, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, where, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Dna,
  Zap,
  Loader2,
  Calendar,
  Target
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function BiometricsSuitePage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [chartData, setChartData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sessionsQuery = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return query(
      collection(firestore, 'analysisSessions'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [firestore, user?.uid]);

  const { data: sessions, isLoading: isQueryLoading } = useCollection(sessionsQuery);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const data = [...sessions].reverse().map((s, idx) => ({ 
        date: s.createdAt ? format(new Date(s.createdAt), 'MMM d') : `S-${idx}`, 
        score: s.overallScore || 0,
        avgKnee: Math.max(90, Math.min(130, 110 + ((s.overallScore || 80) % 20))) 
      }));
      setChartData(data);
    }
  }, [sessions]);

  const latestScore = sessions?.[0]?.overallScore || 0;
  const prevScore = sessions?.[1]?.overallScore || latestScore;
  const scoreDiff = latestScore - prevScore;

  const avgMetrics = sessions?.length ? {
    overall: Math.round(sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / sessions.length),
    knee: 88,
    consistency: 91,
    extension: 82,
    timing: 85,
    stability: 89
  } : null;

  const radarData = avgMetrics ? [
    { subject: 'Knee Depth', A: avgMetrics.knee, fullMark: 100 },
    { subject: 'Consistency', A: avgMetrics.consistency, fullMark: 100 },
    { subject: 'Extension', A: avgMetrics.extension, fullMark: 100 },
    { subject: 'Stability', A: avgMetrics.stability, fullMark: 100 },
    { subject: 'Timing', A: avgMetrics.timing, fullMark: 100 },
  ] : [];

  const isLoading = isUserLoading || isQueryLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-orange-600 animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Athlete Profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Activity className="h-16 w-16 text-slate-200 mb-4" />
        <h2 className="text-xl font-black uppercase italic">Identity Verification Required</h2>
        <p className="text-slate-500 max-w-xs mt-2 font-medium">Please allow the session to initialize to access private biomechanical logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 basketball-grid min-h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 italic uppercase">Biometrics Suite</h1>
          <p className="text-muted-foreground mt-1 text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
            <Dna className="h-3 w-3 text-orange-500" />
            Physiological Performance Log
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border shadow-sm flex items-center gap-4">
           <div className="text-right border-r pr-4">
             <p className="text-[8px] font-black uppercase text-slate-400">Total Sessions</p>
             <p className="text-xl font-black text-slate-900">{sessions?.length || 0}</p>
           </div>
           <div className="text-right">
             <p className="text-[8px] font-black uppercase text-slate-400">Current Rank</p>
             <p className="text-xl font-black text-orange-600">Pro</p>
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-black uppercase italic flex items-center gap-2">
               <Target className="h-4 w-4 text-orange-600" />
               Performance Radar
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-tight">Dimensional biomechanical analysis</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] pt-8">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                {radarData.length > 0 ? (
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                    <Radar
                      name="Athlete"
                      dataKey="A"
                      stroke="#f97316"
                      strokeWidth={3}
                      fill="#f97316"
                      fillOpacity={0.5}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    />
                  </RadarChart>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase text-[10px] italic">Zero sessions detected</div>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-orange-600 text-white rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <CardTitle className="text-[10px] font-black uppercase tracking-widest">Active KPI Momentum</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase text-white/60 tracking-tight">Overall Form Trend</p>
                  <p className="text-4xl font-black italic tracking-tighter">
                    {latestScore}%
                  </p>
                </div>
                <div className={cn(
                  "p-3 rounded-2xl flex items-center gap-1",
                  scoreDiff >= 0 ? "bg-white/10 text-emerald-300" : "bg-white/10 text-rose-300"
                )}>
                  {scoreDiff >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                  <span className="text-sm font-black">{Math.abs(scoreDiff)}%</span>
                </div>
              </div>
              <div className="p-4 bg-black/10 rounded-2xl border border-white/5 space-y-1">
                 <p className="text-[8px] font-black uppercase text-orange-200">Coach Insight</p>
                 <p className="text-xs font-bold opacity-90 leading-tight">
                   "Your consistency is peaking. Focus on maintaining knee depth under high fatigue sessions."
                 </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Growth Matrix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Elbow Alignment', change: '+4.2%', up: true },
                { label: 'Jump Vertical', change: '+1.5%', up: true },
                { label: 'Release Velocity', change: '-0.8%', up: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[11px] font-black text-slate-700 uppercase italic">{item.label}</span>
                  <div className={cn(
                    "flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full",
                    item.up ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {item.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {item.change}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-black uppercase italic flex items-center gap-2">
               <Calendar className="h-4 w-4 text-orange-600" />
               Longitudinal Trend Analysis
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase">Form score vs mechanical load correlation</CardDescription>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-1.5">
               <div className="h-2 w-2 rounded-full bg-orange-500" />
               <span className="text-[8px] font-black uppercase text-slate-500">Overall Score</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="h-2 w-2 rounded-full bg-slate-300" />
               <span className="text-[8px] font-black uppercase text-slate-500">Knee Load</span>
             </div>
          </div>
        </CardHeader>
        <CardContent className="h-[350px] pt-10">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartData.length > 0 ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="score" fill="#f97316" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="avgKnee" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                    <div className="bg-slate-50 p-6 rounded-full">
                      <Activity className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">Analysis history needed for trend extraction</p>
                </div>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}