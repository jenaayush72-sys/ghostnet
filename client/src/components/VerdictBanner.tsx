import React from 'react';
import { Gavel, CheckCircle, XCircle, AlertTriangle, HelpCircle, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { VerdictData, VerdictType, EvidenceRecord } from '../types';

interface VerdictBannerProps {
  verdict: VerdictData;
  evidenceRecords?: EvidenceRecord[];
  onOpenEvidence?: (evidenceId: string) => void;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({
  verdict,
  evidenceRecords = [],
  onOpenEvidence
}) => {
  const getVerdictTheme = (type: VerdictType) => {
    switch (type) {
      case 'TRUE':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: CheckCircle,
          glow: 'shadow-emerald-500/5'
        };
      case 'FALSE':
        return {
          bg: 'bg-rose-950/40 border-rose-500/40 text-rose-300',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: XCircle,
          glow: 'shadow-rose-500/5'
        };
      case 'PARTIALLY TRUE':
        return {
          bg: 'bg-amber-950/40 border-amber-500/40 text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: AlertTriangle,
          glow: 'shadow-amber-500/5'
        };
      case 'MISLEADING':
        return {
          bg: 'bg-orange-950/40 border-orange-500/40 text-orange-300',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          icon: AlertTriangle,
          glow: 'shadow-orange-500/5'
        };
      case 'INSUFFICIENT EVIDENCE':
      default:
        return {
          bg: 'bg-slate-900/60 border-slate-600/50 text-slate-300',
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
          icon: HelpCircle,
          glow: 'shadow-slate-500/5'
        };
    }
  };

  const theme = getVerdictTheme(verdict.verdict);
  const VerdictIcon = theme.icon;

  return (
    <div className={`rounded-xl border ${theme.bg} p-6 shadow-xl ${theme.glow} transition-all`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B3545]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#141A24] border border-[#303B4C] flex items-center justify-center text-amber-400">
            <Gavel className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-mono-code text-gray-400">
                Final Judicial Determination
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code uppercase bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                Article VI Binding
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-gray-100 flex items-center gap-2">
              Court Ruling: <span className="font-mono-code underline decoration-amber-500/50">{verdict.verdict}</span>
            </h3>
          </div>
        </div>

        {/* Verdict Badge */}
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-bold font-mono-code ${theme.badge}`}>
            <VerdictIcon className="w-4 h-4" />
            {verdict.verdict}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono-code mb-1">
          Executive Summary
        </h4>
        <p className="text-base text-gray-100 font-medium leading-relaxed">
          {verdict.summary}
        </p>
      </div>

      {/* Detailed Reasoning */}
      <div className="mt-4 pt-4 border-t border-[#232A36]">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono-code mb-1.5">
          Judicial Reasoning & Evidentiary Synthesis
        </h4>
        <p className="text-sm text-gray-300 leading-relaxed font-sans">
          {verdict.reasoning}
        </p>
      </div>

      {/* Supporting & Contradicting Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Supporting */}
        <div className="rounded-lg bg-[#0F1318]/70 border border-[#232A36] p-4">
          <h5 className="text-xs font-semibold uppercase font-mono-code text-emerald-400 flex items-center gap-1.5 mb-2.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Corroborating Findings ({verdict.supportingFindings?.length || 0})
          </h5>
          {verdict.supportingFindings && verdict.supportingFindings.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-gray-300">
              {verdict.supportingFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500 italic">No corroborating claims substantiated.</p>
          )}
        </div>

        {/* Contradicting */}
        <div className="rounded-lg bg-[#0F1318]/70 border border-[#232A36] p-4">
          <h5 className="text-xs font-semibold uppercase font-mono-code text-rose-400 flex items-center gap-1.5 mb-2.5">
            <XCircle className="w-3.5 h-3.5" />
            Contradicting Findings ({verdict.contradictingFindings?.length || 0})
          </h5>
          {verdict.contradictingFindings && verdict.contradictingFindings.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-gray-300">
              {verdict.contradictingFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500 italic">No contradictory evidence presented.</p>
          )}
        </div>
      </div>

      {/* Cited Evidence Records */}
      {verdict.citedEvidenceIds && verdict.citedEvidenceIds.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[#232A36]">
          <h5 className="text-xs font-semibold uppercase font-mono-code text-gray-400 flex items-center gap-1.5 mb-2">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Normative Evidence Records Cited in Judgment
          </h5>
          <div className="flex flex-wrap gap-2">
            {verdict.citedEvidenceIds.map((id) => {
              const matched = evidenceRecords.find(e => e.evidenceId === id);
              return (
                <div
                  key={id}
                  onClick={() => onOpenEvidence?.(id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#161B24] border border-[#2C3647] hover:border-amber-500/50 text-xs text-gray-200 cursor-pointer transition-colors"
                >
                  <span className="font-mono-code font-bold text-amber-400">{id}</span>
                  {matched && (
                    <span className="text-gray-300 truncate max-w-[200px]">
                      {matched.sourceTitle}
                    </span>
                  )}
                  {matched?.sourceURL && (
                    <a
                      href={matched.sourceURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-amber-300 ml-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confidence Assessment and Explicit Limitations */}
      <div className="mt-4 pt-3 border-t border-[#232A36]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
        <div>
          <span className="font-semibold text-gray-300 font-mono-code">Confidence: </span>
          <span>{verdict.confidenceAssessment || 'Standard Evidentiary Certainty'}</span>
        </div>
        {verdict.confidenceLimitations && (
          <div className="text-[11px] text-gray-400 max-w-xl">
            <span className="text-amber-400/90 font-mono-code">Limitation Caveat: </span>
            {verdict.confidenceLimitations}
          </div>
        )}
      </div>
    </div>
  );
};
