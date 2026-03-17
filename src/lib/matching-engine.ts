
import { Volunteer, Mission, MatchScore } from './types';

export const calculateMatchScore = (volunteer: Volunteer, mission: Mission): MatchScore => {
  // Skill match (Weight: 5 -> scaled to 50%)
  const matchedSkills = volunteer.skills.filter(s => mission.requiredSkills.includes(s));
  const skillRatio = mission.requiredSkills.length > 0 ? matchedSkills.length / mission.requiredSkills.length : 0;
  const skillAlignment = skillRatio * 50;

  // Location match (Weight: 3 -> scaled to 30%)
  const locationAlignment = volunteer.location.toLowerCase() === mission.location.toLowerCase() ? 30 : 0;

  // Availability (Weight: 2 -> scaled to 20%)
  // Normalize availability. Assume 20 hours is the "standard" max for scoring.
  const availabilityAlignment = Math.min((volunteer.availability / 20) * 20, 20);

  // Urgency Boost (+2 -> scaled to 10%)
  let urgencyBonus = 0;
  if (mission.urgency === 'High') urgencyBonus = 10;
  else if (mission.urgency === 'Medium') urgencyBonus = 5;

  // Trust Score Bonus (Optional bonus based on user request)
  // Adds up to 5 points extra for high trust scores
  const trustBonus = (volunteer.trustScore || 0) / 20;

  const totalScore = Math.min(100, Math.round(skillAlignment + locationAlignment + availabilityAlignment + urgencyBonus + trustBonus));

  return {
    volunteerId: volunteer.id,
    score: totalScore,
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
