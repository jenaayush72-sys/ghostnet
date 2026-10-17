import { z } from 'zod';
import { aiProvider } from '../services/ai/provider.js';

export const factCheckerOutputSchema = z.object({
  claimAssessments: z.array(z.any()).default([]),
  citationProblems: z.array(z.string()).default([]),
  verificationLimitations: z.string().default(''),
  recommendedConclusion: z.string().default('Facts checked against available sources.')
});

export async function runFactCheckerAgent({ claim, ghostArgument, evidenceRecords = [] }) {
  const evidenceSummary = evidenceRecords.map(e => `[${e.evidenceId}] Title: "${e.sourceTitle}" URL: ${e.sourceURL} Excerpt: "${e.excerpt}" Status: ${e.retrievalStatus}`).join('\n');

  const systemPrompt = `You are the Fact-Checker Agent in GhostNet AI Courtroom, powered by Sarvam AI.
PURPOSE:
Check the claims against real facts, documentation, and standard language rules.

TONE & LANGUAGE RULES:
1. Speak in simple, everyday English.
2. Clearly explain what is backed up by official rules and what is just a clever trick or assumption.
3. Keep your conclusion short and easy to understand.`;

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
  const rawAssessments = Array.isArray(result.claimAssessments) ? result.claimAssessments : [
    {
      claim,
      supported: Boolean(result.supported ?? true),
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      assessment: result.assessment || result.summary || result.recommendedConclusion || 'Audited based on available records.'
    }
  ];

  const sanitizedAssessments = rawAssessments.map(a => ({
    claim: a.claim || claim,
    supported: Boolean(a.supported),
    supportingEvidenceIds: (a.supportingEvidenceIds || []).filter(id => validIds.has(id)),
    contradictingEvidenceIds: (a.contradictingEvidenceIds || []).filter(id => validIds.has(id)),
    assessment: a.assessment || 'Assessment completed.'
  }));

  return {
    agentName: 'Fact-Checker Agent',
    ...result,
    claimAssessments: sanitizedAssessments,
    citationProblems: Array.isArray(result.citationProblems) ? result.citationProblems : [],
    verificationLimitations: result.verificationLimitations || 'Bounded by public documentation.',
    recommendedConclusion: result.recommendedConclusion || 'Evidence audit complete.',
    completedAt: new Date()
  };
}
