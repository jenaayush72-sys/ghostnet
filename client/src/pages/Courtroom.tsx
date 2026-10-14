import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Scale, ShieldAlert, Gavel, BookOpen, Clock, Copy, Check,
  RotateCw, Plus, ChevronDown, ChevronUp, AlertCircle, ExternalLink,
  ShieldCheck, Loader2, Sparkles, FileText, CheckCircle2, XCircle
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

  // Expanded state for events
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const timelineEndRef = useRef<HTMLDivElement>(null);

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-xs font-mono-code uppercase tracking-wider">
          Connecting to courtroom chambers for {caseId}...
        </p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-100">Trial Docket Unavailable</h2>
        <p className="text-xs text-rose-300 mt-1 mb-6">{error || 'Requested case does not exist.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C222C] text-gray-200 text-xs font-mono-code border border-[#2B3545]"
        >
          Return to Dashboard
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

  // Determine current stage index for progress bar
  const currentStageIndex = STAGES_ORDER.findIndex(s => s.key === currentStage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* A. CASE HEADER */}
      <div className="rounded-2xl border border-[#232A36] bg-[#10141B] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2532]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono-code text-sm font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
              {caseData.caseId}
            </span>
            <span className="text-xs uppercase font-mono-code px-2.5 py-1 rounded bg-[#171D27] text-gray-300 border border-[#273243]">
              Category: {caseData.category}
            </span>
            <span className="text-xs text-gray-400 font-mono-code flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(caseData.createdAt).toLocaleTimeString()}
            </span>
          </div>

          {/* Status Badge & Action buttons */}
          <div className="flex items-center gap-2">
            {caseData.status === 'in_progress' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-code bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                TRIAL IN PROGRESS
              </span>
            ) : caseData.status === 'completed' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-code bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERDICT RENDERED
              </span>
            ) : caseData.status === 'failed' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-code bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <XCircle className="w-3.5 h-3.5" />
                TRIAL HALTED
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-mono-code bg-gray-800 text-gray-300">
                EMPANELLED
              </span>
            )}

            <button
              onClick={() => setIsEvidenceDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#171D27] hover:bg-[#202734] border border-[#2A3546] text-xs font-mono-code text-gray-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vault ({evidence.length})</span>
            </button>
          </div>
        </div>

        {/* Claim Under Trial */}
        <div>
          <span className="text-[11px] font-mono-code uppercase text-gray-400 block mb-1">
            Indictment / Claim on Trial:
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-100 leading-snug">
            "{caseData.originalClaim}"
          </h1>
          {caseData.context && (
            <p className="text-xs text-gray-400 mt-2 bg-[#090C10] p-3 rounded-lg border border-[#1C222C]">
              <span className="font-semibold text-gray-300 font-mono-code">Factual Context: </span>
              {caseData.context}
            </p>
          )}
        </div>

        {/* D. INVESTIGATION PROGRESS STEPPER */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono-code text-gray-400 mb-1.5">
            <span>Stage Progression</span>
            <span className="text-amber-400 uppercase">
              Current: {caseData.currentStage.replace('_', ' ')}
            </span>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {STAGES_ORDER.map((stage, idx) => {
              const isPast = idx < currentStageIndex || isFinished;
              const isCurrent = idx === currentStageIndex && !isFinished;
              return (
                <div key={stage.key} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isPast
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-[#1F2633]'
                    }`}
                  />
                  <span
                    className={`hidden lg:block text-[9px] font-mono-code truncate ${
                      isCurrent ? 'text-amber-300 font-bold' : isPast ? 'text-gray-400' : 'text-gray-600'
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

      {/* F. FINAL VERDICT BANNER (If completed) */}
      {caseData.verdict && caseData.status === 'completed' && (
        <VerdictBanner
          verdict={caseData.verdict}
          evidenceRecords={evidence}
          onOpenEvidence={openEvidenceInspector}
        />
      )}

      {/* B. THE 6 AGENT CARDS PANEL */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 font-mono-code flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            Autonomous Agent Chamber
          </h2>
          <span className="text-xs text-gray-500 font-mono-code">Six Specialized Roles</span>
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
      <div className="rounded-2xl border border-[#232A36] bg-[#10141B] p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2532]">
          <div>
            <h2 className="text-base font-bold text-gray-100 font-mono-code flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Court Docket Timeline
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Live transcript of formal agent pleadings, objections, and evidentiary citations.
            </p>
          </div>
          <span className="text-xs font-mono-code text-gray-400 bg-[#161B24] px-2.5 py-1 rounded border border-[#273243]">
            {caseData.investigationEvents.length} Filings
          </span>
        </div>

        {caseData.investigationEvents.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-mono-code text-xs">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-amber-400 mb-2" />
            Empanelling trial and awaiting first docket entry...
          </div>
        ) : (
          <div className="space-y-4">
            {caseData.investigationEvents.map((evt) => {
              const isExpanded = expandedEvents[evt.eventId] ?? true;
              const isGhostAdversarial = evt.eventType === 'ADVERSARIAL_ARGUMENT_FILED';
              const isProsecution = evt.eventType === 'OBJECTIONS_ENTERED';
              const isDefense = evt.eventType === 'DEFENSE_ARGUMENTS_FILED';
              const isVerdict = evt.eventType === 'VERDICT_RENDERED';

              return (
                <div
                  key={evt.eventId}
                  className={`rounded-xl border p-4 transition-all ${
                    isGhostAdversarial
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : isProsecution
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : isDefense
                      ? 'border-sky-500/40 bg-sky-950/10'
                      : isVerdict
                      ? 'border-yellow-500/50 bg-yellow-950/15'
                      : 'border-[#232A36] bg-[#12161E]'
                  }`}
                >
                  {/* Event Header */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono-code text-gray-200">
                        {evt.agentName}
                      </span>
                      <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-[#171D27] text-gray-400 border border-[#273243]">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 font-mono-code">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => toggleEventExpand(evt.eventId)}
                        className="text-gray-400 hover:text-gray-200 p-1"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Ghost Adversarial Special Warning Banner */}
                  {isGhostAdversarial && (
                    <div className="my-2 px-3 py-1.5 rounded bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono-code font-bold text-amber-300 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>ADVERSARIAL TEST ARGUMENT — NOT VERIFIED FACT</span>
                    </div>
                  )}

                  {/* Event Content */}
                  <div className="text-xs text-gray-200 leading-relaxed font-sans">
                    {evt.content}
                  </div>

                  {/* Structured data rendering if expanded */}
                  {isExpanded && evt.data && (
                    <div className="mt-3 pt-3 border-t border-[#232A36]/60 text-xs space-y-2">
                      {/* Targeted Statements (Ghost) */}
                      {evt.data.targetedStatements && (
                        <div>
                          <span className="text-[11px] font-mono-code uppercase text-amber-400 block mb-1">
                            Premises Under Interrogation:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-gray-300 text-[11px]">
                            {evt.data.targetedStatements.map((stmt: string, i: number) => (
                              <li key={i}>{stmt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Objections (Prosecutor) */}
                      {evt.data.objections && Array.isArray(evt.data.objections) && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-mono-code uppercase text-rose-400 block">
                            Prosecution Objections ({evt.data.objections.length}):
                          </span>
                          {evt.data.objections.map((obj: any, i: number) => (
                            <div key={i} className="p-2.5 rounded-lg bg-[#0E1218] border border-[#232A36]">
                              <div className="flex items-center justify-between text-[11px] font-mono-code mb-1">
                                <span className="text-rose-400 font-semibold">{obj.statement}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  {obj.severity}
                                </span>
                              </div>
                              <p className="text-gray-300 text-[11px]">{obj.objection}</p>
                              <p className="text-gray-400 text-[10px] mt-1 font-mono-code">
                                Evidentiary Burden: {obj.requiredEvidence}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Counterarguments (Defense) */}
                      {evt.data.counterarguments && Array.isArray(evt.data.counterarguments) && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-mono-code uppercase text-sky-400 block">
                            Defense Counterarguments:
                          </span>
                          {evt.data.counterarguments.map((cnt: any, i: number) => (
                            <div key={i} className="p-2.5 rounded-lg bg-[#0E1218] border border-[#232A36]">
                              <p className="text-sky-300 text-[11px] font-medium">{cnt.defenseArgument}</p>
                              <p className="text-gray-400 text-[10px] mt-1 font-mono-code">
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
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#12161E] border border-[#232A36]">
        <div className="flex items-center gap-2">
          {caseData.verdict && (
            <button
              onClick={() => copyToClipboard(caseData.verdict?.summary || '', 'verdict')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181E29] hover:bg-[#222B3B] border border-[#2C384B] text-xs font-mono-code text-gray-200 transition-colors"
            >
              {copiedText === 'verdict' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              <span>{copiedText === 'verdict' ? 'Copied Verdict' : 'Copy Verdict'}</span>
            </button>
          )}

          <button
            onClick={() => copyToClipboard(`[GhostNet Case ${caseData.caseId}]\nClaim: ${caseData.originalClaim}\nVerdict: ${caseData.verdict?.verdict || 'In Trial'}\nSummary: ${caseData.verdict?.summary || ''}`, 'docket')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181E29] hover:bg-[#222B3B] border border-[#2C384B] text-xs font-mono-code text-gray-200 transition-colors"
          >
            {copiedText === 'docket' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            <span>{copiedText === 'docket' ? 'Copied Summary' : 'Copy Case Docket'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {caseData.status === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs font-mono-code transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>Retry Trial</span>
            </button>
          )}

          <Link
            to="/investigate"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs font-mono-code transition-all shadow-md shadow-amber-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Investigation</span>
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
