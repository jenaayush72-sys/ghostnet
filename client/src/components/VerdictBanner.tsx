import React from 'react';
import { Gavel, CheckCircle, XCircle, AlertTriangle, HelpCircle, FileText, ExternalLink } from 'lucide-react';
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
          bannerBg: 'bg-[#56b29e]',
          pillBg: 'bg-[#1d1b18] text-[#f8eedc]',
          icon: CheckCircle
        };
      case 'FALSE':
        return {
          bannerBg: 'bg-[#e5452f]',
          pillBg: 'bg-[#1d1b18] text-[#f8eedc]',
          icon: XCircle
        };
      case 'PARTIALLY TRUE':
        return {
          bannerBg: 'bg-[#f8c33c]',
          pillBg: 'bg-[#1d1b18] text-[#f8eedc]',
          icon: AlertTriangle
        };
      case 'MISLEADING':
        return {
          bannerBg: 'bg-[#f47a22]',
          pillBg: 'bg-[#1d1b18] text-[#f8eedc]',
          icon: AlertTriangle
        };
      case 'INSUFFICIENT EVIDENCE':
      default:
        return {
          bannerBg: 'bg-[#7a8fd8]',
          pillBg: 'bg-[#1d1b18] text-[#f8eedc]',
          icon: HelpCircle
        };
    }
  };

  const theme = getVerdictTheme(verdict.verdict);
  const VerdictIcon = theme.icon;

  return (
    <div className="rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] overflow-hidden relative">
      {/* Top Coloured Verdict Header */}
      <div className={`p-5 sm:p-6 ${theme.bannerBg} border-b-[2.5px] border-[#1d1b18] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative dots`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#1d1b18] text-[#f8eedc] flex items-center justify-center border-2 border-[#1d1b18]">
            <Gavel className="w-6 h-6 text-[#f8c33c]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-brand font-black text-xs uppercase tracking-wider text-[#1d1b18] px-2 py-0.5 rounded bg-[#f8eedc] border border-[#1d1b18]">
                BINDING ARTICLE VI RULING
              </span>
            </div>
            <h3 className="font-brand font-black text-3xl sm:text-4xl text-[#1d1b18] uppercase tracking-tight leading-none mt-1">
              COURT RULING: {verdict.verdict}
            </h3>
          </div>
        </div>

        {/* Big Verdict Pill Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1d1b18] text-[#f8eedc] font-brand font-black text-lg tracking-wider uppercase border border-[#1d1b18] shadow-[2px_2px_0px_#f8eedc]">
            <VerdictIcon className="w-5 h-5 text-[#f8c33c]" />
            {verdict.verdict}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Executive Summary */}
        <div>
          <span className="tag-sticker yellow mb-2">EXECUTIVE SUMMARY</span>
          <p className="text-base sm:text-lg text-[#1d1b18] font-bold leading-relaxed mt-2">
            {verdict.summary}
          </p>
        </div>

        {/* Judicial Reasoning */}
        <div className="pt-4 border-t-2 border-[#1d1b18]/20">
          <span className="font-brand font-black text-sm uppercase text-[#6e665b] block mb-1">
            Judicial Reasoning & Evidentiary Synthesis
          </span>
          <p className="text-sm text-[#3a352e] font-medium leading-relaxed">
            {verdict.reasoning}
          </p>
        </div>

        {/* Supporting & Contradicting Findings (Bento Duo) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Corroborating */}
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
              <p className="text-xs text-[#6e665b] italic">No corroborating claims substantiated.</p>
            )}
          </div>

          {/* Contradicting */}
          <div className="p-4 rounded-[16px] bg-[#f47a22]/20 border-2 border-[#1d1b18]">
            <h5 className="font-brand font-black text-sm uppercase text-[#1d1b18] flex items-center gap-1.5 mb-2.5">
              <XCircle className="w-4 h-4 text-[#1d1b18]" />
              Contradicting Findings ({verdict.contradictingFindings?.length || 0})
            </h5>
            {verdict.contradictingFindings && verdict.contradictingFindings.length > 0 ? (
              <ul className="space-y-1.5 text-xs font-semibold text-[#1d1b18]">
                {verdict.contradictingFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#1d1b18] font-bold mt-0.5">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#6e665b] italic">No contradictory evidence found.</p>
            )}
          </div>
        </div>

        {/* Cited Evidence Tags */}
        {verdict.citedEvidenceIds && verdict.citedEvidenceIds.length > 0 && (
          <div className="pt-4 border-t-2 border-[#1d1b18]/20">
            <h5 className="font-brand font-black text-sm uppercase text-[#6e665b] flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-[#1d1b18]" />
              Normative Evidence Records Cited in Judgment
            </h5>
            <div className="flex flex-wrap gap-2">
              {verdict.citedEvidenceIds.map((id) => {
                const matched = evidenceRecords.find(e => e.evidenceId === id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onOpenEvidence?.(id)}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f8c33c] hover:bg-[#ebce38] border-2 border-[#1d1b18] text-xs font-bold text-[#1d1b18] transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#1d1b18]"
                  >
                    <span className="font-mono-code font-black">{id}</span>
                    {matched && (
                      <span className="truncate max-w-[180px]">
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

        {/* Footer Confidence Note */}
        <div className="pt-3 border-t-2 border-[#1d1b18]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-[#6e665b]">
          <div>
            <b className="text-[#1d1b18] uppercase">CONFIDENCE ASSESSMENT: </b>
            <span>{verdict.confidenceAssessment || 'Deterministic primary citation alignment'}</span>
          </div>
          {verdict.confidenceLimitations && (
            <div className="text-[11px] text-[#6e665b] max-w-md">
              <b className="text-[#e5452f] uppercase">CAVEAT: </b>
              {verdict.confidenceLimitations}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
