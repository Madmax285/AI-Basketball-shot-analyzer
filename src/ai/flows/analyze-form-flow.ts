'use server';
/**
 * @fileOverview A Genkit flow that provides professional coaching feedback based on shooting biomechanics.
 *
 * - analyzeForm - A function that generates coaching insights.
 * - AnalyzeFormInput - Biometric angles and metrics.
 * - AnalyzeFormOutput - Coaching feedback and summary.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeFormInputSchema = z.object({
  kneeAngle: z.number().describe('Maximum knee flexion angle in degrees.'),
  elbowAngle: z.number().describe('Elbow angle at release in degrees.'),
  torsoAngle: z.number().describe('Torso lean angle at takeoff.'),
  formScore: z.number().describe('The current system-calculated form score.'),
});

export type AnalyzeFormInput = z.infer<typeof AnalyzeFormInputSchema>;

const AnalyzeFormOutputSchema = z.object({
  coachFeedback: z.string().describe('Professional coaching feedback.'),
  keyTakeaway: z.string().describe('One single actionable improvement.'),
});

export type AnalyzeFormOutput = z.infer<typeof AnalyzeFormOutputSchema>;

export async function analyzeForm(input: AnalyzeFormInput): Promise<AnalyzeFormOutput> {
  return analyzeFormFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFormPrompt',
  input: { schema: AnalyzeFormInputSchema },
  output: { schema: AnalyzeFormOutputSchema },
  prompt: `You are an elite NBA shooting coach. Analyze the following biomechanical data for an athlete's jump shot:

Knee Flexion: {{{kneeAngle}}}°
Elbow Extension: {{{elbowAngle}}}°
Torso Lean: {{{torsoAngle}}}°
Overall Score: {{{formScore}}}/100

Provide a concise professional analysis. Focus on the relationship between these metrics (e.g., if knee bend is shallow, they may lack power). Be encouraging but technical.

Feedback should be 2-3 sentences. 
Key Takeaway should be one actionable drill or focus point.`,
});

const analyzeFormFlow = ai.defineFlow(
  {
    name: 'analyzeFormFlow',
    inputSchema: AnalyzeFormInputSchema,
    outputSchema: AnalyzeFormOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('AI analysis failed.');
    return output;
  }
);
