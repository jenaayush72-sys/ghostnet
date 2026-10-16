import React from 'react';
import { ExternalLink, CheckCircle, XCircle, Info, ShieldCheck, X } from 'lucide-react';
import { EvidenceRecord } from '../types';

interface EvidenceDrawerProps {
  evidence: EvidenceRecord[];
  isOpen: boolean;
  onClose: () => void;
  selectedEvidenceId?: string | null;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  evidence,
  isOpen,
  onClose,
  selectedEvidenceId
}) => {
  if (!isOpen) return null;

  const getDirectionBadge = (dir: string) => {
    switch (dir) {
      case 'supports':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-brand font-black bg-[#56b29e] text-[#1d1b18] border border-[#1d1b18]">
            <CheckCircle className="w-3 h-3" /> SUPPORTS
          </span>
        );
      case 'contradicts':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-brand font-black bg-[#e5452f] text-white border border-[#1d1b18]">
            <XCircle className="w-3 h-3" /> CONTRADICTS
          </span>
        );
      case 'context':
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-brand font-black bg-[#7a8fd8] text-[#1d1b18] border border-[#1d1b18]">
            <Info className="w-3 h-3" /> CONTEXT
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-2xl bg-[#f8eedc] border-l-[3px] border-[#1d1b18] h-full flex flex-col shadow-[-6px_0px_0px_#1d1b18] overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b-[2.5px] border-[#1d1b18] flex items-center justify-between bg-[#f1e4cf]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1d1b18]" />
              <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#1d1b18]">
                EVIDENCE VAULT
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#f8c33c] text-[#1d1b18] border border-[#1d1b18] font-brand font-black">
                {evidence.length} RECORDS
              </span>
            </div>
            <p className="text-xs font-semibold text-[#6e665b] mt-0.5">
              Primary documents, encyclopedia entries, and verified specifications.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#f8eedc] hover:bg-[#e5452f] hover:text-white border-2 border-[#1d1b18] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {evidence.length === 0 ? (
            <div className="text-center py-16 text-[#6e665b]">
              <p className="font-brand font-bold text-lg uppercase">No evidence records indexed yet for this trial.</p>
              <p className="text-xs font-semibold mt-1">Evidence Agent harvests primary sources during Stage 2.</p>
            </div>
          ) : (
            evidence.map((item) => {
              const isHighlighted = selectedEvidenceId === item.evidenceId;
              return (
                <div
                  key={item.evidenceId}
                  id={`evidence-${item.evidenceId}`}
                  className={`rounded-[16px] border-[2px] border-[#1d1b18] p-4 transition-all ${
                    isHighlighted
                      ? 'bg-[#f8c33c] shadow-[3px_3px_0px_#1d1b18] ring-2 ring-[#1d1b18]'
                      : 'bg-[#f1e4cf] hover:bg-[#eae0cd] shadow-[2px_2px_0px_#1d1b18]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code text-xs font-black text-[#1d1b18] bg-[#f8eedc] px-2 py-0.5 rounded border border-[#1d1b18]">
                        {item.evidenceId}
                      </span>
                      <span className="text-[11px] font-mono-code font-bold text-[#6e665b] bg-[#f8eedc] px-2 py-0.5 rounded border border-[#1d1b18]">
                        {item.claimId}
                      </span>
                      <span className="text-xs font-bold text-[#3a352e]">
                        {item.sourceDomain}
                      </span>
                    </div>
                    {getDirectionBadge(item.evidenceDirection)}
                  </div>

                  <h4 className="font-brand font-black text-lg text-[#1d1b18] leading-snug">
                    {item.sourceTitle}
                  </h4>

                  {/* Verbatim Excerpt */}
                  <div className="mt-2.5 p-3 rounded-[12px] bg-[#f8eedc] border border-[#1d1b18] text-xs font-mono-code text-[#1d1b18] leading-relaxed">
                    "{item.excerpt}"
                  </div>

                  {/* Relevance & Source Link */}
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-bold text-[#6e665b]">
                      Source Type: <b className="text-[#1d1b18] uppercase">{item.sourceType || 'Primary Source'}</b>
                    </span>

                    {item.sourceURL && (
                      <a
                        href={item.sourceURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f8eedc] hover:bg-[#f8c33c] text-[#1d1b18] border border-[#1d1b18] font-brand font-black text-xs uppercase transition-colors"
                      >
                        <span>VIEW SOURCE</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
