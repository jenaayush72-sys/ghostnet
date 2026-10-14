import { searchService } from '../services/search/searchService.js';
import { EvidenceRepository } from '../models/Evidence.js';

export async function runEvidenceAgent({ caseId, claim, category = 'general' }) {
  // 1. Break claim into atomic factual queries
  const cleanClaim = claim.trim();
  const subQueries = [
    cleanClaim,
    cleanClaim.split(/,|\.|;|because|and/i)[0].trim()
  ].filter(q => q.length > 5);

  const uniqueQueries = Array.from(new Set(subQueries)).slice(0, 2);

  const allEvidence = [];
  let counter = 1;

  for (const query of uniqueQueries) {
    const claimId = `CLM-${String(counter).padStart(2, '0')}`;
    const retrieved = await searchService.searchEvidence({ claim: query, category, claimId });

    for (const item of retrieved) {
      const evidenceId = `EVD-${String(allEvidence.length + 1).padStart(3, '0')}`;
      const record = {
        evidenceId,
        caseId,
        claimId: item.claimId || claimId,
        sourceTitle: item.sourceTitle,
        sourceURL: item.sourceURL,
        sourceDomain: item.sourceDomain || (item.sourceURL ? new URL(item.sourceURL).hostname : 'unknown'),
        excerpt: item.excerpt,
        publishedAt: item.publishedAt || null,
        retrievedAt: item.retrievedAt || new Date(),
        evidenceDirection: item.evidenceDirection || 'context',
        sourceType: item.sourceType || 'general_web',
        retrievalStatus: item.retrievalStatus || 'verified'
      };
      allEvidence.push(record);
    }
    counter++;
  }

  // Persist all retrieved evidence records
  if (allEvidence.length > 0) {
    await EvidenceRepository.insertMany(allEvidence);
  }

  return {
    agentName: 'Evidence Agent',
    atomicStatements: uniqueQueries,
    evidenceRecords: allEvidence,
    retrievedCount: allEvidence.length,
    verifiedCount: allEvidence.filter(e => e.retrievalStatus === 'verified').length,
    summary: allEvidence.length > 0
      ? `Retrieved ${allEvidence.length} primary reference source(s) across atomic factual statements.`
      : 'No verifiable external evidence could be indexed for this claim.',
    completedAt: new Date()
  };
}
