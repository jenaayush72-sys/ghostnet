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
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-code bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Supports
          </span>
        );
      case 'contradicts':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-code bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Contradicts
          </span>
        );
      case 'context':
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-code bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Info className="w-3 h-3" /> Context
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl bg-[#0D1016] border-l border-[#232A36] h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#232A36] flex items-center justify-between bg-[#11151D]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-gray-100 font-mono-code">
                Evidence Vault
              </h3>
              <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono-code">
                {evidence.length} Records
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Primary documents, encyclopedia entries, and official specifications.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-[#1C222C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {evidence.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No evidence records indexed yet for this trial.</p>
              <p className="text-xs text-gray-500 mt-1">Evidence Agent harvests primary sources during Stage 2.</p>
            </div>
          ) : (
            evidence.map((item) => {
              const isHighlighted = selectedEvidenceId === item.evidenceId;
              return (
                <div
                  key={item.evidenceId}
                  id={`evidence-${item.evidenceId}`}
                  className={`rounded-xl border p-4 transition-all ${
                    isHighlighted
                      ? 'border-amber-500 bg-[#161B24] ring-1 ring-amber-500/50 shadow-lg'
                      : 'border-[#232A36] bg-[#12161E] hover:border-[#323C4D]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {item.evidenceId}
                      </span>
                      <span className="text-[11px] font-mono-code text-gray-400 bg-[#181D26] px-2 py-0.5 rounded border border-[#272E3D]">
                        {item.claimId}
                      </span>
                      <span className="text-xs text-gray-400 font-mono-code">
                        {item.sourceDomain}
                      </span>
                    </div>
                    {getDirectionBadge(item.evidenceDirection)}
                  </div>

                  <h4 className="text-sm font-semibold text-gray-100 mb-1 hover:text-amber-300 transition-colors">
                    <a
                      href={item.sourceURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5"
                    >
                      <span>{item.sourceTitle}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    </a>
                  </h4>

                  <blockquote className="my-2.5 p-3 rounded-lg bg-[#0A0D12] border-l-2 border-amber-500/70 text-xs text-gray-300 italic leading-relaxed">
                    "{item.excerpt}"
                  </blockquote>

                  <div className="pt-2 border-t border-[#1C222C] flex items-center justify-between text-[11px] text-gray-400 font-mono-code">
                    <span>
                      Type: <span className="text-gray-300">{item.sourceType.replace('_', ' ')}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      {item.publishedAt && (
                        <span>Published: {new Date(item.publishedAt).toLocaleDateString()}</span>
                      )}
                      <span className={item.retrievalStatus === 'verified' ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.retrievalStatus}
                      </span>
                    </div>
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
