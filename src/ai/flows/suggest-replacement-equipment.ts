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

Your goal is to suggest a list of suitable replacement equipment when a piece of equipment is reported as broken.

Analyze the provided information: the name of the broken equipment, the role of the user requesting the replacement, and the historical borrowing data. Your suggestions should be tailored to the user's role and reflect common borrowing patterns.

ALWAYS respond with a valid JSON object that strictly follows this format:
{
  "suggestedEquipment": ["<suggestion1>", "<suggestion2>", ...],
  "reasoning": "<Your detailed explanation here>"
}

Do not include any text or formatting outside of this JSON object.

Here is the information for the current request:

Broken Equipment Name: {{{brokenEquipmentName}}}
User Role: {{{userRole}}}
Historical Borrowing Data:
{{{historicalBorrowingData}}}
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
