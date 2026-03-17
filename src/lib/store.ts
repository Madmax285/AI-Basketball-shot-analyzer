
"use client";

import { Volunteer, Mission, Skill } from './types';

const STORAGE_KEY = 'volunteer_bridge_data';

interface AppData {
  volunteers: Volunteer[];
  missions: Mission[];
}

const DEFAULT_SKILLS: Skill[] = ['Education', 'Health', 'Environment', 'Tech', 'Social', 'Logistics', 'Arts', 'Community'];

export const getStoredData = (): AppData => {
  if (typeof window === 'undefined') return { volunteers: [], missions: [] };
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initialData: AppData = {
      volunteers: [
        { id: '1', name: 'Alice Chen', skills: ['Tech', 'Education'], location: 'New York', availability: 10, trustScore: 95 },
        { id: '2', name: 'Bob Smith', skills: ['Logistics', 'Social'], location: 'London', availability: 5, trustScore: 88 },
        { id: '3', name: 'Charlie Davis', skills: ['Environment', 'Arts'], location: 'New York', availability: 15, trustScore: 92 },
      ],
      missions: [
        { id: 'm1', title: 'Tech Mentoring for Youth', description: 'Help local youth learn coding basics.', requiredSkills: ['Tech', 'Education'], location: 'New York', urgency: 'Medium', volunteersNeeded: 3, completed: false },
        { id: 'm2', title: 'Community Garden Cleanup', description: 'Monthly cleanup of the central park garden.', requiredSkills: ['Environment', 'Social'], location: 'New York', urgency: 'Low', volunteersNeeded: 10, completed: true },
      ]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
};

export const saveVolunteer = (v: Omit<Volunteer, 'id'>) => {
  const data = getStoredData();
  const newVolunteer: Volunteer = { ...v, id: crypto.randomUUID(), trustScore: 100 };
  data.volunteers.push(newVolunteer);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return newVolunteer;
};

export const saveMission = (m: Omit<Mission, 'id' | 'completed'>) => {
  const data = getStoredData();
  const newMission: Mission = { ...m, id: crypto.randomUUID(), completed: false };
  data.missions.push(newMission);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return newMission;
};

export { DEFAULT_SKILLS };
