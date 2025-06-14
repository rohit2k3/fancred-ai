'use server';

/**
 * @fileOverview Provides personalized suggestions to improve a user's Superfan Score.
 *
 * - improveFanScoreSuggestions - A function that provides personalized suggestions to improve a user's Superfan Score.
 * - ImproveFanScoreSuggestionsInput - The input type for the improveFanScoreSuggestions function.
 * - ImproveFanScoreSuggestionsOutput - The return type for the improveFanScoreSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveFanScoreSuggestionsInputSchema = z.object({
  superfanScore: z.number().describe('The user\'s current Superfan Score.'),
  walletAddress: z.string().describe('The user\'s wallet address.'),
});
export type ImproveFanScoreSuggestionsInput = z.infer<
  typeof ImproveFanScoreSuggestionsInputSchema
>;

const ImproveFanScoreSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('Personalized suggestions to improve the Superfan Score.'),
});
export type ImproveFanScoreSuggestionsOutput = z.infer<
  typeof ImproveFanScoreSuggestionsOutputSchema
>;

export async function improveFanScoreSuggestions(
  input: ImproveFanScoreSuggestionsInput
): Promise<ImproveFanScoreSuggestionsOutput> {
  return improveFanScoreSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveFanScoreSuggestionsPrompt',
  input: {schema: ImproveFanScoreSuggestionsInputSchema},
  output: {schema: ImproveFanScoreSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized suggestions to users on how to improve their Superfan Score.

  The user's current Superfan Score is: {{{superfanScore}}}
  The user's wallet address is: {{{walletAddress}}}

  Provide a list of specific, actionable suggestions that the user can take to increase their score. The suggestions should be tailored to the user's current score and wallet address, and should take into account the various factors that contribute to the Superfan Score (e.g., number of NFTs held, transaction count).

  Format your response as a JSON array of strings.`,
});

const improveFanScoreSuggestionsFlow = ai.defineFlow(
  {
    name: 'improveFanScoreSuggestionsFlow',
    inputSchema: ImproveFanScoreSuggestionsInputSchema,
    outputSchema: ImproveFanScoreSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
