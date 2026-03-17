
import { Volunteer, Mission, MatchScore } from './types';

export const calculateMatchScore = (volunteer: Volunteer, mission: Mission): MatchScore => {
  // Skill match (weight: 0.5)
  const matchedSkills = volunteer.skills.filter(s => mission.requiredSkills.includes(s));
  const skillRatio = mission.requiredSkills.length > 0 ? matchedSkills.length / mission.requiredSkills.length : 0;
  const skillAlignment = skillRatio * 50;

  // Location match (weight: 0.25)
  // Simple string comparison for demo. In a real app, use geocoding/proximity.
  const locationAlignment = volunteer.location.toLowerCase() === mission.location.toLowerCase() ? 25 : 0;

  // Availability (weight: 0.15)
  // Normalize availability. Assume 20 hours is "max" for scoring.
  const availabilityAlignment = Math.min((volunteer.availability / 20) * 15, 15);

  // Urgency Boost (weight: 0.1)
  let urgencyBonus = 0;
  if (mission.urgency === 'High') urgencyBonus = 10;
  else if (mission.urgency === 'Medium') urgencyBonus = 5;

  const totalScore = skillAlignment + locationAlignment + availabilityAlignment + urgencyBonus;

  return {
    volunteerId: volunteer.id,
    score: Math.round(totalScore),
    skillAlignment,
    locationAlignment,
    availabilityAlignment,
    urgencyBonus
  };
};

export const getRankedMatches = (mission: Mission, volunteers: Volunteer[]): (Volunteer & { score: MatchScore })[] => {
  return volunteers
    .map(v => ({ ...v, score: calculateMatchScore(v, mission) }))
    .sort((a, b) => b.score.score - a.score.score);
};
