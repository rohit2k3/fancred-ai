'use server';

/**
 * @fileOverview AI flow to generate a personalized fan quote for minting as an NFT.
 *
 * - generateFanQuote - Generates a unique fan quote based on user activity.
 * - MintYourMomentInput - The input type for the generateFanQuote function.
 * - MintYourMomentOutput - The return type for the generateFanQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MintYourMomentInputSchema = z.object({
  fanActivity: z
    .string()
    .describe('Description of the user\u2019s fan activities and engagement.'),
});
export type MintYourMomentInput = z.infer<typeof MintYourMomentInputSchema>;

const MintYourMomentOutputSchema = z.object({
  fanQuote: z
    .string()
    .describe(
      'A personalized quote that reflects the user\u2019s unique fandom and activities.'
    ),
});
export type MintYourMomentOutput = z.infer<typeof MintYourMomentOutputSchema>;

export async function generateFanQuote(
  input: MintYourMomentInput
): Promise<MintYourMomentOutput> {
  return mintYourMomentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mintYourMomentPrompt',
  input: {schema: MintYourMomentInputSchema},
  output: {schema: MintYourMomentOutputSchema},
  prompt: `You are an AI assistant that crafts personalized and inspirational quotes for sports fans.
  Based on their described fan activity, create a unique quote that captures their dedication and passion.
  The quote should be suitable for minting as part of a digital collectible.

  Fan Activity: {{{fanActivity}}}

  Quote:`,
});

const mintYourMomentFlow = ai.defineFlow(
  {
    name: 'mintYourMomentFlow',
    inputSchema: MintYourMomentInputSchema,
    outputSchema: MintYourMomentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
