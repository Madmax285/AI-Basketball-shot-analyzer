
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
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
  History
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const firestore = useFirestore();
  
  // Updated query to be public-access friendly (removed userId filter)
  const sessionsQuery = useMemoFirebase(() => {
    return query(
      collection(firestore, 'analysisSessions'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [firestore]);

  const { data: sessions, isLoading } = useCollection(sessionsQuery);

  const avgScore = sessions?.length 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / sessions.length) 
    : 0;

  const chartData = sessions?.map(s => ({
    date: format(new Date(s.createdAt), 'MMM d'),
    score: s.overallScore
  })).reverse() || [];

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
          <Link href="/upload">
            <Button className="bg-orange-600 hover:bg-orange-700 h-12 px-8 rounded-2xl shadow-lg shadow-orange-200 gap-2 font-bold text-base">
              <Upload className="h-5 w-5" />
              New Analysis
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Avg Form Score</CardTitle>
            <Award className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{avgScore}</div>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tighter">Based on last {sessions?.length || 0} shots</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Sessions</CardTitle>
            <History className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{sessions?.length || 0}</div>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tighter">Total videos analyzed</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Focus Area</CardTitle>
            <Zap className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">Knee Flexion</div>
            <p className="text-xs text-amber-600 font-bold mt-1 uppercase tracking-tighter">Improve loading depth</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-slate-950 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 rounded-full -mr-16 -mt-16 blur-3xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Pro Comparison</CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">Elite</div>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">Top 15% of users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-black">Score History</CardTitle>
            <CardDescription className="font-medium">Tracking form improvement over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {isLoading ? (
                 <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                  Loading Performance Data...
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
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-sm italic">
                  Upload a video to see progress
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black">Recent Sessions</CardTitle>
              <CardDescription className="font-medium">Deep dive into your last shots.</CardDescription>
            </div>
            <Link href="/history">
              <Button variant="ghost" className="text-xs font-bold text-orange-600 hover:text-orange-700 rounded-lg">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {isLoading ? (
                <div className="py-20 text-center space-y-4 px-6">
                  <Activity className="h-8 w-8 text-slate-200 animate-spin mx-auto" />
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Syncing Sessions...</p>
                </div>
              ) : sessions?.length ? sessions.map((s, idx) => (
                <Link href={`/analysis/${s.id}`} key={s.id}>
                  <div className={cn(
                    "flex items-center justify-between p-4 hover:bg-orange-50 transition-colors group cursor-pointer",
                    idx !== (sessions.length - 1) && "border-b border-slate-50"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-300 shadow-inner">
                        <Play className="h-5 w-5 text-slate-400 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 truncate max-w-[150px]">{s.filename}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{format(new Date(s.createdAt), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 leading-none">{s.overallScore}</p>
                        <p className="text-[9px] font-black uppercase text-orange-600 tracking-widest">Score</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="py-20 text-center space-y-4 px-6">
                  <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Activity className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No sessions found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
