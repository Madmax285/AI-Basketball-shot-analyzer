'use client';

import { useCollection, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  History, 
  Play, 
  ChevronRight, 
  Search,
  Calendar,
  Filter,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function SessionHistoryPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [search, setSearch] = useState('');

  const sessionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'analysisSessions'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: sessions, isLoading: isQueryLoading } = useCollection(sessionsQuery);

  const isLoading = isUserLoading || isQueryLoading;

  const filteredSessions = sessions?.filter(s => 
    s.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 basketball-grid min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Session History</h1>
          <p className="text-muted-foreground mt-1 text-base font-medium flex items-center gap-2">
            <History className="h-4 w-4 text-orange-500" />
            Your biomechanical progression over time.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by video filename..." 
            className="pl-10 h-12 bg-white border-none shadow-sm rounded-2xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 rounded-2xl border-none shadow-sm gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Performance Data...</p>
            </div>
          ) : filteredSessions?.length ? (
            <div className="divide-y divide-slate-50">
              {filteredSessions.map((session, idx) => (
                <Link href={`/analysis/${session.id}`} key={session.id}>
                  <div className="flex items-center justify-between p-6 hover:bg-orange-50 transition-all group cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-[1.25rem] bg-slate-100 flex items-center justify-center group-hover:bg-orange-600 transition-colors shadow-inner overflow-hidden relative">
                        <img 
                          src={session.processedVideoUrl} 
                          alt="Video Thumb" 
                          className="w-full h-full object-cover opacity-20 group-hover:opacity-10 transition-opacity" 
                        />
                        <Play className="absolute h-6 w-6 text-slate-400 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors">{session.filename}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(session.createdAt), 'MMM d, yyyy')}</span>
                          <span>•</span>
                          <span>{session.duration}s length</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">{session.overallScore}</div>
                        <p className="text-[9px] font-black uppercase text-orange-600 tracking-[0.2em]">Form Score</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center space-y-4">
              <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <History className="h-10 w-10 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No analysis history found</p>
              <Link href="/upload">
                <Button className="bg-orange-600 hover:bg-orange-700 font-bold rounded-2xl">Start First Analysis</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}