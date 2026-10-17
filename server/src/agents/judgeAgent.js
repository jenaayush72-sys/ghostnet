import { z } from 'zod';
import { aiProvider } from '../services/ai/provider.js';

export const allowedVerdicts = [
  'Supported',
  'Refuted',
  'Mixed',
  'Insufficient Evidence',
  // Compatibility mappings
  'TRUE',
  'FALSE',
  'PARTIALLY TRUE',
  'MISLEADING',
  'INSUFFICIENT EVIDENCE'
];

export const judgeOutputSchema = z.object({
  verdict: z.string().default('Mixed'),
  takeaway: z.string().optional(),
  summary: z.string().optional().default(''),
  reasoning: z.string().optional().default(''),
  truthBreakdown: z.array(z.any()).optional().default([]),
  supportingFindings: z.array(z.string()).default([]),
  contradictingFindings: z.array(z.string()).default([]),
  citedEvidenceIds: z.array(z.string()).default([]),
  unresolvedQuestions: z.array(z.string()).default([]),
  confidenceAssessment: z.string().default('High'),
  confidenceLimitations: z.string().default('')
});

export async function runJudgeAgent({
  claim,
  ghostResult,
  prosecutorResult,
  defenseResult,
  evidenceRecords = [],
  factCheckerResult
}) {
  const validEvidenceIds = new Set(evidenceRecords.map(e => e.evidenceId));
  const hasVerifiedEvidence = evidenceRecords.some(e => e.retrievalStatus === 'verified');

  const systemPrompt = `You are the Supreme Judge Agent in GhostNet AI Courtroom, powered by Google Gemma 4.
PURPOSE:
Synthesize the entire trial into an authoritative, clear, and easy-to-understand final judicial ruling.

TONE & LANGUAGE RULES (CRITICAL):
1. Speak in crystal-clear, plain English that anyone or any hackathon judge understands in 3 seconds.
2. ABSOLUTELY AVOID dense academic jargon and buzzwords like "operational paradigms", "normative epistemological framework", "Peano axiomatic identities", "deterministic heuristic synthesis".
3. Write like a wise, clear-thinking judge explaining the bottom line simply:
   - "takeaway": One punchy, memorable sentence explaining what is actually true. (e.g. "In regular math, 1 + 1 is always 2. It only equals '11' when computer code glues them together as text.")
   - "summary": 2-3 short, clear sentences explaining what is true, what is false, and where the trick is.
   - "truthBreakdown": A breakdown of each sub-premise in simple words, whether it is TRUE or FALSE, and a friendly 1-sentence explanation.

ALLOWED VERDICTS:
- Supported: The claim is demonstrably true and accurate.
- Refuted: The claim is false, invalid, or fundamentally incorrect.
- Mixed: The claim is true under specific conditions (e.g. text in computer code) but false or misleading under others (e.g. regular math).
- Insufficient Evidence: ONLY use this when zero facts exist anywhere. DO NOT use this for logic, programming, or math riddles.

Provide pure structured JSON matching this EXACT template:
{
  "verdict": "Mixed",
  "takeaway": "<One punchy, plain-English sentence summarizing the definitive truth>",
  "truthBreakdown": [
    {
      "premise": "<e.g. In everyday math: 1 + 1 = 2>",
      "status": "TRUE",
      "explanation": "<Simple 1-sentence explanation in plain English>"
    },
    {
      "premise": "<e.g. When computer code treats them like text: '1' + '1' = '11'>",
      "status": "TRUE",
      "explanation": "<Simple 1-sentence explanation in plain English>"
    },
    {
      "premise": "<e.g. Regular math numbers equalling 11: 1 + 1 = 11>",
      "status": "FALSE",
      "explanation": "<Simple 1-sentence explanation in plain English>"
    }
  ],
  "summary": "<2-3 short, clear sentences explaining the bottom line>",
  "reasoning": "<1 clear paragraph explaining how the court reached this decision>",
  "supportingFindings": ["<clear finding in plain English>"],
  "contradictingFindings": ["<clear contradiction in plain English>"],
  "citedEvidenceIds": [],
  "confidenceAssessment": "High",
  "confidenceLimitations": "None"
}`;

  const userPrompt = `ORIGINAL CLAIM ON TRIAL: "${claim}"

GHOST AGENT (Groq) ADVERSARIAL THESIS:
${ghostResult?.adversarialArgument || 'N/A'}

PROSECUTOR AGENT (Sarvam AI) OBJECTIONS:
${JSON.stringify(prosecutorResult?.objections || [], null, 2)}

DEFENSE AGENT (Groq) REBUTTALS & CONTEXT:
${JSON.stringify(defenseResult?.counterarguments || defenseResult?.evaluations || [], null, 2)}

FACT-CHECKER ASSESSMENTS:
${JSON.stringify(factCheckerResult?.claimAssessments || [], null, 2)}

AVAILABLE EVIDENCE RECORDS:
${evidenceRecords.map(e => `[${e.evidenceId}] ${e.sourceTitle} - "${e.excerpt.slice(0, 150)}..."`).join('\n') || 'None'}

Deliver your definitive Gemma 4 Judicial Ruling. Explain the bottom line in clear, plain English that is easy to follow. Return ONLY the JSON object.`;

  const result = await aiProvider.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    schema: judgeOutputSchema,
    temperature: 0.1
  });

  // DETERMINISTIC VERDICT NORMALIZATION:
  let finalVerdict = result.verdict;
  const upper = String(finalVerdict || '').toUpperCase();
  if (upper.includes('PARTIAL') || upper.includes('MISLEADING') || upper.includes('MIXED') || upper.includes('CONTEXT')) {
    finalVerdict = 'Mixed';
  } else if (upper.includes('TRUE') || upper.includes('SUPPORTED')) {
    finalVerdict = 'Supported';
  } else if (upper.includes('FALSE') || upper.includes('REFUTED')) {
    finalVerdict = 'Refuted';
  } else {
    // Only set Insufficient Evidence if it's truly unprovable
    finalVerdict = 'Insufficient Evidence';
  }

  let finalReasoning = result.reasoning || '';
  // If no verified evidence exists at all, reclassify Supported to Insufficient Evidence
  if (!hasVerifiedEvidence && finalVerdict === 'Supported') {
    finalVerdict = 'Insufficient Evidence';
    finalReasoning += ' [Deterministic Judicial Override: Reclassified to Insufficient Evidence because no primary verified external records could be indexed to corroborate the claim.]';
  }

  const verifiedCitedIds = (result.citedEvidenceIds || []).filter(id => validEvidenceIds.has(id));

  // Ensure truthBreakdown is populated and normalized
  let rawBreakdown = Array.isArray(result.truthBreakdown) && result.truthBreakdown.length > 0
    ? result.truthBreakdown
    : [];

  let breakdown = rawBreakdown.map((b, idx) => ({
    premise: b.premise || b.subPremise || b.statement || `Point ${idx + 1}`,
    status: String(b.status || b.verdict || 'TRUE').toUpperCase(),
    explanation: b.explanation || b.reasoning || ''
  }));

  if (breakdown.length === 0) {
    breakdown = [
      {
        premise: claim,
        status: finalVerdict === 'Supported' ? 'TRUE' : (finalVerdict === 'Refuted' ? 'FALSE' : 'MIXED'),
        explanation: result.summary || takeaway
      }
    ];
  }

  const takeaway = result.takeaway || result.summary || 'The court has examined the facts and delivered a clear decision.';

  return {
    agentName: 'Gemma 4 Judge',
    ...result,
    verdict: finalVerdict,
    takeaway,
    summary: result.summary || takeaway,
    truthBreakdown: breakdown,
    reasoning: finalReasoning || result.reasoning || 'After examining the evidence and arguments, the court has synthesized an explainable verdict.',
    supportingFindings: Array.isArray(result.supportingFindings) ? result.supportingFindings : [],
    contradictingFindings: Array.isArray(result.contradictingFindings) ? result.contradictingFindings : [],
    citedEvidenceIds: verifiedCitedIds,
    unresolvedQuestions: Array.isArray(result.unresolvedQuestions) ? result.unresolvedQuestions : [],
    confidenceAssessment: result.confidenceAssessment || 'High judicial certainty based on multi-agent adversarial synthesis.',
    confidenceLimitations: result.confidenceLimitations || 'Ruling is bounded by operational and specification frameworks.',
    completedAt: new Date()
  };
}
