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

  // If already finished or failed, emit terminal state
  if (caseDoc.status === 'completed') {
    res.write(`event: investigation_complete\ndata: ${JSON.stringify({ caseId, status: 'completed' })}\n\n`);
  } else if (caseDoc.status === 'failed') {
    res.write(`event: investigation_error\ndata: ${JSON.stringify(caseDoc.errorDetails || { message: 'Case failed' })}\n\n`);
  }

  // Register with orchestrator for live events
  orchestrator.registerSseClient(caseId, res);
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

export default router;
