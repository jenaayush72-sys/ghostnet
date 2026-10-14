import { z } from 'zod';
import { aiProvider } from '../services/ai/provider.js';

export const defenseOutputSchema = z.object({
  counterarguments: z.array(z.object({
    objectionTarget: z.string(),
    defenseArgument: z.string(),
    conditionsWhereTrue: z.string()
  })).min(1),
  objectionsAccepted: z.array(z.string()),
  objectionsChallenged: z.array(z.string()),
  alternativeInterpretations: z.array(z.string()),
  remainingUncertainties: z.array(z.string())
});

export async function runDefenseAgent({ claim, objections = [], ghostArgument = '' }) {
  const systemPrompt = `You are the Defense Agent in GhostNet AI Courtroom.
PURPOSE:
Examine the Prosecutor's objections critically. Your goal is NOT to blindly defend falsehoods, but to test the strength and fairness of the prosecution.
Identify weak objections, clarify legitimate contextual nuances, and establish under what specific conditions the assertions may be true.

CORE RULES:
1. Accept fair objections where the prosecution is undeniably correct.
2. Challenge overzealous or pedantic objections.
3. Highlight missing context or alternative interpretations.
4. Return structured JSON matching the schema.`;

  const userPrompt = `Original Claim: "${claim}"
Ghost Agent Argument: "${ghostArgument}"
Prosecutor Objections: ${JSON.stringify(objections)}

Evaluate the prosecution's objections, formulate grounded counterarguments, and distinguish valid nuance from ungrounded claims.`;

  const result = await aiProvider.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    schema: defenseOutputSchema,
    temperature: 0.3
  });

  return {
    agentName: 'Defense Agent',
    ...result,
    completedAt: new Date()
  };
}
