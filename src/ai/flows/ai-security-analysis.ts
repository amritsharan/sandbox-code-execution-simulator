'use server';

/**
 * @fileOverview An AI-powered security analysis flow for code.
 *
 * - analyzeCodeSecurity - Analyzes code for potential security threats.
 * - AISecurityAnalysisInput - The input type for the analyzeCodeSecurity function.
 * - AISecurityAnalysisOutput - The return type for the analyzeCodeSecurity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISecurityAnalysisInputSchema = z.object({
  code: z.string().describe('The code to analyze for security threats.'),
});

export type AISecurityAnalysisInput = z.infer<typeof AISecurityAnalysisInputSchema>;

const AISecurityAnalysisOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the code is safe to execute.'),
  reason: z.string().describe('The reason for the safety determination.'),
});

export type AISecurityAnalysisOutput = z.infer<typeof AISecurityAnalysisOutputSchema>;

export async function analyzeCodeSecurity(
  input: AISecurityAnalysisInput
): Promise<AISecurityAnalysisOutput> {
  return analyzeCodeSecurityFlow(input);
}

const analyzeCodeSecurityPrompt = ai.definePrompt({
  name: 'analyzeCodeSecurityPrompt',
  input: {schema: AISecurityAnalysisInputSchema},
  output: {schema: AISecurityAnalysisOutputSchema},
  prompt: `You are a security expert analyzing code for potential security threats.

  Analyze the following code and determine if it is safe to execute in a sandboxed environment.

  Code:
  {{code}}

  Based on your analysis, determine whether the code is safe to execute. If not, explain why.
  Set the isSafe boolean to true if safe, and false if not safe. Explain your reasoning in the reason field.`,
});

const analyzeCodeSecurityFlow = ai.defineFlow(
  {
    name: 'analyzeCodeSecurityFlow',
    inputSchema: AISecurityAnalysisInputSchema,
    outputSchema: AISecurityAnalysisOutputSchema,
  },
  async input => {
    const {output} = await analyzeCodeSecurityPrompt(input);
    return output!;
  }
);
