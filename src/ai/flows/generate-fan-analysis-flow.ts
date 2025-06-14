'use server';
/**
 * @fileOverview Generates a personalized fan analysis summary.
 *
 * - generateFanAnalysis - A function that generates a fan analysis summary.
 * - GenerateFanAnalysisInput - The input type for the generateFanAnalysis function.
 * - GenerateFanAnalysisOutput - The return type for the generateFanAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFanAnalysisInputSchema = z.object({
  superfanScore: z.number().describe("The user's current Superfan Score."),
  fanLevel: z.string().describe("The user's current fan level (e.g., Rookie, Pro, Legend)."),
  fandomTraits: z.string().describe("A description of the user's fandom traits and preferences (e.g., team supported, type of fan)."),
  walletAddress: z.string().describe("The user's wallet address."),
  numNftsHeld: z.number().optional().describe('The number of NFTs the user holds.'),
  numRitualsParticipated: z.number().optional().describe('The number of match rituals the user has participated in.'),
});
export type GenerateFanAnalysisInput = z.infer<typeof GenerateFanAnalysisInputSchema>;

const GenerateFanAnalysisOutputSchema = z.object({
  analysisSummary: z.string().describe('A personalized summary of the fan\'s profile, activity, and suggestions for growth.'),
});
export type GenerateFanAnalysisOutput = z.infer<typeof GenerateFanAnalysisOutputSchema>;

export async function generateFanAnalysis(input: GenerateFanAnalysisInput): Promise<GenerateFanAnalysisOutput> {
  return generateFanAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFanAnalysisPrompt',
  input: {schema: GenerateFanAnalysisInputSchema},
  output: {schema: GenerateFanAnalysisOutputSchema},
  prompt: `You are an AI assistant for FanCred, a platform that scores superfans.
Generate a personalized fan analysis summary for a user based on the following information.
The summary should be engaging, acknowledge their current status, and offer a brief suggestion for how to improve or what to aim for.

User Wallet Address: {{{walletAddress}}}
Superfan Score: {{{superfanScore}}}
Fan Level: {{{fanLevel}}}
Fandom Traits: {{{fandomTraits}}}
{{#if numNftsHeld}}Number of NFTs Held: {{{numNftsHeld}}}{{/if}}
{{#if numRitualsParticipated}}Number of Rituals Participated: {{{numRitualsParticipated}}}{{/if}}

Example Summary: "You're a loyal [Derived Team from FandomTraits] fan with {{#if numNftsHeld}}{{{numNftsHeld}}} NFTs{{else}}a growing collection{{/if}} and {{#if numRitualsParticipated}}{{{numRitualsParticipated}}} match rituals{{else}}getting started with team rituals{{/if}}. Your current score is {{{superfanScore}}}, making you a {{{fanLevel}}}! Keep engaging and participating in rituals to unlock Level [Next Level/Higher Target] and earn more FanCred!"

Craft a summary that is positive and encouraging.
If team information is present in Fandom Traits, try to incorporate it.
If numNftsHeld or numRitualsParticipated are not provided, adapt the summary gracefully.
The output should be a single string for 'analysisSummary'.
`,
});

const generateFanAnalysisFlow = ai.defineFlow(
  {
    name: 'generateFanAnalysisFlow',
    inputSchema: GenerateFanAnalysisInputSchema,
    outputSchema: GenerateFanAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
