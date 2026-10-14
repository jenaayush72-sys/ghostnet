import { z } from 'zod';
import { aiProvider } from '../services/ai/provider.js';

export const prosecutorOutputSchema = z.object({
  verificationStatus: z.string().default('objections_filed'),
  objections: z.array(z.object({
    statement: z.string(),
    objection: z.string(),
    reasoning: z.string(),
    requiredEvidence: z.string(),
    severity: z.enum(['HIGH', 'MEDIUM', 'LOW'])
  })).min(1)
});

export async function runProsecutorAgent({ claim, ghostArgument, targetedStatements = [] }) {
  const systemPrompt = `You are the Prosecutor Agent in GhostNet AI Courtroom.
PURPOSE:
Challenge the adversarial argument created by the Ghost Agent and scrutinize the original claim.
Identify factual inaccuracies, unsupported assumptions, misleading generalizations, and missing qualifiers.

CORE RULES:
1. Do not assume the Ghost Agent is wrong simply because of its role; inspect the actual statements.
2. Separate factual objections (disputed data/facts) from logical objections (flawed deductive leaps).
3. Specify what external evidence would be needed to settle each objection.
4. Return pure structured JSON matching the schema.`;

  const userPrompt = `Claim: "${claim}"
Ghost Agent Argument: "${ghostArgument}"
Targeted Statements: ${JSON.stringify(targetedStatements)}

Prosecute this case: File rigorous objections against unsupported premises, flawed reasoning, and missing empirical corroboration.`;

  const result = await aiProvider.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    schema: prosecutorOutputSchema,
    temperature: 0.2
  });

  return {
    agentName: 'Prosecutor Agent',
    ...result,
    completedAt: new Date()
  };
}
