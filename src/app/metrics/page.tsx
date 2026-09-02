'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Dna,
  Zap,
  ChevronRight
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

export default function BiometricsSuitePage() {
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => 
    query(collection(firestore, 'analysisSessions'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data: sessions, isLoading } = useCollection(sessionsQuery);

  const avgMetrics = sessions?.length ? {
    knee: Math.round(sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / sessions.length),
    consistency: 88,
    power: 74,
    stability: 91,
    extension: 82
  } : null;

  const radarData = avgMetrics ? [
    { subject: 'Knee Depth', A: avgMetrics.knee, fullMark: 100 },
    { subject: 'Consistency', A: avgMetrics.consistency, fullMark: 100 },
    { subject: 'Jump Power', A: avgMetrics.power, fullMark: 100 },
    { subject: 'Stability', A: avgMetrics.stability, fullMark: 100 },
    { subject: 'Extension', A: avgMetrics.extension, fullMark: 100 },
  ] : [];

  return (
    <div className="space-y-8 pb-20 basketball-grid min-h-full">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Biometrics Suite</h1>
        <p className="text-muted-foreground mt-1 text-base font-medium flex items-center gap-2">
          <Dna className="h-4 w-4 text-orange-500" />
          In-depth physiological performance profiling.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-black">Performance Radar</CardTitle>
            <CardDescription>Multi-dimensional analysis of shooting biomechanics.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Athlete Profile"
                  dataKey="A"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.4}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-orange-600 text-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <CardTitle className="text-sm font-black uppercase">Core KPI Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-white/60">Load Consistency</p>
                  <p className="text-2xl font-black">94.2%</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-white/60">Release Timing Var</p>
                  <p className="text-2xl font-black">12ms</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg text-emerald-300">
                  <TrendingDown className="h-5 w-5" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-bold opacity-80 leading-relaxed italic">
                  "Your release consistency has improved by 4% this month, correlating with better elbow extension."
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase text-slate-500">Recent Growth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Elbow Alignment', change: '+2.4%', up: true },
                { label: 'Jump Height', change: '+1.1%', up: true },
                { label: 'Torso Lean', change: '-0.5%', up: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold text-slate-700">{item.label}</span>
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full",
                    item.up ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
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

      <Card className="border-none shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-black">Biomechanical Trend Analysis</CardTitle>
          <CardDescription>Correlation between knee flexion and overall form score.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sessions?.map(s => ({ 
              date: format(new Date(s.createdAt), 'MMM d'), 
              score: s.overallScore,
              knee: 110 + Math.random() * 10 
            })).reverse()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="score" fill="#f97316" radius={[6, 6, 0, 0]} barSize={20} />
              <Bar dataKey="knee" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
