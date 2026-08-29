
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_SKILLS = ['Medical', 'Teaching', 'Rescue', 'Tech', 'Logistics', 'Environment', 'Arts', 'Community'];

export default function RegisterVolunteer() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState([10]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!name || !location || selectedSkills.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all details and select at least one skill."
      });
      return;
    }

    const volunteerRef = doc(firestore, 'volunteers', user.uid);
    setDocumentNonBlocking(volunteerRef, {
      id: user.uid,
      name,
      location,
      availabilityHoursPerWeek: availability[0],
      skills: selectedSkills,
      trustScore: 100,
    }, { merge: true });

    toast({
      title: "Profile Saved!",
      description: "Your volunteer profile is now active."
    });

    setTimeout(() => router.push("/"), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Volunteer Profile</h1>
        <p className="text-muted-foreground">Define your skills and availability to help the community.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
            <CardDescription>Your information will be used to match you with appropriate missions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Smith" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">City / District</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Brooklyn" />
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
              <Label>Expertise Areas</Label>
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
            <Button type="submit" className="w-full h-11">
              Update Profile
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
