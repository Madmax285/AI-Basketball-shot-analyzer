
export type Skill = 'Education' | 'Health' | 'Environment' | 'Tech' | 'Social' | 'Logistics' | 'Arts' | 'Community';

export interface Volunteer {
  id: string;
  name: string;
  skills: Skill[];
  location: string;
  availability: number; // hours per week
  trustScore?: number;
}

export type Urgency = 'Low' | 'Medium' | 'High';

export interface Mission {
  id: string;
  title: string;
  description: string;
  requiredSkills: Skill[];
  location: string;
  urgency: Urgency;
  volunteersNeeded: number;
  completed: boolean;
}

export interface MatchScore {
  volunteerId: string;
  score: number;
  skillAlignment: number;
  locationAlignment: number;
  availabilityAlignment: number;
  urgencyBonus: number;
}
