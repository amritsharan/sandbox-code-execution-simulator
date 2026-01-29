'use server';

import {
  analyzeCodeSecurity,
  type AISecurityAnalysisOutput,
} from '@/ai/flows/ai-security-analysis';

export async function runSecurityAnalysis(
  code: string
): Promise<AISecurityAnalysisOutput> {
  if (!code.trim()) {
    return {
      isSafe: true,
      reason: 'No code provided to analyze.',
    };
  }

  try {
    const result = await analyzeCodeSecurity({ code });
    return result;
  } catch (error) {
    console.error('AI Security Analysis failed:', error);
    // In case of an AI error, we should not run the code.
    return {
      isSafe: false,
      reason:
        'Could not perform AI security analysis. Execution halted as a precaution.',
    };
  }
}
