import { z } from 'zod';
import { aiProvider } from '../services/ai/provider.js';

export const prosecutorOutputSchema = z.object({
  verificationStatus: z.string().default('objections_filed'),
  objections: z.array(z.any()).default([])
});

export async function runProsecutorAgent({ claim, ghostArgument, targetedStatements = [] }) {
  const systemPrompt = `You are the Prosecutor Agent in GhostNet AI Courtroom, powered by Sarvam AI.
PURPOSE:
Directly cross-examine the claim and challenge the Ghost Agent's (Groq) argument.

TONE & LANGUAGE RULES (CRITICAL):
1. Speak like a sharp prosecutor talking directly to a real jury in plain, easy-to-understand English.
2. DO NOT use dense academic jargon. Speak clearly and directly: call out what is misleading, where words are being twisted, or where things are being mixed up.
3. Be punchy, direct, and common-sense.
4. Provide pure structured JSON matching this EXACT template:
{
  "verificationStatus": "objections_filed",
  "objections": [
    {
      "statement": "<the specific phrase or part of the claim you object to>",
      "objection": "<short, clear objection in plain English>",
      "reasoning": "<1-2 simple sentences explaining why this is misleading or untrue>",
      "requiredEvidence": "<what simple proof or rule is needed>",
      "severity": "HIGH"
    }
  ]
}`;

  const userPrompt = `ORIGINAL CLAIM ON TRIAL: "${claim}"
GHOST AGENT (Groq) ARGUMENT: "${ghostArgument}"
STATEMENTS UNDER SCRUTINY: ${JSON.stringify(targetedStatements)}

Prosecute this case: File clear, plain-English objections against the claim and the Ghost Agent's argument. Explain simply where the trick is and why this statement cannot be accepted without proof. Return ONLY the JSON object.`;

  const result = await aiProvider.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    schema: prosecutorOutputSchema,
    temperature: 0.2
  });

  const rawObjections = Array.isArray(result.objections) && result.objections.length > 0 ? result.objections : [
    {
      statement: claim,
      objection: result.objection || 'This statement is misleading unless you clearly explain the specific context or conditions.',
      reasoning: result.reasoning || 'Asserting this as a universal truth ignores key constraints and specifications.',
      requiredEvidence: result.requiredEvidence || 'Authoritative specifications or verified reference documentation.',
      severity: 'HIGH'
    }
  ];

  const sanitizedObjections = rawObjections.map(o => ({
    statement: typeof o === 'string' ? o : (o.statement || claim),
    objection: typeof o === 'string' ? o : (o.objection || 'This statement is misleading without clear context.'),
    reasoning: o.reasoning || 'Needs clear common-sense proof and authoritative reference.',
    requiredEvidence: o.requiredEvidence || 'Official documentation or normative standards.',
    severity: ['HIGH', 'MEDIUM', 'LOW'].includes(o.severity) ? o.severity : 'HIGH'
  }));

  return {
    agentName: 'Prosecutor Agent',
    ...result,
    objections: sanitizedObjections,
    verificationStatus: 'objections_filed',
    completedAt: new Date()
  };
}
