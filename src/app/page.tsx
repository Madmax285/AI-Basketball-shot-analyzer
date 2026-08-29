
'use client';

import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Rocket, CheckCircle2, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export default function Dashboard() {
  const firestore = useFirestore();
  
  const volunteersQuery = useMemoFirebase(() => collection(firestore, 'volunteers'), [firestore]);
  const missionsQuery = useMemoFirebase(() => collection(firestore, 'missions'), [firestore]);
  
  const { data: volunteers } = useCollection(volunteersQuery);
  const { data: missions } = useCollection(missionsQuery);

  const totalVolunteers = volunteers?.length || 0;
  const totalMissions = missions?.length || 0;
  const completedMissions = missions?.filter(m => m.status === 'Completed').length || 0;
  const activeMissions = totalMissions - completedMissions;
  const averageTrustScore = totalVolunteers > 0 
    ? Math.round((volunteers?.reduce((acc, v) => acc + (v.trustScore || 0), 0) || 0) / totalVolunteers) 
    : 0;

  const chartData = [
    { name: "Volunteers", value: totalVolunteers, color: "hsl(var(--primary))" },
    { name: "Active Missions", value: activeMissions, color: "hsl(var(--accent))" },
    { name: "Completed", value: completedMissions, color: "hsl(var(--chart-3))" },
  ];

  const skillDistribution = Array.from(new Set(volunteers?.flatMap(v => v.skills) || [])).map(skill => ({
    name: skill,
    value: volunteers?.filter(v => v.skills.includes(skill)).length || 0
  })).sort((a, b) => b.value - a.value);

  const stats = [
    { label: "Total Volunteers", value: totalVolunteers, icon: Users, color: "text-primary" },
    { label: "Active Missions", value: activeMissions, icon: Rocket, color: "text-accent" },
    { label: "Completed", value: completedMissions, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Avg Trust Score", value: `${averageTrustScore}/100`, icon: Star, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Analytics</h1>
          <p className="text-muted-foreground">Real-time data synchronized across the coordination network.</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">System Status</p>
          <p className="text-sm font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Connected to Firestore
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Impact Overview</CardTitle>
            <CardDescription>Visualizing capacity and historical mission data</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Skill Capacity</CardTitle>
            <CardDescription>Top distributed skills</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillDistribution.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {skillDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-1">
              {skillDistribution.slice(0, 3).map((s, i) => (
                <div key={s.name} className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: `hsl(var(--chart-${i+1}))`}} />
                    {s.name}
                  </span>
                  <span className="font-bold">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
