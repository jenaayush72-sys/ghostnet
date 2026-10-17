import mongoose from 'mongoose';
import { loadCollection, saveCollection } from '../db/fileStorage.js';

const investigationEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  stage: { type: String, required: true },
  agentName: { type: String, required: true },
  eventType: { type: String, required: true },
  content: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const caseSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: '' },
  originalClaim: { type: String, required: true },
  category: {
    type: String,
    enum: ['general', 'programming', 'news', 'decision'],
    default: 'general'
  },
  context: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['queued', 'in_progress', 'completed', 'failed', 'partial'],
    default: 'queued'
  },
  currentStage: {
    type: String,
    enum: [
      'created',
      'ghost_analysis',
      'evidence_retrieval',
      'prosecution',
      'defense',
      'fact_checking',
      'judgment',
      'completed',
      'failed'
    ],
    default: 'created'
  },
  agentResults: {
    ghost: { type: mongoose.Schema.Types.Mixed, default: null },
    prosecutor: { type: mongoose.Schema.Types.Mixed, default: null },
    defense: { type: mongoose.Schema.Types.Mixed, default: null },
    evidence: { type: mongoose.Schema.Types.Mixed, default: null },
    factChecker: { type: mongoose.Schema.Types.Mixed, default: null },
    judge: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  investigationEvents: [investigationEventSchema],
  evidenceReferences: [{ type: String }],
  verdict: {
    verdict: {
      type: String,
      enum: [
        'TRUE', 'FALSE', 'PARTIALLY TRUE', 'MISLEADING', 'INSUFFICIENT EVIDENCE',
        'Supported', 'Refuted', 'Mixed', 'Insufficient Evidence',
        'PENDING', null
      ],
      default: null
    },
    takeaway: { type: String, default: '' },
    summary: { type: String, default: '' },
    reasoning: { type: String, default: '' },
    truthBreakdown: [{
      premise: String,
      status: String,
      explanation: String
    }],
    supportingFindings: [{ type: String }],
    contradictingFindings: [{ type: String }],
    citedEvidenceIds: [{ type: String }],
    unresolvedQuestions: [{ type: String }],
    confidenceAssessment: { type: String, default: '' },
    confidenceLimitations: { type: String, default: '' }
  },
  errorDetails: {
    message: String,
    stage: String,
    agentName: String,
    timestamp: Date
  },
  completedAt: { type: Date, default: null }
}, {
  timestamps: true
});

const MongooseCaseModel = mongoose.model('Case', caseSchema);

// Persistent repository to guarantee all claims and trials survive server restarts
let memoryCases = loadCollection('cases.json');

function getStore() {
  if (memoryCases.size === 0) {
    const fresh = loadCollection('cases.json');
    if (fresh.size > 0) memoryCases = fresh;
  }
  return memoryCases;
}

export const CaseRepository = {
  async create(data) {
    const store = getStore();
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await MongooseCaseModel.create(data);
        store.set(data.caseId, doc.toObject());
        saveCollection('cases.json', store);
        return doc.toObject();
      } catch (err) {
        console.warn(`[CaseRepo] MongoDB save error, falling back to disk/memory: ${err.message}`);
      }
    }
    const doc = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      investigationEvents: data.investigationEvents || [],
      evidenceReferences: data.evidenceReferences || [],
      agentResults: data.agentResults || {},
      verdict: data.verdict || null
    };
    store.set(data.caseId, doc);
    saveCollection('cases.json', store);
    return doc;
  },

  async findOneByCaseId(caseId) {
    if (!caseId) return null;
    const cleanId = String(caseId).trim();
    const hyphenId = cleanId.replace(/\s+/g, '-');
    const spaceId = cleanId.replace(/-/g, ' ');

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await MongooseCaseModel.findOne({
          caseId: { $in: [cleanId, hyphenId, spaceId] }
        }).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn(`[CaseRepo] MongoDB find error: ${err.message}`);
      }
    }
    const store = getStore();
    return store.get(cleanId) || store.get(hyphenId) || store.get(spaceId) || null;
  },

  async updateByCaseId(caseId, updates) {
    updates.updatedAt = new Date();
    const store = getStore();
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await MongooseCaseModel.findOneAndUpdate(
          { caseId },
          { $set: updates },
          { new: true }
        ).lean();
        if (doc) {
          store.set(caseId, doc);
          saveCollection('cases.json', store);
          return doc;
        }
      } catch (err) {
        console.warn(`[CaseRepo] MongoDB update error: ${err.message}`);
      }
    }
    const existing = store.get(caseId);
    if (!existing) return null;
    const merged = { ...existing };
    for (const [key, value] of Object.entries(updates)) {
      if (key.includes('.')) {
        const parts = key.split('.');
        let curr = merged;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!curr[parts[i]]) curr[parts[i]] = {};
          curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = value;
      } else {
        merged[key] = value;
      }
    }
    store.set(caseId, merged);
    saveCollection('cases.json', store);
    return merged;
  },

  async addEvent(caseId, event) {
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || new Date()
    };
    if (mongoose.connection.readyState === 1) {
      try {
        await MongooseCaseModel.updateOne(
          { caseId },
          { $push: { investigationEvents: eventWithTimestamp } }
        );
      } catch (err) {
        console.warn(`[CaseRepo] MongoDB addEvent error: ${err.message}`);
      }
    }
    const store = getStore();
    const existing = store.get(caseId);
    if (existing) {
      if (!existing.investigationEvents) existing.investigationEvents = [];
      existing.investigationEvents.push(eventWithTimestamp);
      store.set(caseId, existing);
      saveCollection('cases.json', store);
    }
    return eventWithTimestamp;
  },

  async find(query = {}, options = {}) {
    const { limit = 20, skip = 0, sort = { createdAt: -1 } } = options;
    if (mongoose.connection.readyState === 1) {
      try {
        const results = await MongooseCaseModel.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean();
        return results;
      } catch (err) {
        console.warn(`[CaseRepo] MongoDB find error: ${err.message}`);
      }
    }
    let list = Array.from(getStore().values());
    if (query.status) {
      list = list.filter(c => c.status === query.status);
    }
    if (query.category) {
      list = list.filter(c => c.category === query.category);
    }
    if (query.verdict) {
      list = list.filter(c => c.verdict?.verdict === query.verdict);
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list.slice(skip, skip + limit);
  },

  async countDocuments(query = {}) {
    if (mongoose.connection.readyState === 1) {
      try {
        return await MongooseCaseModel.countDocuments(query);
      } catch (err) {
        console.warn(`[CaseRepo] MongoDB count error: ${err.message}`);
      }
    }
    let list = Array.from(getStore().values());
    if (query.status) list = list.filter(c => c.status === query.status);
    if (query.category) list = list.filter(c => c.category === query.category);
    if (query.verdict) list = list.filter(c => c.verdict?.verdict === query.verdict);
    return list.length;
  },

  // Seed demo case for quick exploration
  seedDemoCase(demoData) {
    const store = getStore();
    if (!store.has(demoData.caseId)) {
      store.set(demoData.caseId, demoData);
      saveCollection('cases.json', store);
    }
  }
};

export default MongooseCaseModel;
