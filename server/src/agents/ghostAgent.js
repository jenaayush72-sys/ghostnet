import { z } from 'zod';
import { aiProvider } from '../services/ai/provider.js';

export const ghostOutputSchema = z.object({
  agentName: z.literal('Ghost Agent').default('Ghost Agent'),
  originalClaim: z.string(),
  adversarialArgument: z.string(),
  targetedStatements: z.array(z.string()).min(1),
  potentialErrorType: z.string(),
  investigationStatus: z.string().default('adversarial_argument_generated'),
  limitations: z.string()
});

export async function runGhostAgent({ claim, context = '', category = 'general' }) {
  const systemPrompt = `You are the Ghost Agent in GhostNet AI Courtroom.
PURPOSE:
Generate a deliberately flawed, subtly adversarial, or misleading argument regarding the submitted claim, specifically designed for the Courtroom agents (Prosecutor, Defense, Fact-Checker, Judge) to investigate and test.

CORE RULES:
1. Clearly identify the specific assumptions and flawed logic you introduce.
2. Target statements that require verification.
3. NEVER represent your output as verified truth.
4. NEVER generate fake citations or fabricated URLs.
5. Provide pure structured JSON matching the required schema.`;

  const userPrompt = `Category: ${category}
Claim: "${claim}"
${context ? `Context: ${context}` : ''}

Generate a plausible adversarial counter-perspective or subtly flawed argument to put on trial. Identify which specific assertions must be scrutinized.`;

  const result = await aiProvider.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    schema: ghostOutputSchema,
    temperature: 0.4
  });

  return {
    ...result,
    isAdversarialTest: true,
    disclaimer: 'ADVERSARIAL TEST ARGUMENT — NOT VERIFIED FACT'
  };
}
