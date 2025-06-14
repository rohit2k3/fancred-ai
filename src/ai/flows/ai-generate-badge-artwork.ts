'use server';
/**
 * @fileOverview An AI agent to generate badge artwork based on fandom traits.
 *
 * - aiGenerateBadgeArtwork - A function that handles the badge artwork generation process.
 * - AiGenerateBadgeArtworkInput - The input type for the aiGenerateBadgeArtwork function.
 * - AiGenerateBadgeArtworkOutput - The return type for the aiGenerateBadgeArtwork function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiGenerateBadgeArtworkInputSchema = z.object({
  fandomTraits: z
    .string()
    .describe('A description of the user\'s fandom traits.'),
});
export type AiGenerateBadgeArtworkInput = z.infer<typeof AiGenerateBadgeArtworkInputSchema>;

const AiGenerateBadgeArtworkOutputSchema = z.object({
  badgeArtwork: z
    .string()
    .describe(
      'A data URI containing the generated badge artwork as a PNG image. It must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'      
    ),
});
export type AiGenerateBadgeArtworkOutput = z.infer<typeof AiGenerateBadgeArtworkOutputSchema>;

export async function aiGenerateBadgeArtwork(input: AiGenerateBadgeArtworkInput): Promise<AiGenerateBadgeArtworkOutput> {
  return aiGenerateBadgeArtworkFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiGenerateBadgeArtworkPrompt',
  input: {schema: AiGenerateBadgeArtworkInputSchema},
  output: {schema: AiGenerateBadgeArtworkOutputSchema},
  prompt: `You are an AI artist specializing in generating personalized badge artwork for sports fans.

  Based on the provided fandom traits, generate a unique and visually appealing badge artwork that represents the fan's identity.

  Fandom Traits: {{{fandomTraits}}}

  The badge artwork should be a PNG image encoded as a data URI.
  \n  Output only the image data URI, without any additional text or explanations.
  \n  Ensure that the data URI includes the MIME type and uses Base64 encoding, following this format: 'data:image/png;base64,<encoded_data>'.`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const aiGenerateBadgeArtworkFlow = ai.defineFlow(
  {
    name: 'aiGenerateBadgeArtworkFlow',
    inputSchema: AiGenerateBadgeArtworkInputSchema,
    outputSchema: AiGenerateBadgeArtworkOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-exp model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-exp',

      // simple prompt
      prompt: `Generate an image of a badge artwork based on these fandom traits: ${input.fandomTraits}`,

      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });
    return {badgeArtwork: media.url!};
  }
);
