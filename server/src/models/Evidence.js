import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  evidenceId: { type: String, required: true, unique: true, index: true },
  caseId: { type: String, required: true, index: true },
  claimId: { type: String, required: true },
  sourceTitle: { type: String, required: true },
  sourceURL: { type: String, required: true },
  sourceDomain: { type: String, default: '' },
  excerpt: { type: String, required: true },
  publishedAt: { type: String, default: null },
  retrievedAt: { type: Date, default: Date.now },
  evidenceDirection: {
    type: String,
    enum: ['supports', 'contradicts', 'context'],
    required: true
  },
  sourceType: {
    type: String,
    enum: ['official_doc', 'primary_source', 'reputable_publication', 'code_spec', 'general_web'],
    default: 'general_web'
  },
  retrievalStatus: {
    type: String,
    enum: ['verified', 'unavailable', 'snippet_only'],
    default: 'verified'
  }
}, {
  timestamps: true
});

const MongooseEvidenceModel = mongoose.model('Evidence', evidenceSchema);

const memoryEvidence = new Map();

export const EvidenceRepository = {
  async create(data) {
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await MongooseEvidenceModel.create(data);
        memoryEvidence.set(data.evidenceId, doc.toObject());
        return doc.toObject();
      } catch (err) {
        console.warn(`[EvidenceRepo] MongoDB save error, falling back to memory: ${err.message}`);
      }
    }
    const doc = {
      ...data,
      retrievedAt: data.retrievedAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryEvidence.set(data.evidenceId, doc);
    return doc;
  },

  async insertMany(items) {
    const created = [];
    for (const item of items) {
      const res = await this.create(item);
      created.push(res);
    }
    return created;
  },

  async findByCaseId(caseId) {
    if (mongoose.connection.readyState === 1) {
      try {
        const results = await MongooseEvidenceModel.find({ caseId }).lean();
        if (results.length > 0) return results;
      } catch (err) {
        console.warn(`[EvidenceRepo] MongoDB find error: ${err.message}`);
      }
    }
    return Array.from(memoryEvidence.values()).filter(e => e.caseId === caseId);
  },

  async find(query = {}, options = {}) {
    const { limit = 50, skip = 0 } = options;
    if (mongoose.connection.readyState === 1) {
      try {
        const results = await MongooseEvidenceModel.find(query)
          .sort({ retrievedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();
        return results;
      } catch (err) {
        console.warn(`[EvidenceRepo] MongoDB find error: ${err.message}`);
      }
    }
    let list = Array.from(memoryEvidence.values());
    if (query.caseId) list = list.filter(e => e.caseId === query.caseId);
    if (query.evidenceDirection) list = list.filter(e => e.evidenceDirection === query.evidenceDirection);
    if (query.retrievalStatus) list = list.filter(e => e.retrievalStatus === query.retrievalStatus);
    list.sort((a, b) => new Date(b.retrievedAt) - new Date(a.retrievedAt));
    return list.slice(skip, skip + limit);
  },

  async countDocuments(query = {}) {
    if (mongoose.connection.readyState === 1) {
      try {
        return await MongooseEvidenceModel.countDocuments(query);
      } catch (err) {
        console.warn(`[EvidenceRepo] MongoDB count error: ${err.message}`);
      }
    }
    let list = Array.from(memoryEvidence.values());
    if (query.caseId) list = list.filter(e => e.caseId === query.caseId);
    if (query.evidenceDirection) list = list.filter(e => e.evidenceDirection === query.evidenceDirection);
    return list.length;
  }
};

export default MongooseEvidenceModel;
