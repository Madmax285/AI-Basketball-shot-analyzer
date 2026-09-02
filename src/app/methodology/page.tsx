'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Cpu, Layers, Ruler, Brain, CheckCircle2 } from 'lucide-react';

export default function MethodologyPage() {
  const steps = [
    {
      title: "Pose Estimation Engine",
      icon: Cpu,
      color: "bg-blue-500",
      description: "Utilizes MediaPipe Pose to track 33 3D body landmarks at 30fps. The engine normalizes coordinates based on the player's hip height to account for camera distance variability."
    },
    {
      title: "Biomechanical Geometry",
      icon: Ruler,
      color: "bg-orange-500",
      description: "Custom trigonometric calculations determine joint angles. For example, knee flexion is calculated using the Law of Cosines across the hip, knee, and ankle vectors."
    },
    {
      title: "Shot Segmentation",
      icon: Layers,
      color: "bg-purple-500",
      description: "Proprietary heuristics detect the 'dip' (maximum vertical downward movement of the hips) and 'release' (peak vertical acceleration of the wrist) to segment the shooting motion."
    },
    {
      title: "AI Scoring Logic",
      icon: Brain,
      color: "bg-emerald-500",
      description: "Metrics are compared against professional shooting profiles (NBA/WNBA averages). Scores are weighted: 30% Upper Body, 20% Lower Body, 20% Alignment, 20% Release, 10% Consistency."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-widest">
          <BookOpen className="h-3 w-3" />
          Science Behind the System
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900">How AI Analyzes Your Shot</h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          Combining professional kinesiology with state-of-the-art computer vision to quantify basketball mechanics.
        </p>
      </div>

      <div className="grid gap-6">
        {steps.map((step, idx) => (
          <Card key={idx} className="border-none shadow-xl bg-white overflow-hidden flex flex-col md:flex-row items-stretch">
            <div className={cn("w-full md:w-48 shrink-0 flex items-center justify-center p-8", step.color)}>
              <step.icon className="h-12 w-12 text-white" />
            </div>
            <CardContent className="p-8 space-y-4">
              <h3 className="text-2xl font-black text-slate-900">{step.title}</h3>
              <p className="text-slate-600 font-medium leading-relaxed">{step.description}</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Validated Model
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Low Latency
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl bg-slate-950 text-white overflow-hidden relative p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-black italic uppercase">Accuracy Statement</h2>
          <p className="text-slate-400 font-medium text-lg leading-relaxed">
            While MediaPipe provides high-fidelity tracking, environmental factors like low lighting or loose clothing can impact pose confidence. The system works best from a side-view profile with the camera mounted at hip height.
          </p>
          <div className="pt-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Scientific Integrity First</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
