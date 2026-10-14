import { z } from 'zod';
import { aiProvider } from '../services/ai/provider.js';

export const allowedVerdicts = [
  'TRUE',
  'FALSE',
  'PARTIALLY TRUE',
  'MISLEADING',
  'INSUFFICIENT EVIDENCE'
];

export const judgeOutputSchema = z.object({
  verdict: z.enum(['TRUE', 'FALSE', 'PARTIALLY TRUE', 'MISLEADING', 'INSUFFICIENT EVIDENCE']),
  summary: z.string(),
  reasoning: z.string(),
  supportingFindings: z.array(z.string()),
  contradictingFindings: z.array(z.string()),
  citedEvidenceIds: z.array(z.string()),
  unresolvedQuestions: z.array(z.string()),
  confidenceAssessment: z.string(),
  confidenceLimitations: z.string()
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

  const systemPrompt = `You are the Judge Agent in GhostNet AI Courtroom.
PURPOSE:
Synthesize the entire investigation into an authoritative, explainable, and rigorous final judicial verdict.
You must adjudicate the original claim based primarily on verified EVIDENCE rather than agent consensus.

ALLOWED VERDICTS:
- TRUE (Claim is factually established by authoritative evidence)
- FALSE (Claim is decisively refuted by verified facts)
- PARTIALLY TRUE (Claim contains accurate elements but omits key qualifiers or applies only under specific conditions)
- MISLEADING (Claim relies on flawed causal leaps, selective framing, or distorted context)
- INSUFFICIENT EVIDENCE (Available empirical evidence is missing, ambiguous, or unavailable)

STRICT DETERMINISTIC RULES:
1. You may ONLY cite Evidence IDs that exist in the record: [${Array.from(validEvidenceIds).join(', ') || 'NONE'}]
2. Never treat confidence as a calibrated statistical probability.
3. If no verified evidence was retrieved, you MUST consider INSUFFICIENT EVIDENCE.
4. Return pure structured JSON.`;

  const userPrompt = `ORIGINAL CLAIM: "${claim}"

GHOST AGENT ARGUMENT:
${ghostResult?.adversarialArgument || 'N/A'}

PROSECUTOR OBJECTIONS:
${JSON.stringify(prosecutorResult?.objections || [], null, 2)}

DEFENSE COUNTERARGUMENTS:
${JSON.stringify(defenseResult?.counterarguments || [], null, 2)}

FACT-CHECKER ASSESSMENTS:
${JSON.stringify(factCheckerResult?.claimAssessments || [], null, 2)}

AVAILABLE EVIDENCE RECORDS:
${evidenceRecords.map(e => `[${e.evidenceId}] ${e.sourceTitle} (${e.retrievalStatus}) - "${e.excerpt.slice(0, 150)}..."`).join('\n') || 'None'}

Issue your final verdict and explainable judgment.`;

  const result = await aiProvider.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    schema: judgeOutputSchema,
    temperature: 0.1
  });

  // DETERMINISTIC VERDICT INTEGRITY RULES:
  // 1. Sanitize cited evidence IDs so no fabricated ID ever escapes
  const verifiedCitedIds = (result.citedEvidenceIds || []).filter(id => validEvidenceIds.has(id));

  let finalVerdict = result.verdict;
  let finalReasoning = result.reasoning;

  // 2. If no verified evidence exists at all, do not allow a conclusive TRUE based on external evidence
  if (!hasVerifiedEvidence && finalVerdict === 'TRUE') {
    finalVerdict = 'INSUFFICIENT EVIDENCE';
    finalReasoning += ' [Deterministic Judicial Override: Reclassified to INSUFFICIENT EVIDENCE because no primary verified external records could be indexed to corroborate the claim.]';
  }

  return {
    agentName: 'Judge Agent',
    ...result,
    verdict: finalVerdict,
    citedEvidenceIds: verifiedCitedIds,
    reasoning: finalReasoning,
    completedAt: new Date()
  };
}
