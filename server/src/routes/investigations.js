import express from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { CaseRepository } from '../models/Case.js';
import { EvidenceRepository } from '../models/Evidence.js';
import { orchestrator } from '../orchestrator/investigationOrchestrator.js';

const router = express.Router();

const createCaseSchema = z.object({
  claim: z.string().min(5, 'Claim must be at least 5 characters').max(3000, 'Claim exceeds maximum limit of 3000 characters'),
  title: z.string().max(150, 'Title exceeds 150 characters').optional().default(''),
  category: z.enum(['general', 'programming', 'news', 'decision']).default('general'),
  context: z.string().max(3000).optional().default(''),
  sourceUrl: z.string().url('Invalid source URL format').optional().or(z.literal(''))
});

/**
 * POST /api/investigations
 * Create and empanel a new case, then dispatch orchestration
 */
router.post('/', async (req, res, next) => {
  try {
    const parsed = createCaseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
      });
    }

    const { claim, title, category, context, sourceUrl } = parsed.data;

    // Generate unique case ID e.g. CASE-8F3A21
    const shortHash = crypto.randomBytes(3).toString('hex').toUpperCase();
    const caseId = `CASE-${shortHash}`;
    const generatedTitle = title?.trim() || claim.slice(0, 60) + (claim.length > 60 ? '...' : '');

    const caseDoc = await CaseRepository.create({
      caseId,
      title: generatedTitle,
      originalClaim: claim,
      category,
      context: context || '',
      sourceUrl: sourceUrl || '',
      status: 'queued',
      currentStage: 'created',
      agentResults: {},
      investigationEvents: [],
      evidenceReferences: []
    });

    // Dispatch orchestrator asynchronously so response returns immediately
    setTimeout(() => {
      orchestrator.runInvestigation(caseId).catch(err => {
        console.error(`[Investigations] Background error for ${caseId}:`, err);
      });
    }, 50);

    return res.status(201).json({
      success: true,
      data: {
        caseId: caseDoc.caseId,
        title: caseDoc.title,
        status: caseDoc.status,
        currentStage: caseDoc.currentStage,
        createdAt: caseDoc.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/investigations
 * Return paginated case history with filters & search
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, status, verdict, search, limit = 20, skip = 0 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (verdict) query.verdict = verdict;

    let cases = await CaseRepository.find(query, {
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10)
    });

    if (search) {
      const q = search.toLowerCase();
      cases = cases.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.originalClaim?.toLowerCase().includes(q) ||
        c.caseId?.toLowerCase().includes(q)
      );
    }

    const total = await CaseRepository.countDocuments(query);

    return res.json({
      success: true,
      data: cases,
      total,
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/investigations/:caseId
 * Return full case details & status
 */
router.get('/:caseId', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const caseDoc = await CaseRepository.findOneByCaseId(caseId);

    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        error: `Investigation case "${caseId}" not found.`
      });
    }

    return res.json({
      success: true,
      data: caseDoc
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/investigations/:caseId/events
 * Real-time Server-Sent Events (SSE) stream for courtroom debate
 */
router.get('/:caseId/events', async (req, res) => {
  const { caseId } = req.params;
  const caseDoc = await CaseRepository.findOneByCaseId(caseId);

  if (!caseDoc) {
    return res.status(404).json({ success: false, error: 'Case not found' });
  }

  // Set SSE response headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  // Replay existing events to the newly connected client
  if (caseDoc.investigationEvents && caseDoc.investigationEvents.length > 0) {
    for (const evt of caseDoc.investigationEvents) {
      res.write(`event: investigation_event\ndata: ${JSON.stringify(evt)}\n\n`);
    }
  }

  const canonicalId = caseDoc.caseId;

  // If already finished or failed, emit terminal state
  if (caseDoc.status === 'completed') {
    res.write(`event: investigation_complete\ndata: ${JSON.stringify({ caseId: canonicalId, status: 'completed' })}\n\n`);
  } else if (caseDoc.status === 'failed') {
    res.write(`event: investigation_error\ndata: ${JSON.stringify(caseDoc.errorDetails || { message: 'Case failed' })}\n\n`);
  }

  // Register with orchestrator for live events
  orchestrator.registerSseClient(canonicalId, res);

  // If case is in_progress or queued but not running in memory (e.g. after server reboot), auto-resume!
  if (caseDoc.status === 'in_progress' || caseDoc.status === 'queued') {
    if (!orchestrator.isInvestigationRunning(canonicalId)) {
      console.log(`[Investigations] Auto-resuming uncompleted case ${canonicalId} in state "${caseDoc.status}"`);
      orchestrator.runInvestigation(canonicalId).catch(err => {
        console.error(`[Investigations] Auto-resume error for ${canonicalId}:`, err);
      });
    }
  }
});

/**
 * GET /api/investigations/:caseId/evidence
 * Return all evidence gathered for a specific case
 */
router.get('/:caseId/evidence', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const evidence = await EvidenceRepository.findByCaseId(caseId);
    return res.json({
      success: true,
      data: evidence
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/investigations/:caseId/challenge
 * Add counter-evidence and rerun the investigation (Challenge & Replay)
 */
router.post('/:caseId/challenge', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { counterEvidence, counterUrl, reason } = req.body;
    if (!counterEvidence || counterEvidence.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Counter-evidence must be at least 5 characters long.' });
    }
    const result = await orchestrator.challengeInvestigation(caseId, {
      counterEvidence: counterEvidence.trim(),
      counterUrl: counterUrl?.trim(),
      reason: reason?.trim()
    });
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/investigations/:caseId/retry
 * Retry an eligible failed case
 */
router.post('/:caseId/retry', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const result = await orchestrator.retryInvestigation(caseId);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/investigations/:caseId/export
 * Download investigation report as JSON or Markdown
 */
router.get('/:caseId/export', async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { format = 'json' } = req.query;
    const caseDoc = await CaseRepository.findOneByCaseId(caseId);
    if (!caseDoc) {
      return res.status(404).json({ success: false, error: `Investigation case "${caseId}" not found.` });
    }
    const evidence = await EvidenceRepository.findByCaseId(caseId);

    if (format === 'markdown' || format === 'md') {
      const v = caseDoc.verdict;
      const md = `# GhostNet AI Courtroom Investigation Report: ${caseDoc.caseId}
**Indicted Claim**: "${caseDoc.originalClaim}"
**Docket Title**: ${caseDoc.title}
**Category**: ${caseDoc.category}
**Status**: ${caseDoc.status}
**Empanelled At**: ${caseDoc.createdAt}
**Verdict Concluded At**: ${caseDoc.completedAt || 'In Session'}

---

## 1. JUDICIAL RULING (Gemma 4 Judge)
- **Official Ruling**: **${v?.verdict || 'PENDING'}**
- **Executive Summary**: ${v?.summary || 'No summary rendered.'}
- **Judicial Synthesis & Reasoning**: ${v?.reasoning || 'No reasoning rendered.'}
- **Confidence Assessment**: ${v?.confidenceAssessment || 'Deterministic primary citation alignment'}
- **Confidence Caveat/Limitations**: ${v?.confidenceLimitations || 'None'}

---

## 2. EVIDENTIARY CONNECTION FLOW
1. **Indicted Claim**: "${caseDoc.originalClaim}"
2. **Corroborating Findings**:
${(v?.supportingFindings || []).map(f => `   - ${f}`).join('\n') || '   - None'}
3. **Contradicting Findings**:
${(v?.contradictingFindings || []).map(f => `   - ${f}`).join('\n') || '   - None'}
4. **Normative Evidence Cited**:
${(v?.citedEvidenceIds || []).map(id => {
  const ev = evidence.find(e => e.evidenceId === id);
  return `   - [${id}] ${ev?.sourceTitle || 'Evidence'} (${ev?.sourceDomain || 'N/A'}) - "${ev?.excerpt || ''}"`;
}).join('\n') || '   - None'}

---

## 3. INDEPENDENT VERIFICATION & CONTRADICTION DETECTOR
- **Fact-Checker Corroboration**:
${(caseDoc.agentResults?.factChecker?.claimAssessments || []).map(a => `   - [${a.supported ? 'CORROBORATED' : 'CONTRADICTED'}] ${a.claim}\n     Assessment: ${a.assessment}`).join('\n') || '   - No assessments recorded.'}

---

## 4. AGENT PLEADINGS & ARGUMENTS
### Ghost Adversarial Premise:
${caseDoc.agentResults?.ghost?.adversarialArgument || 'N/A'}

### Prosecution Objections:
${(caseDoc.agentResults?.prosecutor?.objections || []).map(o => `   - Statement: ${o.statement}\n     Objection: ${o.objection}\n     Burden: ${o.requiredEvidence}`).join('\n') || '   - None'}

### Defense Counterarguments:
${(caseDoc.agentResults?.defense?.counterarguments || []).map(d => `   - Defense: ${d.defenseArgument}\n     Conditions: ${d.conditionsWhereTrue}`).join('\n') || '   - None'}

---

## 5. FULL PRIMARY EVIDENCE LOG (${evidence.length} Records)
${evidence.map(e => `### [${e.evidenceId}] ${e.sourceTitle}
- **Domain**: ${e.sourceDomain}
- **URL**: ${e.sourceURL}
- **Direction**: ${e.evidenceDirection.toUpperCase()}
- **Status**: ${e.retrievalStatus}
- **Excerpt**:
> ${e.excerpt}
`).join('\n') || 'No evidence records cataloged.'}
`;
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="GhostNet-Case-${caseId}-Report.md"`);
      return res.send(md);
    }

    const payload = {
      courtroom: 'GhostNet Autonomous Multi-Agent Courtroom',
      judgeModel: 'Gemma 4 Judge',
      exportedAt: new Date().toISOString(),
      case: caseDoc,
      evidence
    };
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="GhostNet-Case-${caseId}-Report.json"`);
    return res.json(payload);
  } catch (err) {
    next(err);
  }
});

export default router;
