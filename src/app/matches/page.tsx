
"use client";

import { useEffect, useState } from "react";
import { getStoredData } from "@/lib/store";
import { Mission, Volunteer } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRankedMatches } from "@/lib/matching-engine";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Clock, BrainCircuit } from "lucide-react";
import { explainVolunteerMatch } from "@/ai/flows/explain-volunteer-match-flow";
import { useToast } from "@/hooks/use-toast";

export default function ViewMatches() {
  const { toast } = useToast();
  const [data, setData] = useState<{ volunteers: Volunteer[], missions: Mission[] }>({ volunteers: [], missions: [] });
  const [selectedMissionId, setSelectedMissionId] = useState<string>("");
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExplanations, setLoadingExplanations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = getStoredData();
    setData(stored);
    if (stored.missions.length > 0) {
      setSelectedMissionId(stored.missions[0].id);
    }
  }, []);

  const selectedMission = data.missions.find(m => m.id === selectedMissionId);
  const matches = selectedMission ? getRankedMatches(selectedMission, data.volunteers) : [];

  const handleExplain = async (v: Volunteer) => {
    if (!selectedMission) return;
    
    setLoadingExplanations(prev => ({ ...prev, [v.id]: true }));
    try {
      const proximity = v.location === selectedMission.location ? "very close" : "nearby";
      const availabilityDesc = v.availability > 10 ? "high availability" : "sufficient availability";
      
      const res = await explainVolunteerMatch({
        volunteerName: v.name,
        missionTitle: selectedMission.title,
        matchedSkills: v.skills.filter(s => selectedMission.requiredSkills.includes(s)),
        volunteerLocation: v.location,
        missionLocation: selectedMission.location,
        volunteerAvailabilityHours: v.availability,
        missionUrgency: selectedMission.urgency,
        locationProximityDescription: proximity,
        availabilityMatchDescription: availabilityDesc
      });
      
      setExplanations(prev => ({ ...prev, [v.id]: res.explanation }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Failed to generate AI explanation. Please try again."
      });
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [v.id]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Volunteer Matches</h1>
          <p className="text-muted-foreground">Select a mission to see the best volunteer candidates ranked by AI.</p>
        </div>
        <div className="w-full md:w-72">
          <Select value={selectedMissionId} onValueChange={setSelectedMissionId}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a mission" />
            </SelectTrigger>
            <SelectContent>
              {data.missions.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedMission ? (
        <div className="grid gap-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2 border-primary text-primary">
                    Active Mission
                  </Badge>
                  <CardTitle>{selectedMission.title}</CardTitle>
                </div>
                <Badge className={selectedMission.urgency === 'High' ? 'bg-red-500' : selectedMission.urgency === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'}>
                  {selectedMission.urgency} Urgency
                </Badge>
              </div>
              <CardDescription className="max-w-3xl">{selectedMission.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedMission.requiredSkills.map(s => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              AI Matching Engine Results
            </h3>
            <div className="grid gap-4">
              {matches.length > 0 ? matches.map((match, idx) => (
                <Card key={match.id} className="overflow-hidden transition-all hover:shadow-md">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold">{match.name}</h4>
                          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {match.location}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {match.availability}h/week</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-primary">{match.score.score}%</span>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Match Score</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {match.skills.map(s => (
                            <Badge key={s} variant={selectedMission.requiredSkills.includes(s) ? "default" : "outline"} className={selectedMission.requiredSkills.includes(s) ? "bg-accent text-accent-foreground" : ""}>
                              {s}
                            </Badge>
                          ))}
                        </div>

                        {explanations[match.id] ? (
                          <div className="bg-secondary/50 p-4 rounded-lg border border-accent/20 animate-in fade-in zoom-in-95">
                            <p className="text-sm font-medium text-accent-foreground flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              AI Explanation:
                            </p>
                            <p className="text-sm mt-1">{explanations[match.id]}</p>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 hover:bg-primary hover:text-white" 
                            onClick={() => handleExplain(match)}
                            disabled={loadingExplanations[match.id]}
                          >
                            <Sparkles className="h-4 w-4" />
                            {loadingExplanations[match.id] ? "Thinking..." : "Explain Match"}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="w-full md:w-2 bg-primary/10" />
                  </div>
                </Card>
              )) : (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                  <p className="text-muted-foreground">No volunteers registered yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-lg border border-dashed">
          <p className="text-muted-foreground text-lg">Post a mission first to see matches.</p>
        </div>
      )}
    </div>
  );
}
