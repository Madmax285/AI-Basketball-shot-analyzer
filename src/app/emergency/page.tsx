
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Send, Users, ShieldAlert } from "lucide-react";
import { getStoredData } from "@/lib/store";
import { Volunteer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function EmergencyMode() {
  const { toast } = useToast();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isActivating, setIsActivating] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    const data = getStoredData();
    setVolunteers(data.volunteers);
    // Default to first available location if any
    const locations = Array.from(new Set(data.volunteers.map(v => v.location)));
    if (locations.length > 0) setSelectedLocation(locations[0]);
  }, []);

  const handleActivateEmergency = () => {
    if (!selectedLocation) return;
    
    setIsActivating(true);
    
    // Simulate finding matches
    const matches = volunteers.filter(v => 
      v.location.toLowerCase() === selectedLocation.toLowerCase() || 
      v.skills.includes('Medical') || 
      v.skills.includes('Rescue')
    );
    
    setMatchedCount(matches.length);

    // Simulate delay for AI processing and alert sending
    setTimeout(() => {
      setIsActivating(false);
      setAlertSent(true);
      toast({
        title: "Emergency Alerts Sent",
        description: `Alerts dispatched to ${matches.length} volunteers in/near ${selectedLocation}.`,
      });
    }, 2000);
  };

  const locations = Array.from(new Set(volunteers.map(v => v.location)));

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="bg-destructive p-2 rounded-full">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emergency Mode</h1>
          <p className="text-muted-foreground text-lg">Rapid response coordination for high-urgency events.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Activate Mission
            </CardTitle>
            <CardDescription>Select the disaster location to notify nearest skilled volunteers immediately.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Incident Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                  <SelectItem value="Global">Global Alert (All Volunteers)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="destructive" 
              className="w-full h-12 gap-2 text-lg font-bold" 
              onClick={handleActivateEmergency}
              disabled={isActivating || !selectedLocation}
            >
              <Send className="h-5 w-5" />
              {isActivating ? "Processing Alerts..." : "Activate Emergency Mission"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Live Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertSent ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <p className="font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Emergency Network Active
                  </p>
                  <p className="text-sm mt-1">Notifications have been sent via App & SMS simulations.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg text-center">
                    <p className="text-3xl font-black text-primary">{matchedCount}</p>
                    <p className="text-xs uppercase font-bold text-muted-foreground">Alerts Sent</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg text-center">
                    <p className="text-3xl font-black text-primary">{Math.round(matchedCount * 0.7)}</p>
                    <p className="text-xs uppercase font-bold text-muted-foreground">Nearby Ready</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>Waiting for activation...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {alertSent && (
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h3 className="font-bold text-lg">Instant Response Team</h3>
          <div className="flex flex-wrap gap-3">
            {volunteers
              .filter(v => v.location === selectedLocation || v.skills.includes('Medical'))
              .slice(0, 5)
              .map(v => (
                <Badge key={v.id} variant="secondary" className="px-4 py-2 flex gap-2 items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  {v.name} ({v.skills[0]})
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
