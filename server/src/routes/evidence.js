import express from 'express';
import { EvidenceRepository } from '../models/Evidence.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { caseId, direction, status, search, limit = 50, skip = 0 } = req.query;

    const query = {};
    if (caseId) query.caseId = caseId;
    if (direction) query.evidenceDirection = direction;
    if (status) query.retrievalStatus = status;

    let items = await EvidenceRepository.find(query, {
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10)
    });

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(e =>
        e.sourceTitle?.toLowerCase().includes(q) ||
        e.excerpt?.toLowerCase().includes(q) ||
        e.sourceDomain?.toLowerCase().includes(q)
      );
    }

    const total = await EvidenceRepository.countDocuments(query);

    res.json({
      success: true,
      data: items,
      total,
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10)
    });
  } catch (err) {
    next(err);
  }
});

export default router;
