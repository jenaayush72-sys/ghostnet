import { z } from 'zod';
import { aiProvider } from '../services/ai/provider.js';

export const allowedVerdicts = [
  'Supported',
  'Refuted',
  'Mixed',
  'Insufficient Evidence',
  // Backwards compatibility mappings
  'TRUE',
  'FALSE',
  'PARTIALLY TRUE',
  'MISLEADING',
  'INSUFFICIENT EVIDENCE'
];

export const judgeOutputSchema = z.object({
  verdict: z.string(),
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

ALLOWED VERDICTS (You MUST issue one of these four):
- Supported (Claim is corroborated and validated by verified citations)
- Refuted (Claim is contradicted or definitively falsified by primary evidence)
- Mixed (Claim has partial accuracy but critical caveats, edge limitations, or omitted qualifiers)
- Insufficient Evidence (Primary documentation is unavailable, ambiguous, or lacks empirical confirmation)

STRICT DETERMINISTIC RULES:
1. You may ONLY cite Evidence IDs that exist in the record: [${Array.from(validEvidenceIds).join(', ') || 'NONE'}]
2. Never treat confidence as a calibrated statistical probability.
3. If no verified evidence was retrieved, you MUST consider Insufficient Evidence.
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

Issue your final Gemma 4 verdict and explainable judgment.`;

  const result = await aiProvider.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    schema: judgeOutputSchema,
    temperature: 0.1
  });

  // DETERMINISTIC VERDICT INTEGRITY RULES:
  // Normalize output into the canonical 4 verdicts
  let finalVerdict = result.verdict;
  const upper = String(finalVerdict || '').toUpperCase();
  if (upper.includes('TRUE') || upper === 'SUPPORTED') {
    finalVerdict = 'Supported';
  } else if (upper.includes('FALSE') || upper === 'REFUTED') {
    finalVerdict = 'Refuted';
  } else if (upper.includes('PARTIAL') || upper.includes('MISLEADING') || upper === 'MIXED') {
    finalVerdict = 'Mixed';
  } else {
    finalVerdict = 'Insufficient Evidence';
  }

  const verifiedCitedIds = (result.citedEvidenceIds || []).filter(id => validEvidenceIds.has(id));
  let finalReasoning = result.reasoning;

  // If no verified evidence exists at all, reclassify to Insufficient Evidence
  if (!hasVerifiedEvidence && finalVerdict === 'Supported') {
    finalVerdict = 'Insufficient Evidence';
    finalReasoning += ' [Deterministic Judicial Override: Reclassified to Insufficient Evidence because no primary verified external records could be indexed to corroborate the claim.]';
  }

  return {
    agentName: 'Gemma 4 Judge',
    ...result,
    verdict: finalVerdict,
    citedEvidenceIds: verifiedCitedIds,
    reasoning: finalReasoning,
    completedAt: new Date()
  };
}
