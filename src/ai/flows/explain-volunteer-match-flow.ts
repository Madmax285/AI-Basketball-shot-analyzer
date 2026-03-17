'use server';
/**
 * @fileOverview A Genkit flow that generates a natural language explanation for why a volunteer was matched to a mission.
 *
 * - explainVolunteerMatch - A function that handles the explanation generation process.
 * - ExplainVolunteerMatchInput - The input type for the explainVolunteerMatch function.
 * - ExplainVolunteerMatchOutput - The return type for the explainVolunteerMatch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const ExplainVolunteerMatchInputSchema = z.object({
  volunteerName: z.string().describe('The name of the volunteer.'),
  missionTitle: z.string().describe('The title of the mission.'),
  matchedSkills: z.array(z.string()).describe('A list of skills that the volunteer possesses and are required by the mission.'),
  volunteerLocation: z.string().describe("The volunteer's location."),
  missionLocation: z.string().describe("The mission's location."),
  volunteerAvailabilityHours: z.number().describe('The volunteer\u0027s reported availability in hours per week.'),
  missionUrgency: z.enum(['Low', 'Medium', 'High']).describe("The urgency level of the mission."),
  locationProximityDescription: z.string().describe('A pre-calculated description of how close the volunteer is to the mission location (e.g., "very close", "nearby", "a bit far").'),
  availabilityMatchDescription: z.string().describe('A pre-calculated description of how well the volunteer\u0027s availability matches the mission needs (e.g., "high availability", "sufficient availability", "limited availability").'),
});

export type ExplainVolunteerMatchInput = z.infer<typeof ExplainVolunteerMatchInputSchema>;

// Output Schema
const ExplainVolunteerMatchOutputSchema = z.object({
  explanation: z.string().describe('A concise, natural language explanation for why the volunteer was matched to the mission.'),
});

export type ExplainVolunteerMatchOutput = z.infer<typeof ExplainVolunteerMatchOutputSchema>;

// Wrapper function for the flow
export async function explainVolunteerMatch(input: ExplainVolunteerMatchInput): Promise<ExplainVolunteerMatchOutput> {
  return explainVolunteerMatchFlow(input);
}

// Define the prompt
const explainMatchPrompt = ai.definePrompt({
  name: 'explainVolunteerMatchPrompt',
  input: { schema: ExplainVolunteerMatchInputSchema },
  output: { schema: ExplainVolunteerMatchOutputSchema },
  prompt: `You are an AI-powered explanation system for a volunteer coordination platform called VolunteerBridge.\nYour task is to generate a concise, natural language explanation for why a specific volunteer was matched to a particular mission.\nFocus on the key matching criteria: skills, location, and availability, and the mission's urgency if relevant.\n\nVolunteer Name: {{{volunteerName}}}\nMission Title: {{{missionTitle}}}\nMatched Skills: {{#if matchedSkills}}{{{matchedSkills}}}{{else}}None explicitly matched{{/if}}\nVolunteer Location: {{{volunteerLocation}}}\nMission Location: {{{missionLocation}}}\nLocation Proximity: {{{locationProximityDescription}}}\nVolunteer Availability (hours/week): {{{volunteerAvailabilityHours}}}\nAvailability Match: {{{availabilityMatchDescription}}}\nMission Urgency: {{{missionUrgency}}}\n\nBased on the information above, provide a short and clear explanation for the match.\nExample: "Matched because skills align, nearby location, and high availability."\n\nGenerate the explanation:`,
});

// Define the flow
const explainVolunteerMatchFlow = ai.defineFlow(
  {
    name: 'explainVolunteerMatchFlow',
    inputSchema: ExplainVolunteerMatchInputSchema,
    outputSchema: ExplainVolunteerMatchOutputSchema,
  },
  async (input) => {
    const { output } = await explainMatchPrompt(input);
    if (!output) {
      throw new Error('Failed to generate explanation.');
    }
    return output;
  }
);
