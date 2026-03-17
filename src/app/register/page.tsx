
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_SKILLS, saveVolunteer } from "@/lib/store";
import { Skill } from "@/lib/types";

export default function RegisterVolunteer() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState([10]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);

  const toggleSkill = (skill: Skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || selectedSkills.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all details and select at least one skill."
      });
      return;
    }

    saveVolunteer({
      name,
      location,
      availability: availability[0],
      skills: selectedSkills
    });

    toast({
      title: "Success!",
      description: "Volunteer registered successfully. Redirecting..."
    });

    setTimeout(() => router.push("/"), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Join the Bridge</h1>
        <p className="text-muted-foreground">Register your profile to start matching with missions that need your skills.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Tell us about yourself and how you want to contribute.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">City / Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. London" />
            </div>

            <div className="space-y-4">
              <Label>Availability (Hours per week): {availability[0]}h</Label>
              <Slider 
                value={availability} 
                onValueChange={setAvailability} 
                max={40} 
                step={1} 
              />
            </div>

            <div className="space-y-3">
              <Label>Skills & Expertise</Label>
              <div className="grid grid-cols-2 gap-4">
                {DEFAULT_SKILLS.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`skill-${skill}`} 
                      checked={selectedSkills.includes(skill)} 
                      onCheckedChange={() => toggleSkill(skill)}
                    />
                    <Label htmlFor={`skill-${skill}`} className="text-sm font-normal cursor-pointer">
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90">
              Register Volunteer Profile
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
