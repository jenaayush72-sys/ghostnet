import { z } from 'zod';
import { aiProvider } from '../services/ai/provider.js';

export const defenseOutputSchema = z.object({
  counterarguments: z.array(z.any()).default([]),
  objectionsAccepted: z.array(z.string()).default([]),
  objectionsChallenged: z.array(z.string()).default([]),
  alternativeInterpretations: z.array(z.string()).default([]),
  remainingUncertainties: z.array(z.string()).default([])
});

export async function runDefenseAgent({ claim, objections = [], ghostArgument = '' }) {
  const systemPrompt = `You are the Defense Agent in GhostNet AI Courtroom, powered by Groq (120B).
PURPOSE:
Directly answer the Prosecutor Agent's (Sarvam AI) objections with fairness and common sense.

TONE & LANGUAGE RULES (CRITICAL):
1. Speak like a smart, relatable defense lawyer explaining things simply and clearly to a jury.
2. DO NOT use dense academic jargon. Speak in everyday English with relatable analogies (e.g. "Think of it like sticking two word stickers together rather than doing math on numbers...").
3. Fairly admit what the prosecution is right about (e.g. in normal math, 1+1 will never be 11).
4. Clearly explain the exact situation where the statement is actually completely true and makes sense (e.g. in computer programming when you combine text strings).
5. Provide pure structured JSON matching this EXACT template:
{
  "defenseStatus": "arguments_filed",
  "counterarguments": [
    {
      "objectionTarget": "<the prosecution objection you are answering>",
      "defenseArgument": "<clear, common-sense explanation in plain English>",
      "conditionsWhereTrue": "<plain-English description of when this is actually true, e.g. When treating '1' and '1' as text in languages like JavaScript>"
    }
  ],
  "objectionsAccepted": ["<fair point admitted in plain English>"],
  "objectionsChallenged": ["<point challenged in plain English>"],
  "alternativeInterpretations": ["<alternative simple interpretation>"],
  "remainingUncertainties": []
}`;

  const userPrompt = `ORIGINAL CLAIM: "${claim}"
GHOST AGENT THESIS: "${ghostArgument}"
PROSECUTOR (Sarvam AI) OBJECTIONS: ${JSON.stringify(objections)}

Mount a common-sense defense: Directly answer the Prosecutor's objections in plain English, admit obvious facts, and explain clearly where this claim actually works. Return ONLY the JSON object.`;

  const result = await aiProvider.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    schema: defenseOutputSchema,
    temperature: 0.3
  });

  const rawCounters = Array.isArray(result.counterarguments) && result.counterarguments.length > 0 ? result.counterarguments : [
    {
      objectionTarget: 'Prosecution objection',
      defenseArgument: result.defenseArgument || 'There is a real-world situation where this statement actually makes total sense.',
      conditionsWhereTrue: result.conditionsWhereTrue || 'True when computer code combines text together instead of adding numbers.'
    }
  ];

  const sanitizedCounters = rawCounters.map(c => ({
    objectionTarget: c.objectionTarget || 'Prosecution point',
    defenseArgument: c.defenseArgument || 'There is a valid, sensible way to understand this.',
    conditionsWhereTrue: c.conditionsWhereTrue || 'True in specific everyday contexts.'
  }));

  return {
    agentName: 'Defense Agent',
    ...result,
    counterarguments: sanitizedCounters,
    objectionsAccepted: Array.isArray(result.objectionsAccepted) ? result.objectionsAccepted : ['Accepted that domain boundary definitions must be explicit.'],
    objectionsChallenged: Array.isArray(result.objectionsChallenged) ? result.objectionsChallenged : ['Challenged assertion that absence of instant proof equates to falsehood.'],
    alternativeInterpretations: Array.isArray(result.alternativeInterpretations) ? result.alternativeInterpretations : ['Alternative domain-specific interpretation.'],
    remainingUncertainties: Array.isArray(result.remainingUncertainties) ? result.remainingUncertainties : [],
    completedAt: new Date()
  };
}
