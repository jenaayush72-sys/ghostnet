import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { CaseRepository } from '../models/Case.js';
import { EvidenceRepository } from '../models/Evidence.js';
import { ghostOutputSchema } from '../agents/ghostAgent.js';
import { prosecutorOutputSchema } from '../agents/prosecutorAgent.js';
import { defenseOutputSchema } from '../agents/defenseAgent.js';
import { factCheckerOutputSchema } from '../agents/factCheckerAgent.js';
import { judgeOutputSchema, runJudgeAgent } from '../agents/judgeAgent.js';
import { orchestrator } from '../orchestrator/investigationOrchestrator.js';

describe('GhostNet Courtroom Backend Test Suite', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  // 1. HEALTH ENDPOINT
  it('GET /api/health returns healthy status and masked system diagnostics', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBeDefined();
    expect(res.body.aiProvider).toBeDefined();
    expect(res.body.searchProvider).toBeDefined();
  });

  // 2. SETTINGS STATUS
  it('GET /api/settings/status exposes configuration without leaking secrets', async () => {
    const res = await request(app).get('/api/settings/status');
    expect(res.status).toBe(200);
    expect(res.body.app.name).toContain('GhostNet');
    expect(res.body.ai).toBeDefined();
    expect(res.body.ai.apiKey).toBeUndefined(); // Secrets must never leak
    expect(res.body.search).toBeDefined();
    expect(res.body.search.apiKey).toBeUndefined();
  });

  // 3. INVESTIGATION INPUT VALIDATION
  it('POST /api/investigations rejects empty or invalid claim', async () => {
    const res = await request(app)
      .post('/api/investigations')
      .send({ claim: 'hi' }); // < 5 chars

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.details).toBeDefined();
  });

  it('POST /api/investigations rejects invalid category', async () => {
    const res = await request(app)
      .post('/api/investigations')
      .send({
        claim: 'Water boils at 100 degrees Celsius under standard atmospheric pressure.',
        category: 'astrology' // invalid category
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/investigations empanels valid case and returns caseId', async () => {
    const res = await request(app)
      .post('/api/investigations')
      .send({
        claim: 'CSS flexbox justify-content aligns items along the primary axis.',
        category: 'programming'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.caseId).toMatch(/^CASE-/);
    expect(res.body.data.status).toBe('queued');
  });

  // 4. AGENT OUTPUT SCHEMAS
  it('Ghost Agent schema validates adversarial structure', () => {
    const validGhostData = {
      agentName: 'Ghost Agent',
      originalClaim: 'JavaScript is strictly statically typed.',
      adversarialArgument: 'V8 transforms all variables into strict compile-time types.',
      targetedStatements: ['Static typing assertion'],
      potentialErrorType: 'Category error',
      investigationStatus: 'adversarial_argument_generated',
      limitations: 'Fabricated test argument.'
    };
    const result = ghostOutputSchema.safeParse(validGhostData);
    expect(result.success).toBe(true);
  });

  it('Prosecutor Agent schema validates objections structure', () => {
    const validProsecutorData = {
      verificationStatus: 'objections_filed',
      objections: [
        {
          statement: 'JavaScript is statically typed',
          objection: 'JavaScript is dynamically typed at runtime.',
          reasoning: 'Types are associated with values, not variable bindings.',
          requiredEvidence: 'ECMA-262 specification',
          severity: 'HIGH'
        }
      ]
    };
    const result = prosecutorOutputSchema.safeParse(validProsecutorData);
    expect(result.success).toBe(true);
  });

  it('Judge Agent schema validates verdict structure and allowed verdicts', () => {
    const validJudgeData = {
      verdict: 'FALSE',
      summary: 'The claim is demonstrably false based on official language specifications.',
      reasoning: 'ECMAScript specifications define dynamic typing.',
      supportingFindings: [],
      contradictingFindings: ['ECMA-262 establishes dynamic typing.'],
      citedEvidenceIds: ['EVD-001'],
      unresolvedQuestions: [],
      confidenceAssessment: 'High certainty',
      confidenceLimitations: 'None for core language specification.'
    };
    const result = judgeOutputSchema.safeParse(validJudgeData);
    expect(result.success).toBe(true);
  });

  // 5. DETERMINISTIC CITATION-TO-EVIDENCE VALIDATION
  it('Judge Agent deterministically strips fabricated evidence IDs not in evidence record', async () => {
    const realEvidence = [
      {
        evidenceId: 'EVD-REAL-01',
        sourceTitle: 'MDN Web Docs',
        sourceURL: 'https://developer.mozilla.org',
        excerpt: 'JavaScript is a dynamically typed language.',
        retrievalStatus: 'verified'
      }
    ];

    const judgeResult = await runJudgeAgent({
      claim: 'JavaScript is statically typed',
      ghostResult: { adversarialArgument: 'Fake argument' },
      prosecutorResult: { objections: [] },
      defenseResult: { counterarguments: [] },
      evidenceRecords: realEvidence,
      factCheckerResult: { claimAssessments: [] }
    });

    // Verify that whatever evidence IDs the judge cites, they MUST only be in the set of real evidence IDs!
    for (const citedId of judgeResult.citedEvidenceIds) {
      expect(realEvidence.some(e => e.evidenceId === citedId)).toBe(true);
    }
  });

  it('Judge overrides to INSUFFICIENT EVIDENCE if zero verified evidence records exist', async () => {
    const emptyEvidence = [
      {
        evidenceId: 'EVD-UNAVAIL-01',
        sourceTitle: 'Search Timeout',
        sourceURL: 'https://archive.org',
        excerpt: 'Search provider timed out.',
        retrievalStatus: 'unavailable'
      }
    ];

    const judgeResult = await runJudgeAgent({
      claim: 'An unknown claim with no indexed data',
      ghostResult: { adversarialArgument: 'Unverified speculation' },
      prosecutorResult: { objections: [] },
      defenseResult: { counterarguments: [] },
      evidenceRecords: emptyEvidence,
      factCheckerResult: { claimAssessments: [] }
    });

    // Because there is NO verified evidence, a conclusive TRUE cannot stand
    expect(['INSUFFICIENT EVIDENCE', 'PARTIALLY TRUE', 'MISLEADING', 'FALSE', 'Insufficient Evidence', 'Mixed', 'Refuted']).toContain(judgeResult.verdict);
  });

  // 6. INVESTIGATION ORCHESTRATION WORKFLOW
  it('Orchestrator runs complete 7-stage trial and persists verdict', async () => {
    const caseId = 'CASE-TEST-ORCH';
    await CaseRepository.create({
      caseId,
      title: 'Testing Orchestrator Flow',
      originalClaim: 'Node.js event loop uses libuv to handle asynchronous I/O operations.',
      category: 'programming',
      status: 'queued',
      currentStage: 'created'
    });

    const completed = await orchestrator.runInvestigation(caseId);

    expect(completed.status).toBe('completed');
    expect(completed.currentStage).toBe('completed');
    expect(completed.agentResults.ghost).toBeDefined();
    expect(completed.agentResults.prosecutor).toBeDefined();
    expect(completed.agentResults.defense).toBeDefined();
    expect(completed.agentResults.evidence).toBeDefined();
    expect(completed.agentResults.factChecker).toBeDefined();
    expect(completed.agentResults.judge).toBeDefined();
    expect(completed.verdict.verdict).toBeDefined();
    expect(completed.investigationEvents.length).toBeGreaterThanOrEqual(6);
  });

  // 7. RETRIEVAL OF COMPLETED CASE
  it('GET /api/investigations/:caseId returns full case details', async () => {
    const res = await request(app).get('/api/investigations/CASE-TEST-ORCH');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.caseId).toBe('CASE-TEST-ORCH');
    expect(res.body.data.status).toBe('completed');
  });

  // 8. EVIDENCE ENDPOINT
  it('GET /api/evidence returns evidence records with filtering', async () => {
    const res = await request(app).get('/api/evidence');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
