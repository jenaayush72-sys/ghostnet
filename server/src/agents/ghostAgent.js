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
  const systemPrompt = `You are the Ghost Agent in GhostNet AI Courtroom, powered by Groq (120B).
PURPOSE:
Generate a clever, slightly tricky counter-argument about the submitted claim so the other courtroom agents can debate it.

TONE & LANGUAGE RULES (CRITICAL):
1. Speak in plain, everyday English that anyone or any hackathon judge can understand immediately.
2. DO NOT use heavy, complicated academic jargon. Keep it punchy, engaging, and clear.
3. Clearly explain what the trick, catch, or loophole is in simple terms.
4. Provide pure structured JSON matching this EXACT template:
{
  "originalClaim": "${claim}",
  "adversarialArgument": "<clever counter-argument in plain English>",
  "targetedStatements": ["<assertion 1 to test in plain English>", "<assertion 2 to test in plain English>"],
  "potentialErrorType": "<simple phrase, e.g. Mixing text with numbers, or Leaving out context>",
  "limitations": "<simple sentence about why this counter-argument is just for testing>"
}`;

  const userPrompt = `Category: ${category}
Claim: "${claim}"
${context ? `Context: ${context}` : ''}

Explain in simple, everyday English what clever trick, loophole, or catch makes this claim interesting or misleading to test in court. Return ONLY the JSON object.`;

  const result = await aiProvider.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    schema: ghostOutputSchema,
    temperature: 0.4
  });

  const argument = result.adversarialArgument || result.adversarial_argument || result.argument || result.thesis || (
    `Here is the catch: While "${claim}" sounds straightforward, it changes completely depending on how you look at it. For example, in basic math it means one thing, but in computer code or word games it means something completely different.`
  );

  const statements = Array.isArray(result.targetedStatements) && result.targetedStatements.length > 0
    ? result.targetedStatements
    : (Array.isArray(result.targeted_statements) && result.targeted_statements.length > 0
      ? result.targeted_statements
      : [claim, `Unqualified general truth of "${claim}" across all domains`]);

  return {
    agentName: 'Ghost Agent',
    originalClaim: result.originalClaim || result.original_claim || claim,
    adversarialArgument: argument,
    targetedStatements: statements,
    potentialErrorType: result.potentialErrorType || result.potential_error_type || 'Contextual conflation',
    investigationStatus: 'adversarial_argument_generated',
    limitations: result.limitations || 'Adversarial hypothesis generated for judicial testing.',
    isAdversarialTest: true,
    disclaimer: 'ADVERSARIAL TEST ARGUMENT — NOT VERIFIED FACT'
  };
}
