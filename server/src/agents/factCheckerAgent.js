import { z } from 'zod';
import { aiProvider } from '../services/ai/provider.js';

export const factCheckerOutputSchema = z.object({
  claimAssessments: z.array(z.object({
    claim: z.string(),
    supported: z.boolean(),
    supportingEvidenceIds: z.array(z.string()),
    contradictingEvidenceIds: z.array(z.string()),
    assessment: z.string()
  })).min(1),
  citationProblems: z.array(z.string()),
  verificationLimitations: z.string(),
  recommendedConclusion: z.string()
});

export async function runFactCheckerAgent({ claim, ghostArgument, evidenceRecords = [] }) {
  const evidenceSummary = evidenceRecords.map(e => `[${e.evidenceId}] Title: "${e.sourceTitle}" URL: ${e.sourceURL} Excerpt: "${e.excerpt}" Status: ${e.retrievalStatus}`).join('\n');

  const systemPrompt = `You are the Fact-Checker Agent in GhostNet AI Courtroom.
PURPOSE:
Independently audit factual statements against the actual retrieved evidence records.
Validate whether excerpts truly substantiate claims, identify unsupported inferences, verify citation relevance, and flag if evidence is missing or inconclusive.

CORE RULES:
1. Only reference evidence IDs that exist in the provided evidence list.
2. If evidence is unavailable or empty, state so honestly. Do not hallucinate citations.
3. Return pure structured JSON matching the schema.`;

  const userPrompt = `Original Claim: "${claim}"
Ghost Agent Argument: "${ghostArgument}"

Retrieved Evidence Records:
${evidenceSummary || 'No external evidence records currently available.'}

Perform an independent audit: Verify if the available evidence supports, contradicts, or leaves the claim unproven.`;

  const result = await aiProvider.generateStructuredOutput({
    systemPrompt,
    userPrompt,
    schema: factCheckerOutputSchema,
    temperature: 0.1
  });

  // Deterministic guard: Filter supporting/contradicting IDs to only those that actually exist in evidenceRecords
  const validIds = new Set(evidenceRecords.map(e => e.evidenceId));
  const sanitizedAssessments = result.claimAssessments.map(a => ({
    ...a,
    supportingEvidenceIds: a.supportingEvidenceIds.filter(id => validIds.has(id)),
    contradictingEvidenceIds: a.contradictingEvidenceIds.filter(id => validIds.has(id))
  }));

  return {
    agentName: 'Fact-Checker Agent',
    ...result,
    claimAssessments: sanitizedAssessments,
    completedAt: new Date()
  };
}
