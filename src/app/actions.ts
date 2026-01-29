'use server';

import {
  analyzeCodeSecurity,
  type SecurityAnalysisOutput,
} from '@/ai/flows/ai-security-analysis';

export async function runSecurityAnalysis(
  code: string
): Promise<SecurityAnalysisOutput> {
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
    console.error('Security analysis failed:', error);
    // In case of an analysis error, we should not run the code.
    return {
      isSafe: false,
      reason:
        'Could not perform security analysis. Execution halted as a precaution.',
    };
  }
}
