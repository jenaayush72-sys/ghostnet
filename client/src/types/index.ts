export type Category = 'general' | 'programming' | 'news' | 'decision';
export type CaseStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'partial';
export type VerdictType =
  | 'Supported'
  | 'Refuted'
  | 'Mixed'
  | 'Insufficient Evidence'
  | 'TRUE'
  | 'FALSE'
  | 'PARTIALLY TRUE'
  | 'MISLEADING'
  | 'INSUFFICIENT EVIDENCE';
export type EvidenceDirection = 'supports' | 'contradicts' | 'context';
export type SourceType = 'official_doc' | 'primary_source' | 'reputable_publication' | 'code_spec' | 'general_web';
export type RetrievalStatus = 'verified' | 'unavailable' | 'snippet_only';

export interface EvidenceRecord {
  evidenceId: string;
  caseId: string;
  claimId: string;
  sourceTitle: string;
  sourceURL: string;
  sourceDomain: string;
  excerpt: string;
  publishedAt?: string | null;
  retrievedAt: string;
  evidenceDirection: EvidenceDirection;
  sourceType: SourceType;
  retrievalStatus: RetrievalStatus;
}

export interface InvestigationEvent {
  eventId: string;
  stage: string;
  agentName: string;
  eventType: string;
  content: string;
  data?: any;
  timestamp: string;
}

export interface Objection {
  statement: string;
  objection: string;
  reasoning: string;
  requiredEvidence: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Counterargument {
  objectionTarget: string;
  defenseArgument: string;
  conditionsWhereTrue: string;
}

export interface ClaimAssessment {
  claim: string;
  supported: boolean;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  assessment: string;
}

export interface VerdictData {
  verdict: VerdictType;
  summary: string;
  reasoning: string;
  supportingFindings: string[];
  contradictingFindings: string[];
  citedEvidenceIds: string[];
  unresolvedQuestions: string[];
  confidenceAssessment: string;
  confidenceLimitations: string;
}

export interface CaseData {
  caseId: string;
  title: string;
  originalClaim: string;
  category: Category;
  context?: string;
  sourceUrl?: string;
  status: CaseStatus;
  currentStage: string;
  agentResults: {
    ghost?: any;
    prosecutor?: any;
    defense?: any;
    evidence?: any;
    factChecker?: any;
    judge?: any;
  };
  investigationEvents: InvestigationEvent[];
  evidenceReferences: string[];
  verdict?: VerdictData | null;
  errorDetails?: {
    message: string;
    stage: string;
    timestamp: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface SystemStatus {
  app: {
    name: string;
    version: string;
    nodeEnv: string;
    environment: string;
  };
  database: {
    status: string;
    host: string;
  };
  ai: {
    provider: string;
    model: string;
    baseUrl: string;
    isConfigured: boolean;
    note: string;
  };
  search: {
    provider: string;
    isConfigured: boolean;
    note: string;
  };
  limits: {
    maxAgentCalls: number;
    agentTimeoutMs: number;
    maxSearchResults: number;
  };
}
