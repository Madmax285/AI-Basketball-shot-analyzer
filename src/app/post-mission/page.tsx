
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const SKILLS = ['Medical', 'Teaching', 'Rescue', 'Tech', 'Logistics', 'Environment', 'Arts', 'Community'];

export default function PostMission() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [needed, setNeeded] = useState("1");
  const [urgency, setUrgency] = useState("Medium");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || selectedSkills.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all mission details."
      });
      return;
    }

    const missionId = crypto.randomUUID();
    const missionRef = doc(firestore, 'missions', missionId);
    
    setDocumentNonBlocking(missionRef, {
      id: missionId,
      title,
      description,
      location,
      urgency,
      volunteersNeeded: parseInt(needed),
      requiredSkills: selectedSkills,
      status: 'Open',
    }, {});

    toast({
      title: "Mission Posted!",
      description: "NGO mission is now live for matching."
    });

    setTimeout(() => router.push("/matches"), 1000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">NGO Mission Posting</h1>
        <p className="text-muted-foreground">Post new requirements to find skilled volunteers.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Mission Specification</CardTitle>
            <CardDescription>Provide details about the needed assistance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Mission Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Disaster Relief Support" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Detailed Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the mission goals..." className="min-h-[100px]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mission-location">Location</Label>
                <Input id="mission-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City/Region" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volunteers-needed">Volunteers Required</Label>
                <Input id="volunteers-needed" type="number" min="1" value={needed} onChange={(e) => setNeeded(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Priority Level</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Required Skills</Label>
              <div className="grid grid-cols-2 gap-4">
                {SKILLS.map((skill) => (
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
            <Button type="submit" className="w-full h-11 bg-primary">
              Launch Mission
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
