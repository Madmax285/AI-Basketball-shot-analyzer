
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getStoredData } from "@/lib/store";
import { Mission, Volunteer } from "@/lib/types";
import { Users, Rocket, CheckCircle2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Dashboard() {
  const [data, setData] = useState<{ volunteers: Volunteer[], missions: Mission[] }>({ volunteers: [], missions: [] });

  useEffect(() => {
    setData(getStoredData());
  }, []);

  const totalVolunteers = data.volunteers.length;
  const totalMissions = data.missions.length;
  const completedMissions = data.missions.filter(m => m.completed).length;
  const activeMissions = totalMissions - completedMissions;

  const chartData = [
    { name: "Volunteers", value: totalVolunteers, color: "hsl(var(--primary))" },
    { name: "Active", value: activeMissions, color: "hsl(var(--accent))" },
    { name: "Completed", value: completedMissions, color: "hsl(var(--chart-3))" },
  ];

  const stats = [
    { label: "Total Volunteers", value: totalVolunteers, icon: Users, color: "text-primary" },
    { label: "Active Missions", value: activeMissions, icon: Rocket, color: "text-accent" },
    { label: "Completed", value: completedMissions, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Success Rate", value: totalMissions > 0 ? `${Math.round((completedMissions / totalMissions) * 100)}%` : "0%", icon: TrendingUp, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Overview</h1>
        <p className="text-muted-foreground">Monitor the impact of VolunteerBridge matches.</p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Impact Metrics</CardTitle>
            <CardDescription>Volunteer activity vs Mission status</CardDescription>
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

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest registered missions and volunteers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.missions.slice(-3).reverse().map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">{m.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.urgency} Urgency • {m.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
