import React, { useState } from 'react';
import {
  Gavel, CheckCircle, XCircle, AlertTriangle, HelpCircle, FileText,
  ExternalLink, ArrowRight, ShieldCheck, RotateCcw, Download, Sparkles,
  ChevronDown, ChevronUp, AlertCircle, Link2, Send, Check, Scale
} from 'lucide-react';
import { VerdictData, VerdictType, EvidenceRecord, CaseData } from '../types';
import { api } from '../services/api';

interface VerdictBannerProps {
  verdict: VerdictData;
  caseData?: CaseData;
  evidenceRecords?: EvidenceRecord[];
  onOpenEvidence?: (evidenceId: string) => void;
  onChallenge?: (data: { counterEvidence: string; counterUrl?: string; reason?: string }) => Promise<void>;
  isChallenging?: boolean;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({
  verdict,
  caseData,
  evidenceRecords = [],
  onOpenEvidence,
  onChallenge,
  isChallenging = false
}) => {
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [counterEvidence, setCounterEvidence] = useState('');
  const [counterUrl, setCounterUrl] = useState('');
  const [reason, setReason] = useState('');
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [submittingChallenge, setSubmittingChallenge] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  // Normalize verdict label
  const normalizeVerdict = (v: VerdictType): { label: string; bg: string; text: string; icon: React.ElementType } => {
    const upper = String(v || '').toUpperCase();
    if (upper === 'SUPPORTED' || upper === 'TRUE') {
      return {
        label: 'SUPPORTED',
        bg: 'bg-[#56b29e]',
        text: 'text-[#1d1b18]',
        icon: CheckCircle
      };
    }
    if (upper === 'REFUTED' || upper === 'FALSE') {
      return {
        label: 'REFUTED',
        bg: 'bg-[#e5452f]',
        text: 'text-white',
        icon: XCircle
      };
    }
    if (upper === 'MIXED' || upper.includes('PARTIAL') || upper.includes('MISLEADING')) {
      return {
        label: 'MIXED',
        bg: 'bg-[#f8c33c]',
        text: 'text-[#1d1b18]',
        icon: AlertTriangle
      };
    }
    return {
      label: 'INSUFFICIENT EVIDENCE',
      bg: 'bg-[#7a8fd8]',
      text: 'text-[#1d1b18]',
      icon: HelpCircle
    };
  };

  const theme = normalizeVerdict(verdict.verdict);
  const VerdictIcon = theme.icon;

  const handleChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterEvidence.trim() || counterEvidence.trim().length < 5) {
      setChallengeError('Counter-evidence must be at least 5 characters long.');
      return;
    }

    setSubmittingChallenge(true);
    setChallengeError(null);
    try {
      if (onChallenge) {
        await onChallenge({
          counterEvidence: counterEvidence.trim(),
          counterUrl: counterUrl.trim() || undefined,
          reason: reason.trim() || undefined
        });
      } else if (caseData?.caseId) {
        await api.challengeInvestigation(caseData.caseId, {
          counterEvidence: counterEvidence.trim(),
          counterUrl: counterUrl.trim() || undefined,
          reason: reason.trim() || undefined
        });
        window.location.reload();
      }
      setCounterEvidence('');
      setCounterUrl('');
      setReason('');
      setShowChallengeForm(false);
    } catch (err: any) {
      setChallengeError(err.response?.data?.error || err.message || 'Failed to lodge challenge appeal.');
    } finally {
      setSubmittingChallenge(false);
    }
  };

  const handleExport = async (format: 'json' | 'markdown') => {
    if (!caseData?.caseId) return;
    setExportingFormat(format);
    try {
      await api.downloadReport(caseData.caseId, format);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExportingFormat(null);
    }
  };

  // Find conflicting assessments from factChecker if available
  const factCheckerAssessments = caseData?.agentResults?.factChecker?.claimAssessments || [];
  const conflictingAssessments = factCheckerAssessments.filter((a: any) => !a.supported);
  const hasContradictions = (verdict.contradictingFindings && verdict.contradictingFindings.length > 0) || conflictingAssessments.length > 0;

  return (
    <section id="verdict-room" className="rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] overflow-hidden relative">
      {/* Top Banner - Screen 4: Verdict Room */}
      <div className={`p-6 sm:p-8 ${theme.bg} border-b-[2.5px] border-[#1d1b18] flex flex-col md:flex-row md:items-center justify-between gap-5 relative dots`}>
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#1d1b18] text-[#f8eedc] flex items-center justify-center border-2 border-[#1d1b18] shrink-0 shadow-[2px_2px_0px_#1d1b18]">
            <Gavel className="w-7 h-7 text-[#f8c33c]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="tag-sticker yellow text-[10px]">
                SCREEN 4: VERDICT ROOM
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1d1b18] text-[#f8eedc] font-brand font-black text-xs uppercase tracking-wider">
                GEMMA 4 JUDICIAL RULING
              </span>
            </div>
            <h2 className="font-brand font-black text-3xl sm:text-5xl text-[#1d1b18] uppercase tracking-tight leading-none">
              VERDICT: {theme.label}
            </h2>
          </div>
        </div>

        {/* Big Verdict Pill Badge & Quick Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d1b18] text-[#f8eedc] font-brand font-black text-xl tracking-wider uppercase border-2 border-[#1d1b18] shadow-[2px_2px_0px_#f8eedc]">
            <VerdictIcon className="w-6 h-6 text-[#f8c33c]" />
            {theme.label}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* A. EXECUTIVE SUMMARY */}
        <div className="p-5 rounded-[18px] bg-[#f1e4cf] border-2 border-[#1d1b18]">
          <span className="tag-sticker yellow mb-2">EXECUTIVE SUMMARY</span>
          <p className="text-base sm:text-xl text-[#1d1b18] font-bold leading-relaxed mt-2">
            {verdict.summary}
          </p>
        </div>

        {/* DEFINITIVE JUDICIAL TAKEAWAY */}
        {verdict.takeaway && (
          <div className="p-5 rounded-[18px] bg-[#1d1b18] text-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#f8c33c] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f8c33c] text-[#1d1b18] flex items-center justify-center shrink-0 border border-[#1d1b18]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-[#f8c33c] text-[#1d1b18] font-brand font-black text-[10px] uppercase tracking-wider">
                  GEMMA 4 SUPREME RULING TAKEAWAY
                </span>
                <span className="text-[10px] font-mono-code text-[#ebdcc4] uppercase">
                  Adjudicated in Dialectic
                </span>
              </div>
              <p className="text-base sm:text-lg font-brand font-bold text-white leading-snug">
                "{verdict.takeaway}"
              </p>
            </div>
          </div>
        )}

        {/* COURT TRUTH BREAKDOWN MATRIX */}
        {verdict.truthBreakdown && verdict.truthBreakdown.length > 0 && (
          <div className="p-5 sm:p-6 rounded-[20px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#1d1b18]">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#f47a22]" />
                <h4 className="font-brand font-black text-lg uppercase text-[#1d1b18]">
                  Court Truth Breakdown Matrix
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1d1b18] text-[#f8eedc] font-brand font-black text-xs uppercase tracking-wider self-start sm:self-auto">
                {verdict.truthBreakdown.length} SUB-PREMISES ADJUDICATED
              </span>
            </div>

            <p className="text-xs font-semibold text-[#6e665b]">
              Cross-model synthesis of distinct logical, technical, and mathematical propositions tested during courtroom cross-examination.
            </p>

            <div className="overflow-x-auto rounded-[14px] border-2 border-[#1d1b18]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1d1b18] text-[#f8eedc] text-[11px] font-brand font-black uppercase tracking-wider">
                    <th className="py-2.5 px-3.5 border-r border-[#3a352e] w-12 text-center">#</th>
                    <th className="py-2.5 px-4 border-r border-[#3a352e] min-w-[180px]">Proposition / Sub-Premise</th>
                    <th className="py-2.5 px-3.5 border-r border-[#3a352e] w-36 text-center">Evaluation</th>
                    <th className="py-2.5 px-4 min-w-[260px]">Normative & Technical Grounding</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#1d1b18] bg-[#f8eedc] text-xs font-medium text-[#1d1b18]">
                  {verdict.truthBreakdown.map((row, idx) => {
                    const premiseText = row.premise || row.subPremise || `Sub-Premise ${idx + 1}`;
                    const statusText = row.status || row.verdict || 'EVALUATED';
                    const st = String(statusText).toUpperCase();
                    const isTrue = st === 'TRUE' || st === 'SUPPORTED';
                    const isFalse = st === 'FALSE' || st === 'REFUTED';

                    const statusBg = isTrue
                      ? 'bg-[#56b29e] text-[#1d1b18]'
                      : isFalse
                      ? 'bg-[#e5452f] text-white'
                      : 'bg-[#f8c33c] text-[#1d1b18]';

                    const StatusIcon = isTrue ? CheckCircle : isFalse ? XCircle : AlertTriangle;

                    return (
                      <tr key={idx} className="hover:bg-[#f1e4cf]/80 transition-colors">
                        <td className="py-3 px-3.5 border-r-2 border-[#1d1b18] font-brand font-black text-center text-[#6e665b]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 border-r-2 border-[#1d1b18] font-bold text-sm text-[#1d1b18]">
                          {premiseText}
                        </td>
                        <td className="py-3 px-3.5 border-r-2 border-[#1d1b18] text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-brand font-black uppercase tracking-wider border border-[#1d1b18] shadow-[1px_1px_0px_#1d1b18] ${statusBg}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusText}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#3a352e] font-medium leading-relaxed">
                          {row.explanation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* B. EVIDENTIARY CONNECTION FLOW: Claims → Evidence → Agent Arguments → Verdict */}
        <div className="p-5 sm:p-6 rounded-[20px] bg-[#f8eedc] border-2 border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#1d1b18]/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f47a22]" />
              <h4 className="font-brand font-black text-base uppercase text-[#1d1b18]">
                Evidentiary Connection Flow (Claims ➔ Evidence ➔ Agent Arguments ➔ Verdict)
              </h4>
            </div>
            <span className="text-[11px] font-brand font-black uppercase text-[#6e665b]">
              Determinism Trace
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
            {/* Step 1: Claim */}
            <div className="p-3.5 rounded-[14px] bg-[#f1e4cf] border-2 border-[#1d1b18] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-brand font-black text-[#6e665b] uppercase block">
                  1. Indicted Claim
                </span>
                <p className="text-xs font-bold text-[#1d1b18] mt-1 line-clamp-3">
                  "{caseData?.originalClaim || 'Indicted statement under trial'}"
                </p>
              </div>
              <span className="mt-2 text-[10px] font-bold text-[#6e665b] uppercase">Submitted at Intake Desk</span>
            </div>

            {/* Step 2: Evidence */}
            <div className="p-3.5 rounded-[14px] bg-[#56b29e]/20 border-2 border-[#1d1b18] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-brand font-black text-[#56b29e] uppercase block">
                  2. Evidence Harvest
                </span>
                <p className="text-xs font-bold text-[#1d1b18] mt-1">
                  {evidenceRecords.length} primary source citations indexed ({verdict.citedEvidenceIds?.length || 0} cited in ruling).
                </p>
              </div>
              <span className="mt-2 text-[10px] font-bold text-[#56b29e] uppercase">Retrieved from real docs</span>
            </div>

            {/* Step 3: Agent Arguments */}
            <div className="p-3.5 rounded-[14px] bg-[#f8c33c]/20 border-2 border-[#1d1b18] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-brand font-black text-[#f47a22] uppercase block">
                  3. Agent Dialectic
                </span>
                <p className="text-xs font-bold text-[#1d1b18] mt-1">
                  Prosecutor entered {caseData?.agentResults?.prosecutor?.objections?.length || 0} objections; Defense entered {caseData?.agentResults?.defense?.counterarguments?.length || 0} counterarguments.
                </p>
              </div>
              <span className="mt-2 text-[10px] font-bold text-[#f47a22] uppercase">Adversarial testing</span>
            </div>

            {/* Step 4: Gemma 4 Verdict */}
            <div className={`p-3.5 rounded-[14px] ${theme.bg} border-2 border-[#1d1b18] flex flex-col justify-between`}>
              <div>
                <span className="text-[10px] font-brand font-black text-[#1d1b18] uppercase block">
                  4. Gemma 4 Verdict
                </span>
                <p className="text-xs font-black text-[#1d1b18] mt-1 uppercase">
                  {theme.label}
                </p>
              </div>
              <span className="mt-2 text-[10px] font-bold text-[#1d1b18] uppercase">Synthesized adjudication</span>
            </div>
          </div>
        </div>

        {/* C. CONTRADICTION DETECTOR (Conflicting statements & unsupported claims) */}
        <div className="p-5 rounded-[20px] bg-[#fbeeed] border-[2.5px] border-[#e5452f] shadow-[2px_2px_0px_#e5452f] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#e5452f]/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#e5452f]" />
              <h4 className="font-brand font-black text-lg uppercase text-[#e5452f]">
                Contradiction Detector (Conflicting Statements & Unsupported Claims)
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e5452f] text-white font-brand font-black text-xs uppercase">
              {hasContradictions ? 'CONTRADICTIONS IDENTIFIED' : 'NO CONFLICTS DETECTED'}
            </span>
          </div>

          {hasContradictions ? (
            <div className="space-y-3 pt-1">
              {/* Conflicting Statements */}
              {verdict.contradictingFindings && verdict.contradictingFindings.length > 0 && (
                <div>
                  <span className="text-xs font-brand font-black uppercase text-[#e5452f] block mb-1">
                    Direct Evidentiary Falsifications ({verdict.contradictingFindings.length}):
                  </span>
                  <ul className="space-y-1.5">
                    {verdict.contradictingFindings.map((finding, idx) => (
                      <li key={idx} className="p-2.5 rounded-[10px] bg-white border border-[#e5452f] text-xs font-bold text-[#1d1b18] flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-[#e5452f] shrink-0 mt-0.5" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unsupported Claims from FactChecker */}
              {conflictingAssessments.length > 0 && (
                <div>
                  <span className="text-xs font-brand font-black uppercase text-[#e5452f] block mb-1">
                    Unsupported Assertions Flagged by Verification Agent:
                  </span>
                  <div className="space-y-1.5">
                    {conflictingAssessments.map((a: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-[10px] bg-white border border-[#e5452f] text-xs font-semibold text-[#1d1b18]">
                        <p className="font-bold text-[#e5452f]">Premise: "{a.claim}"</p>
                        <p className="text-[11px] text-[#3a352e] mt-0.5">{a.assessment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-[12px] bg-white/70 border border-[#e5452f]/40 text-xs font-semibold text-[#1d1b18]">
              No conflicting assertions or uncorroborated contradictions were detected in this trial docket.
            </div>
          )}
        </div>

        {/* D. INDEPENDENT VERIFICATION & FINDINGS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Corroborating Findings */}
          <div className="p-4 rounded-[16px] bg-[#56b29e]/20 border-2 border-[#1d1b18]">
            <h5 className="font-brand font-black text-sm uppercase text-[#1d1b18] flex items-center gap-1.5 mb-2.5">
              <CheckCircle className="w-4 h-4 text-[#1d1b18]" />
              Corroborating Findings ({verdict.supportingFindings?.length || 0})
            </h5>
            {verdict.supportingFindings && verdict.supportingFindings.length > 0 ? (
              <ul className="space-y-1.5 text-xs font-semibold text-[#1d1b18]">
                {verdict.supportingFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#1d1b18] font-bold mt-0.5">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#6e665b] italic">No corroborating claims substantiated by primary citations.</p>
            )}
          </div>

          {/* Independent Verification & Code/Doc Checks */}
          <div className="p-4 rounded-[16px] bg-[#f8c33c]/20 border-2 border-[#1d1b18]">
            <h5 className="font-brand font-black text-sm uppercase text-[#1d1b18] flex items-center gap-1.5 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-[#1d1b18]" />
              Independent Verification & Spec Alignment
            </h5>
            <div className="text-xs space-y-2 text-[#1d1b18] font-semibold">
              <p>
                <b>Primary Source Checks:</b> All factual statements were cross-referenced against normative primary documentation corpora and verified encyclopedic records.
              </p>
              <p className="text-[11px] text-[#6e665b]">
                <b>Safe Verification:</b> Factual claims evaluated against canonical API semantics, specification boundaries, and runtime execution guarantees.
              </p>
            </div>
          </div>
        </div>

        {/* E. JUDICIAL REASONING */}
        <div className="pt-2">
          <span className="font-brand font-black text-sm uppercase text-[#6e665b] block mb-1">
            Gemma 4 Judicial Reasoning & Evidentiary Synthesis
          </span>
          <p className="text-sm text-[#3a352e] font-medium leading-relaxed bg-[#f1e4cf] p-4 rounded-[14px] border-2 border-[#1d1b18]">
            {verdict.reasoning}
          </p>
        </div>

        {/* F. CITED EVIDENCE RECORDS */}
        {verdict.citedEvidenceIds && verdict.citedEvidenceIds.length > 0 && (
          <div className="pt-2">
            <h5 className="font-brand font-black text-sm uppercase text-[#6e665b] flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-[#1d1b18]" />
              Normative Evidence Records Cited in Judgment ({verdict.citedEvidenceIds.length})
            </h5>
            <div className="flex flex-wrap gap-2">
              {verdict.citedEvidenceIds.map((id) => {
                const matched = evidenceRecords.find(e => e.evidenceId === id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onOpenEvidence?.(id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8c33c] hover:bg-[#ebce38] border-2 border-[#1d1b18] text-xs font-bold text-[#1d1b18] transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#1d1b18]"
                  >
                    <span className="font-mono-code font-black">{id}</span>
                    {matched && (
                      <span className="truncate max-w-[200px]">
                        {matched.sourceTitle}
                      </span>
                    )}
                    {matched?.sourceURL && (
                      <a
                        href={matched.sourceURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#1d1b18] hover:scale-110 ml-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* G. LIMITATIONS & UNRESOLVED QUESTIONS */}
        <div className="p-4 rounded-[16px] bg-[#f1e4cf] border-2 border-[#1d1b18] space-y-2 text-xs font-semibold text-[#6e665b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <b className="text-[#1d1b18] uppercase">CONFIDENCE ASSESSMENT: </b>
              <span>{verdict.confidenceAssessment || 'Deterministic primary citation alignment'}</span>
            </div>
            {verdict.confidenceLimitations && (
              <div className="text-[11px] text-[#e5452f]">
                <b className="uppercase">LIMITATION: </b>
                {verdict.confidenceLimitations}
              </div>
            )}
          </div>

          {verdict.unresolvedQuestions && verdict.unresolvedQuestions.length > 0 && (
            <div className="pt-2 border-t border-[#1d1b18]/20">
              <b className="text-[#1d1b18] uppercase block mb-1">Unresolved Questions:</b>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#3a352e]">
                {verdict.unresolvedQuestions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* H. VERDICT ROOM ACTIONS: Challenge & Replay + Export Case Report */}
        <div className="pt-4 border-t-2 border-[#1d1b18] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Challenge & Replay Trigger */}
          <button
            type="button"
            onClick={() => setShowChallengeForm(!showChallengeForm)}
            className="btn orange font-brand font-black flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-[#1d1b18]" />
            <span>CHALLENGE VERDICT & REPLAY</span>
            {showChallengeForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Export Case Report (JSON / Markdown) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleExport('markdown')}
              disabled={exportingFormat !== null}
              className="btn sm font-brand font-black flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportingFormat === 'markdown' ? 'EXPORTING...' : 'EXPORT REPORT (.MD)'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleExport('json')}
              disabled={exportingFormat !== null}
              className="btn sm ghost font-brand font-black border-2 border-[#1d1b18] flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#1d1b18]" />
              <span>{exportingFormat === 'json' ? 'EXPORTING...' : 'EXPORT RAW DATA (.JSON)'}</span>
            </button>
          </div>
        </div>

        {/* I. EXPANDABLE CHALLENGE & REPLAY ACCORDION FORM */}
        {showChallengeForm && (
          <form
            onSubmit={handleChallengeSubmit}
            className="p-6 rounded-[20px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#1d1b18]">
              <div>
                <h4 className="font-brand font-black text-xl uppercase text-[#1d1b18] flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-[#f47a22]" />
                  Lodge Appellate Challenge & Replay Investigation
                </h4>
                <p className="text-xs font-semibold text-[#6e665b] mt-0.5">
                  Introduce new primary evidence, counter-documentation, or empirical test results to reopen and re-adjudicate this case.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowChallengeForm(false)}
                className="text-xs font-brand font-black uppercase text-[#6e665b] hover:text-[#1d1b18]"
              >
                Close
              </button>
            </div>

            {challengeError && (
              <div className="p-3 rounded-[12px] bg-[#e5452f] text-white text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{challengeError}</span>
              </div>
            )}

            <div>
              <label className="block font-brand font-black text-xs uppercase text-[#1d1b18] mb-1.5">
                1. Counter-Evidence Text / Excerpt *
              </label>
              <textarea
                required
                rows={3}
                value={counterEvidence}
                onChange={(e) => setCounterEvidence(e.target.value)}
                placeholder="Paste the counter-citation, conflicting official documentation passage, or benchmark test log..."
                className="rift-input text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-brand font-black text-xs uppercase text-[#1d1b18] mb-1.5 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>2. Counter-Evidence URL (Optional)</span>
                </label>
                <input
                  type="url"
                  value={counterUrl}
                  onChange={(e) => setCounterUrl(e.target.value)}
                  placeholder="https://docs.canonical.com/..."
                  className="rift-input text-xs"
                />
              </div>

              <div>
                <label className="block font-brand font-black text-xs uppercase text-[#1d1b18] mb-1.5">
                  3. Appellate Reason / Argument (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Previous judgment failed to account for Node 20 runtime changes"
                  className="rift-input text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowChallengeForm(false)}
                className="btn sm ghost font-brand font-black border-2 border-[#1d1b18]"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={submittingChallenge || counterEvidence.trim().length < 5}
                className="btn sm arrow font-brand font-black disabled:opacity-50"
              >
                {submittingChallenge ? (
                  <span>EMPANELLING REPLAY...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>LODGE APPEAL & REPLAY</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
