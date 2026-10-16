import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, ExternalLink, CheckCircle, XCircle, Info,
  Loader2, Filter, ShieldCheck, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { EvidenceRecord } from '../types';

export const EvidenceVault: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState<string>('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadEvidence();
  }, [direction]);

  const loadEvidence = async () => {
    setLoading(true);
    try {
      const res = await api.getAllEvidence({
        direction: direction || undefined,
        search: search.trim() || undefined,
        limit: 50
      });
      setEvidenceList(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve evidence vault');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvidence();
  };

  const getDirectionBadge = (dir: string) => {
    switch (dir) {
      case 'supports':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-brand font-black bg-[#56b29e] text-[#1d1b18] border border-[#1d1b18]">
            <CheckCircle className="w-3.5 h-3.5" /> SUPPORTS
          </span>
        );
      case 'contradicts':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-brand font-black bg-[#e5452f] text-white border border-[#1d1b18]">
            <XCircle className="w-3.5 h-3.5" /> CONTRADICTS
          </span>
        );
      case 'context':
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-brand font-black bg-[#7a8fd8] text-[#1d1b18] border border-[#1d1b18]">
            <Info className="w-3.5 h-3.5" /> CONTEXT
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] flex flex-col sm:flex-row sm:items-center justify-between gap-4 dots">
        <div>
          <div className="tag-sticker yellow mb-3">EVIDENTIARY ARCHIVE</div>
          <h1 className="font-brand font-black text-4xl sm:text-6xl text-[#1d1b18] uppercase leading-none">
            EVIDENCE VAULT.
          </h1>
          <p className="text-sm font-semibold text-[#6e665b] mt-2 max-w-xl">
            Indexed primary specifications, documentation corpora, and verified encyclopedia records retrieved by the Evidence Agent.
          </p>
        </div>

        <div className="px-4 py-3 rounded-[16px] bg-[#56b29e] border-2 border-[#1d1b18] text-[#1d1b18] text-right shrink-0">
          <span className="text-xs font-bold uppercase block opacity-80">Total Citations</span>
          <span className="font-brand font-black text-4xl leading-none">{total}</span>
        </div>
      </div>

      {/* Filter and Search Form */}
      <form onSubmit={handleSearch} className="p-5 rounded-[20px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search citations, keywords, domains, excerpts..."
            className="rift-input text-xs"
          />
          <button type="submit" className="btn sm font-brand font-black">
            <Search className="w-3.5 h-3.5" />
            <span>SEARCH</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-brand font-black uppercase text-[#6e665b] whitespace-nowrap">Filter:</span>
          <div className="flex gap-1.5 flex-wrap">
            {['', 'supports', 'contradicts', 'context'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setDirection(val)}
                className={`px-3 py-1 rounded-full text-xs font-brand font-black uppercase border border-[#1d1b18] transition-colors ${
                  direction === val ? 'bg-[#f8c33c] text-[#1d1b18]' : 'bg-[#f1e4cf] text-[#3a352e] hover:bg-[#ebdcc4]'
                }`}
              >
                {val === '' ? 'ALL' : val}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Evidence Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-[#6e665b] font-brand font-black uppercase">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#f47a22] mb-2" />
            Harvesting evidence records...
          </div>
        ) : evidenceList.length === 0 ? (
          <div className="py-16 text-center text-[#6e665b] p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18]">
            <p className="font-brand font-black text-2xl uppercase text-[#1d1b18]">No citations matched your filter</p>
            <p className="text-xs font-semibold mt-1">Try resetting the filter or running a new courtroom investigation.</p>
          </div>
        ) : (
          evidenceList.map((item) => (
            <div
              key={item.evidenceId}
              className="p-6 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#1d1b18]">
                <div className="flex items-center gap-2">
                  <span className="font-brand font-black text-xs text-[#1d1b18] bg-[#f8c33c] px-3 py-1 rounded-full border border-[#1d1b18]">
                    {item.evidenceId}
                  </span>
                  <span className="text-xs font-bold text-[#6e665b] bg-[#f1e4cf] px-2.5 py-1 rounded-full border border-[#1d1b18]">
                    {item.sourceDomain}
                  </span>
                  <span className="text-xs font-mono-code font-bold text-[#6e665b]">
                    Docket: {item.claimId}
                  </span>
                </div>
                {getDirectionBadge(item.evidenceDirection)}
              </div>

              <h3 className="font-brand font-black text-2xl text-[#1d1b18] leading-snug">
                {item.sourceTitle}
              </h3>

              <div className="p-4 rounded-[14px] bg-[#f1e4cf] border-2 border-[#1d1b18] text-xs font-mono-code text-[#1d1b18] leading-relaxed">
                "{item.excerpt}"
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-bold text-[#6e665b]">
                <span>Source Type: <b className="text-[#1d1b18] uppercase">{item.sourceType || 'Normative Primary Source'}</b></span>
                {item.sourceURL && (
                  <a
                    href={item.sourceURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn sm font-brand font-black"
                  >
                    <span>OPEN OFFICIAL SOURCE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
