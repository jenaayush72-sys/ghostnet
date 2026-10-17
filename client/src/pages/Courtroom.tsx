import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Scale, ShieldAlert, Gavel, BookOpen, Clock, Copy, Check,
  RotateCw, Plus, ChevronDown, ChevronUp, AlertCircle, ExternalLink,
  ShieldCheck, Loader2, Sparkles, FileText, CheckCircle2, XCircle,
  Download, RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { CaseData, EvidenceRecord, InvestigationEvent } from '../types';
import { AgentCard, AgentRole } from '../components/AgentCard';
import { VerdictBanner } from '../components/VerdictBanner';
import { EvidenceDrawer } from '../components/EvidenceDrawer';

const STAGES_ORDER = [
  { key: 'created', label: 'Empanelled' },
  { key: 'ghost_analysis', label: 'Ghost Thesis' },
  { key: 'evidence_retrieval', label: 'Evidence Harvest' },
  { key: 'prosecution', label: 'Prosecution' },
  { key: 'defense', label: 'Defense' },
  { key: 'fact_checking', label: 'Fact-Check' },
  { key: 'judgment', label: 'Judicial Ruling' },
  { key: 'completed', label: 'Concluded' }
];

const getAgentMeta = (agentName: string = '', eventType: string = '') => {
  const name = (agentName || '').toLowerCase();
  const type = (eventType || '').toLowerCase();

  if (name.includes('ghost')) {
    return {
      avatar: '👻',
      modelTag: 'GROQ 120B',
      modelBadgeBg: 'bg-[#56b29e] text-[#1d1b18]',
      cardBorder: 'border-[#56b29e] bg-[#56b29e]/15',
      isDialogue: true,
      speakerRole: 'Ghost Adversary'
    };
  }
  if (name.includes('prosecutor') || name.includes('prosecution') || type.includes('objection')) {
    return {
      avatar: '⚡',
      modelTag: 'SARVAM 105B',
      modelBadgeBg: 'bg-[#f47a22] text-white',
      cardBorder: 'border-[#f47a22] bg-[#f47a22]/15',
      isDialogue: true,
      speakerRole: 'Prosecution'
    };
  }
  if (name.includes('defense') || type.includes('defense')) {
    return {
      avatar: '🛡️',
      modelTag: 'GROQ 120B',
      modelBadgeBg: 'bg-[#7a8fd8] text-white',
      cardBorder: 'border-[#7a8fd8] bg-[#7a8fd8]/15',
      isDialogue: true,
      speakerRole: 'Defense Counsel'
    };
  }
  if (name.includes('fact-checker') || name.includes('fact checker') || name.includes('fact_checker') || type.includes('corroborat')) {
    return {
      avatar: '🔍',
      modelTag: 'SARVAM 105B',
      modelBadgeBg: 'bg-[#ebce38] text-[#1d1b18]',
      cardBorder: 'border-[#ebce38] bg-[#ebce38]/20',
      isDialogue: false,
      speakerRole: 'Fact-Checker'
    };
  }
  if (name.includes('judge') || type.includes('verdict')) {
    return {
      avatar: '⚖️',
      modelTag: 'GEMMA 4 31B',
      modelBadgeBg: 'bg-[#f8c33c] text-[#1d1b18]',
      cardBorder: 'border-[#f8c33c] bg-[#f8c33c]/25',
      isDialogue: true,
      speakerRole: 'Supreme Judge'
    };
  }
  return {
    avatar: '📚',
    modelTag: 'EVIDENCE HARVEST',
    modelBadgeBg: 'bg-[#ebdcc4] text-[#1d1b18]',
    cardBorder: 'border-[#1d1b18] bg-[#f1e4cf]',
    isDialogue: false,
    speakerRole: 'Evidence Vault'
  };
};

export const Courtroom: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isChallenging, setIsChallenging] = useState(false);

  // Expanded state for events
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const timelineEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (caseData?.status === 'in_progress' && timelineEndRef.current) {
      timelineEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [caseData?.investigationEvents?.length, caseData?.status]);

  useEffect(() => {
    if (!caseId) return;
    loadCaseData();

    // Subscribe to SSE real-time stream
    const unsubscribe = api.subscribeToCaseEvents(caseId, {
      onEvent: (event: InvestigationEvent) => {
        setCaseData((prev) => {
          if (!prev) return prev;
          const exists = prev.investigationEvents.some(e => e.eventId === event.eventId);
          if (exists) return prev;
          return {
            ...prev,
            investigationEvents: [...prev.investigationEvents, event],
            currentStage: event.stage
          };
        });

        // If evidence event arrived, refresh evidence list
        if (event.eventType === 'EVIDENCE_RETRIEVED') {
          api.getCaseEvidence(caseId).then(setEvidence).catch(() => {});
        }
      },
      onComplete: () => {
        // Refresh full record upon completion
        loadCaseData();
      },
      onError: (err) => {
        console.warn('SSE stream notice:', err);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [caseId]);

  const loadCaseData = async () => {
    if (!caseId) return;
    try {
      const data = await api.getInvestigation(caseId);
      setCaseData(data);
      setError(null);

      // Load associated evidence
      const evd = await api.getCaseEvidence(caseId);
      setEvidence(evd);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Case not found');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!caseId || isRetrying) return;
    setIsRetrying(true);
    try {
      await api.retryInvestigation(caseId);
      loadCaseData();
    } catch (err: any) {
      alert(`Retry failed: ${err.message}`);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleChallengeAppeal = async (challengeData: { counterEvidence: string; counterUrl?: string; reason?: string }) => {
    if (!caseId) return;
    setIsChallenging(true);
    try {
      await api.challengeInvestigation(caseId, challengeData);
      await loadCaseData();
    } finally {
      setIsChallenging(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const toggleEventExpand = (eventId: string) => {
    setExpandedEvents((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const openEvidenceInspector = (evdId: string) => {
    setSelectedEvidenceId(evdId);
    setIsEvidenceDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-[#1d1b18]">
        <Loader2 className="w-10 h-10 animate-spin text-[#f47a22]" />
        <p className="font-brand font-black text-xl uppercase tracking-wider">
          Connecting to courtroom chambers for {caseId}...
        </p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] text-center">
        <AlertCircle className="w-12 h-12 text-[#e5452f] mx-auto mb-3" />
        <h2 className="font-brand font-black text-3xl uppercase text-[#1d1b18]">Trial Docket Unavailable</h2>
        <p className="text-sm font-semibold text-[#6e665b] mt-1 mb-6">{error || 'Requested case does not exist.'}</p>
        <Link
          to="/dashboard"
          className="btn sm font-brand font-black"
        >
          RETURN TO DASHBOARD
        </Link>
      </div>
    );
  }

  // Derive agent active & completed states
  const currentStage = caseData.currentStage;
  const isFinished = caseData.status === 'completed';
  const isFailed = caseData.status === 'failed';

  const isAgentActive = (role: AgentRole) => {
    if (isFinished || isFailed) return false;
    switch (role) {
      case 'ghost':
        return currentStage === 'ghost_analysis';
      case 'evidence':
        return currentStage === 'evidence_retrieval' || currentStage === 'ghost_analysis';
      case 'prosecutor':
        return currentStage === 'prosecution';
      case 'defense':
        return currentStage === 'defense';
      case 'factChecker':
        return currentStage === 'fact_checking';
      case 'judge':
        return currentStage === 'judgment';
      default:
        return false;
    }
  };

  const isAgentCompleted = (role: AgentRole) => {
    if (isFinished) return true;
    switch (role) {
      case 'ghost':
        return Boolean(caseData.agentResults?.ghost);
      case 'evidence':
        return Boolean(caseData.agentResults?.evidence);
      case 'prosecutor':
        return Boolean(caseData.agentResults?.prosecutor);
      case 'defense':
        return Boolean(caseData.agentResults?.defense);
      case 'factChecker':
        return Boolean(caseData.agentResults?.factChecker);
      case 'judge':
        return Boolean(caseData.agentResults?.judge);
      default:
        return false;
    }
  };

  const currentStageIndex = STAGES_ORDER.findIndex(s => s.key === currentStage);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* A. CASE HEADER BENTO */}
      <div className="rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] p-6 sm:p-8 space-y-5 relative dots">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#1d1b18]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag-sticker yellow text-[10px]">SCREEN 2: COURTROOM</span>
            <span className="font-brand font-black text-base text-[#1d1b18] bg-[#f8c33c] px-3 py-1 rounded-full border-2 border-[#1d1b18] uppercase">
              {caseData.caseId}
            </span>
            <span className="text-xs uppercase font-brand font-black px-3 py-1 rounded-full bg-[#f1e4cf] text-[#1d1b18] border border-[#1d1b18]">
              CATEGORY: {caseData.category}
            </span>
            <span className="text-xs font-bold text-[#6e665b] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(caseData.createdAt).toLocaleTimeString()}
            </span>
          </div>

          {/* Status Badge & Action buttons */}
          <div className="flex items-center gap-2.5">
            {caseData.status === 'in_progress' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-brand font-black bg-[#f8c33c] text-[#1d1b18] border-2 border-[#1d1b18] animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                TRIAL IN PROGRESS
              </span>
            ) : caseData.status === 'completed' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-brand font-black bg-[#56b29e] text-[#1d1b18] border-2 border-[#1d1b18]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERDICT RENDERED
              </span>
            ) : caseData.status === 'failed' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-brand font-black bg-[#e5452f] text-white border-2 border-[#1d1b18]">
                <XCircle className="w-3.5 h-3.5" />
                TRIAL HALTED
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-brand font-black bg-[#f1e4cf] text-[#1d1b18] border border-[#1d1b18]">
                EMPANELLED
              </span>
            )}

            {caseData.status === 'completed' && (
              <a
                href="#verdict-room"
                className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#f8c33c] hover:bg-[#ebd03b] border-2 border-[#1d1b18] text-xs font-brand font-black text-[#1d1b18] transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#1d1b18]"
              >
                <Gavel className="w-3.5 h-3.5 text-[#1d1b18]" />
                <span>VERDICT ROOM</span>
              </a>
            )}

            <button
              onClick={() => setIsEvidenceDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#56b29e] hover:bg-[#4ea591] border-2 border-[#1d1b18] text-xs font-brand font-black text-[#1d1b18] transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#1d1b18]"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#1d1b18]" />
              <span>VAULT ({evidence.length})</span>
            </button>
          </div>
        </div>

        {/* Claim Under Trial */}
        <div>
          <span className="tag-sticker yellow mb-2">INDICTMENT / CLAIM ON TRIAL</span>
          <h1 className="font-brand font-black text-2xl sm:text-4xl text-[#1d1b18] leading-tight uppercase mt-2">
            "{caseData.originalClaim}"
          </h1>
          {caseData.context && (
            <p className="text-xs font-medium text-[#3a352e] mt-3 bg-[#f1e4cf] p-3 rounded-[14px] border-2 border-[#1d1b18]">
              <b className="uppercase text-[#1d1b18]">Factual Context: </b>
              {caseData.context}
            </p>
          )}
        </div>

        {/* D. STAGE STEPPER */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-brand font-black uppercase text-[#6e665b] mb-1.5">
            <span>Stage Progression</span>
            <span className="text-[#1d1b18] bg-[#f8c33c] px-2 py-0.5 rounded border border-[#1d1b18]">
              CURRENT: {caseData.currentStage.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {STAGES_ORDER.map((stage, idx) => {
              const isPast = idx < currentStageIndex || isFinished;
              const isCurrent = idx === currentStageIndex && !isFinished;
              return (
                <div key={stage.key} className="space-y-1">
                  <div
                    className={`h-2.5 rounded-full border border-[#1d1b18] transition-all duration-300 ${
                      isPast
                        ? 'bg-[#56b29e]'
                        : isCurrent
                        ? 'bg-[#f8c33c] animate-pulse'
                        : 'bg-[#ebdcc4]'
                    }`}
                  />
                  <span
                    className={`hidden lg:block text-[9px] font-brand font-bold uppercase truncate ${
                      isCurrent ? 'text-[#1d1b18]' : isPast ? 'text-[#3a352e]' : 'text-[#6e665b]'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LIVE MULTI-MODEL DELIBERATION BANNER */}
      {caseData.status === 'in_progress' && (
        <div className="p-4 sm:p-5 rounded-[20px] bg-[#1d1b18] text-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#f47a22] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-4 h-4 rounded-full bg-[#e5452f] animate-ping absolute" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#e5452f] border border-[#1d1b18]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-brand font-black text-sm uppercase tracking-wider text-[#f8c33c]">
                  LIVE COURTROOM DELIBERATION
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#3a352e] text-[#f8eedc] text-[10px] font-mono-code uppercase">
                  3 AI MODELS IN ADVERSARIAL DIALECTIC
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
                Current Hearing: <span className="text-[#f8c33c] uppercase underline">{caseData.currentStage.replace(/_/g, ' ')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
            <span className="text-[11px] font-brand font-black text-[#ebdcc4] uppercase">MODELS COMPETING:</span>
            <span className="px-2.5 py-1 rounded-full bg-[#56b29e] text-[#1d1b18] text-xs font-black uppercase border border-[#1d1b18]">Groq</span>
            <span className="text-xs font-black text-[#ebdcc4]">vs</span>
            <span className="px-2.5 py-1 rounded-full bg-[#f47a22] text-white text-xs font-black uppercase border border-[#1d1b18]">Sarvam</span>
            <span className="text-xs font-black text-[#ebdcc4]">➔</span>
            <span className="px-2.5 py-1 rounded-full bg-[#f8c33c] text-[#1d1b18] text-xs font-black uppercase border border-[#1d1b18]">Gemma 4</span>
          </div>
        </div>
      )}

      {/* F. FINAL VERDICT BANNER (If completed) */}
      {caseData.verdict && caseData.status === 'completed' && (
        <VerdictBanner
          verdict={caseData.verdict}
          caseData={caseData}
          evidenceRecords={evidence}
          onOpenEvidence={openEvidenceInspector}
          onChallenge={handleChallengeAppeal}
          isChallenging={isChallenging}
        />
      )}

      {/* B. THE 6 AGENT CARDS PANEL */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="tag-sticker teal">AUTONOMOUS AGENT CHAMBER</div>
          <span className="font-brand font-black text-xs uppercase text-[#6e665b]">
            Six Specialized Perspectives
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <AgentCard
            role="ghost"
            isActive={isAgentActive('ghost')}
            isCompleted={isAgentCompleted('ghost')}
            currentActivity="Synthesizing adversarial premise trap..."
            itemCount={caseData.agentResults?.ghost?.targetedStatements?.length}
          />
          <AgentCard
            role="evidence"
            isActive={isAgentActive('evidence')}
            isCompleted={isAgentCompleted('evidence')}
            currentActivity="Harvesting primary documentation..."
            itemCount={evidence.length}
          />
          <AgentCard
            role="prosecutor"
            isActive={isAgentActive('prosecutor')}
            isCompleted={isAgentCompleted('prosecutor')}
            currentActivity="Cross-examining assumptions..."
            itemCount={caseData.agentResults?.prosecutor?.objections?.length}
          />
          <AgentCard
            role="defense"
            isActive={isAgentActive('defense')}
            isCompleted={isAgentCompleted('defense')}
            currentActivity="Formulating boundary qualifications..."
            itemCount={caseData.agentResults?.defense?.counterarguments?.length}
          />
          <AgentCard
            role="factChecker"
            isActive={isAgentActive('factChecker')}
            isCompleted={isAgentCompleted('factChecker')}
            currentActivity="Corroborating citations against text..."
            itemCount={caseData.agentResults?.factChecker?.claimAssessments?.length}
          />
          <AgentCard
            role="judge"
            isActive={isAgentActive('judge')}
            isCompleted={isAgentCompleted('judge')}
            currentActivity="Adjudicating binding verdict..."
            itemCount={caseData.agentResults?.judge?.citedEvidenceIds?.length}
          />
        </div>
      </div>

      {/* C. DEBATE TIMELINE & DOCKET ENTRIES */}
      <div className="rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#1d1b18]">
          <div>
            <h2 className="font-brand font-black text-2xl uppercase tracking-tight text-[#1d1b18] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#f47a22]" />
              Courtroom Deliberation Chamber & Docket
            </h2>
            <p className="text-xs font-semibold text-[#6e665b] mt-0.5">
              Live multi-model cross-examination transcript between Groq (Ghost & Defense), Sarvam AI (Prosecution & Fact-Check), and Gemma 4 (Supreme Judge).
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#f8c33c] border-2 border-[#1d1b18] font-brand font-black text-xs text-[#1d1b18] uppercase self-start sm:self-auto shadow-[1.5px_1.5px_0px_#1d1b18]">
            {caseData.investigationEvents.length} COURT DOCKET ENTRIES
          </span>
        </div>

        {caseData.investigationEvents.length === 0 ? (
          <div className="py-12 text-center text-[#6e665b] font-brand font-black text-sm uppercase">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#f47a22] mb-2" />
            Empanelling trial and awaiting first docket entry...
          </div>
        ) : (
          <div className="space-y-4">
            {caseData.investigationEvents.map((evt) => {
              const isExpanded = expandedEvents[evt.eventId] ?? true;
              const meta = getAgentMeta(evt.agentName, evt.eventType);
              const isGhostAdversarial = evt.eventType === 'ADVERSARIAL_ARGUMENT_FILED';
              const isSpoken = meta.isDialogue || evt.content.startsWith('[');

              return (
                <div
                  key={evt.eventId}
                  className={`rounded-[18px] border-[2.5px] border-[#1d1b18] p-4 sm:p-5 transition-all shadow-[2.5px_2.5px_0px_#1d1b18] ${meta.cardBorder}`}
                >
                  {/* Event Header */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="w-8 h-8 rounded-full bg-[#1d1b18] text-white flex items-center justify-center text-sm border border-[#1d1b18] shrink-0">
                        <span>{meta.avatar}</span>
                      </div>
                      <span className="font-brand font-black text-base text-[#1d1b18] uppercase">
                        {evt.agentName}
                      </span>
                      <span className={`text-[10px] font-brand font-black uppercase px-2 py-0.5 rounded-full border border-[#1d1b18] shadow-[1px_1px_0px_#1d1b18] ${meta.modelBadgeBg}`}>
                        {meta.modelTag}
                      </span>
                      <span className="text-[10px] font-brand font-black uppercase px-2 py-0.5 rounded-full bg-[#1d1b18] text-[#f8eedc]">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono-code font-bold text-[#6e665b]">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => toggleEventExpand(evt.eventId)}
                        className="w-7 h-7 rounded-full bg-[#f8eedc] border-2 border-[#1d1b18] flex items-center justify-center hover:bg-[#ebdcc4] transition-colors shadow-[1px_1px_0px_#1d1b18]"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#1d1b18]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#1d1b18]" />}
                      </button>
                    </div>
                  </div>

                  {/* Ghost Adversarial Special Warning Banner */}
                  {isGhostAdversarial && (
                    <div className="my-2.5 px-3 py-1.5 rounded-[10px] bg-[#f47a22] text-[#fff] border-2 border-[#1d1b18] text-[10px] font-brand font-black uppercase tracking-wider flex items-center gap-2 shadow-[1px_1px_0px_#1d1b18]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>ADVERSARIAL STRESS TEST — DELIBERATE COUNTER-PREMISE FOR COURTROOM SCRUTINY</span>
                    </div>
                  )}

                  {/* Event Content (Spoken Oral Dialogue vs Standard Notice) */}
                  {isSpoken ? (
                    <div className="p-3.5 sm:p-4 rounded-[14px] bg-white/90 border-2 border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18]">
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#1d1b18]/15">
                        <span className="text-[10px] font-brand font-black uppercase tracking-wider text-[#6e665b] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#f47a22] inline-block" />
                          Courtroom Cross-Examination Speech
                        </span>
                        <span className="text-[10px] font-mono-code font-bold text-[#6e665b]">
                          {meta.speakerRole}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#1d1b18] leading-relaxed">
                        {evt.content}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-[#1d1b18] font-medium leading-relaxed bg-[#f8eedc]/60 p-3 rounded-[12px] border border-[#1d1b18]/30">
                      {evt.content}
                    </div>
                  )}

                  {/* Structured data rendering if expanded */}
                  {isExpanded && evt.data && (
                    <div className="mt-3 pt-3 border-t border-[#1d1b18]/20 text-xs space-y-2">
                      {/* Targeted Statements (Ghost) */}
                      {evt.data.targetedStatements && (
                        <div>
                          <span className="font-brand font-black text-[11px] uppercase text-[#1d1b18] block mb-1">
                            Premises Under Interrogation:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-[#3a352e] text-xs font-semibold">
                            {evt.data.targetedStatements.map((stmt: string, i: number) => (
                              <li key={i}>{stmt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Objections (Prosecutor) */}
                      {evt.data.objections && Array.isArray(evt.data.objections) && (
                        <div className="space-y-2">
                          <span className="font-brand font-black text-[11px] uppercase text-[#e5452f] block">
                            Prosecution Objections ({evt.data.objections.length}):
                          </span>
                          {evt.data.objections.map((obj: any, i: number) => (
                            <div key={i} className="p-3 rounded-[12px] bg-[#f8eedc] border border-[#1d1b18]">
                              <div className="flex items-center justify-between text-xs font-brand font-black mb-1">
                                <span className="text-[#e5452f]">{obj.statement}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#e5452f] text-white border border-[#1d1b18]">
                                  {obj.severity}
                                </span>
                              </div>
                              <p className="text-[#1d1b18] text-xs font-medium">{obj.objection}</p>
                              <p className="text-[#6e665b] text-[11px] mt-1 font-mono-code font-bold">
                                Evidentiary Burden: {obj.requiredEvidence}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Counterarguments (Defense) */}
                      {evt.data.counterarguments && Array.isArray(evt.data.counterarguments) && (
                        <div className="space-y-2">
                          <span className="font-brand font-black text-[11px] uppercase text-[#7a8fd8] block">
                            Defense Counterarguments:
                          </span>
                          {evt.data.counterarguments.map((cnt: any, i: number) => (
                            <div key={i} className="p-3 rounded-[12px] bg-[#f8eedc] border border-[#1d1b18]">
                              <p className="text-[#1d1b18] text-xs font-bold">{cnt.defenseArgument}</p>
                              <p className="text-[#6e665b] text-[11px] mt-1 font-mono-code font-bold">
                                Conditions Where True: {cnt.conditionsWhereTrue}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={timelineEndRef} />
          </div>
        )}
      </div>

      {/* G. CASE ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18]">
        <div className="flex items-center gap-2 flex-wrap">
          {caseData.verdict && (
            <button
              onClick={() => copyToClipboard(caseData.verdict?.summary || '', 'verdict')}
              className="btn sm ghost font-brand font-black border-2 border-[#1d1b18]"
            >
              {copiedText === 'verdict' ? <Check className="w-3.5 h-3.5 text-[#56b29e]" /> : <Copy className="w-3.5 h-3.5 text-[#1d1b18]" />}
              <span>{copiedText === 'verdict' ? 'COPIED VERDICT' : 'COPY VERDICT'}</span>
            </button>
          )}

          <button
            onClick={() => copyToClipboard(`[GhostNet Case ${caseData.caseId}]\nClaim: ${caseData.originalClaim}\nVerdict: ${caseData.verdict?.verdict || 'In Trial'}\nSummary: ${caseData.verdict?.summary || ''}`, 'docket')}
            className="btn sm ghost font-brand font-black border-2 border-[#1d1b18]"
          >
            {copiedText === 'docket' ? <Check className="w-3.5 h-3.5 text-[#56b29e]" /> : <Copy className="w-3.5 h-3.5 text-[#1d1b18]" />}
            <span>{copiedText === 'docket' ? 'COPIED DOCKET' : 'COPY DOCKET'}</span>
          </button>

          {caseData.status === 'completed' && (
            <>
              <button
                onClick={() => api.downloadReport(caseData.caseId, 'markdown')}
                className="btn sm font-brand font-black flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>REPORT (.MD)</span>
              </button>
              <button
                onClick={() => api.downloadReport(caseData.caseId, 'json')}
                className="btn sm ghost font-brand font-black border-2 border-[#1d1b18] flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#1d1b18]" />
                <span>DATA (.JSON)</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {caseData.status === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="btn sm orange font-brand font-black"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>RETRY TRIAL</span>
            </button>
          )}

          <Link
            to="/investigate"
            className="btn sm arrow font-brand font-black"
          >
            <Plus className="w-3.5 h-3.5 text-[#1d1b18]" />
            <span>NEW INVESTIGATION</span>
          </Link>
        </div>
      </div>

      {/* E. EVIDENCE VAULT DRAWER */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        evidence={evidence}
        selectedEvidenceId={selectedEvidenceId}
      />
    </div>
  );
};
