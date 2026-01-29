'use server';

/**
 * @fileOverview A security analysis flow for code.
 *
 * - analyzeCodeSecurity - Analyzes code for potential security threats.
 * - SecurityAnalysisInput - The input type for the analyzeCodeSecurity function.
 * - SecurityAnalysisOutput - The return type for the analyzeCodeSecurity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SecurityAnalysisInputSchema = z.object({
  code: z.string().describe('The code to analyze for security threats.'),
});

export type SecurityAnalysisInput = z.infer<typeof SecurityAnalysisInputSchema>;

const SecurityAnalysisOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the code is safe to execute.'),
  reason: z.string().describe('The reason for the safety determination.'),
});

export type SecurityAnalysisOutput = z.infer<typeof SecurityAnalysisOutputSchema>;

export async function analyzeCodeSecurity(
  input: SecurityAnalysisInput
): Promise<SecurityAnalysisOutput> {
  return securityAnalysisFlow(input);
}

const securityAnalysisPrompt = ai.definePrompt({
  name: 'securityAnalysisPrompt',
  input: {schema: SecurityAnalysisInputSchema},
  output: {schema: SecurityAnalysisOutputSchema},
  prompt: `You are a security expert analyzing code for potential security threats.

  Analyze the following code and determine if it is safe to execute in a sandboxed environment.

  Code:
  {{code}}

  Based on your analysis, determine whether the code is safe to execute. If not, explain why.
  Set the isSafe boolean to true if safe, and false if not safe. Explain your reasoning in the reason field.`,
});

const securityAnalysisFlow = ai.defineFlow(
  {
    name: 'securityAnalysisFlow',
    inputSchema: SecurityAnalysisInputSchema,
    outputSchema: SecurityAnalysisOutputSchema,
  },
  async input => {
    const {output} = await securityAnalysisPrompt(input);
    return output!;
  }
);
