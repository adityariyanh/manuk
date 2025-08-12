// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview An AI agent that suggests replacement equipment based on historical borrowing patterns.
 *
 * - suggestReplacementEquipment - A function that suggests replacement equipment when a piece of equipment is reported for repair.
 * - SuggestReplacementEquipmentInput - The input type for the suggestReplacementEquipment function.
 * - SuggestReplacementEquipmentOutput - The return type for the suggestReplacementEquipment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestReplacementEquipmentInputSchema = z.object({
  brokenEquipmentName: z.string().describe('The name of the equipment that is broken and needs replacement.'),
  userRole: z.string().describe('The role of the user requesting the replacement (e.g., student, teacher).'),
  historicalBorrowingData: z.string().describe('Historical data on equipment borrowing patterns, including equipment types and user roles.'),
});
export type SuggestReplacementEquipmentInput = z.infer<typeof SuggestReplacementEquipmentInputSchema>;

const SuggestReplacementEquipmentOutputSchema = z.object({
  suggestedEquipment: z.array(
    z.string().describe('A list of suitable replacement equipment names.')
  ).describe('The list of suggested replacement equipment based on historical borrowing patterns.'),
  reasoning: z.string().describe('The AI reasoning for suggesting the equipment.'),
});
export type SuggestReplacementEquipmentOutput = z.infer<typeof SuggestReplacementEquipmentOutputSchema>;

export async function suggestReplacementEquipment(input: SuggestReplacementEquipmentInput): Promise<SuggestReplacementEquipmentOutput> {
  return suggestReplacementEquipmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestReplacementEquipmentPrompt',
  input: {schema: SuggestReplacementEquipmentInputSchema},
  output: {schema: SuggestReplacementEquipmentOutputSchema},
  prompt: `You are an AI assistant that suggests replacement equipment based on historical borrowing patterns.

  Given the following information about a broken piece of equipment, the role of the user, and historical borrowing data, suggest a list of suitable replacement equipment.

  Broken Equipment Name: {{{brokenEquipmentName}}}
  User Role: {{{userRole}}}
  Historical Borrowing Data: {{{historicalBorrowingData}}}

  Consider the user's role and historical borrowing patterns to suggest the most appropriate replacement equipment.
  Explain your reasoning for suggesting the equipment.

  Format your response as a JSON object with \"suggestedEquipment\" (a list of equipment names) and \"reasoning\" fields.
  `,
});

const suggestReplacementEquipmentFlow = ai.defineFlow(
  {
    name: 'suggestReplacementEquipmentFlow',
    inputSchema: SuggestReplacementEquipmentInputSchema,
    outputSchema: SuggestReplacementEquipmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
