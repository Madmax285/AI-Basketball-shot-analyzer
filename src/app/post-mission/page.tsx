
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_SKILLS, saveMission } from "@/lib/store";
import { Skill, Urgency } from "@/lib/types";

export default function PostMission() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [needed, setNeeded] = useState("1");
  const [urgency, setUrgency] = useState<Urgency>("Medium");
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);

  const toggleSkill = (skill: Skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || selectedSkills.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all mission details."
      });
      return;
    }

    saveMission({
      title,
      description,
      location,
      urgency,
      volunteersNeeded: parseInt(needed),
      requiredSkills: selectedSkills
    });

    toast({
      title: "Mission Posted!",
      description: "Mission is now live and waiting for matches."
    });

    setTimeout(() => router.push("/matches"), 1000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create a Mission</h1>
        <p className="text-muted-foreground">Detail your needs to find the most qualified volunteers in our community.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Mission Information</CardTitle>
            <CardDescription>Clearly define the objective and requirements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Mission Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Help at Food Bank" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Explain the mission's goal..." className="min-h-[120px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mission-location">Location</Label>
                <Input id="mission-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volunteers-needed">Volunteers Needed</Label>
                <Input id="volunteers-needed" type="number" min="1" value={needed} onChange={(e) => setNeeded(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
                <SelectTrigger id="urgency">
                  <SelectValue placeholder="Select Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Required Skills</Label>
              <div className="grid grid-cols-2 gap-4">
                {DEFAULT_SKILLS.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`req-skill-${skill}`} 
                      checked={selectedSkills.includes(skill)} 
                      onCheckedChange={() => toggleSkill(skill)}
                    />
                    <Label htmlFor={`req-skill-${skill}`} className="text-sm font-normal cursor-pointer">
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90">
              Post New Mission
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
