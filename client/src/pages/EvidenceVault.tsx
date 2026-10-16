import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, ExternalLink, CheckCircle, XCircle, Info,
  Loader2, Filter, ShieldCheck, ArrowRight, AlertTriangle, Scale, Sparkles, Eye
} from 'lucide-react';
import { api } from '../services/api';
import { EvidenceRecord } from '../types';

export const EvidenceVault: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState<string>('');
  const [onlyContradictions, setOnlyContradictions] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadEvidence();
  }, [direction, onlyContradictions]);

  const loadEvidence = async () => {
    setLoading(true);
    try {
      const activeDir = onlyContradictions ? 'contradicts' : (direction || undefined);
      const res = await api.getAllEvidence({
        direction: activeDir,
        search: search.trim() || undefined,
        limit: 100
      });
      setEvidenceList(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve evidence records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvidence();
  };

  const supportsCount = evidenceList.filter(e => e.evidenceDirection === 'supports').length;
  const contradictsCount = evidenceList.filter(e => e.evidenceDirection === 'contradicts').length;
  const contextCount = evidenceList.filter(e => e.evidenceDirection === 'context' || !e.evidenceDirection).length;

  const getDirectionBadge = (dir: string) => {
    switch (dir) {
      case 'supports':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-brand font-black bg-[#56b29e] text-[#1d1b18] border-2 border-[#1d1b18]">
            <CheckCircle className="w-3.5 h-3.5" /> SUPPORTS CLAIM
          </span>
        );
      case 'contradicts':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-brand font-black bg-[#e5452f] text-white border-2 border-[#1d1b18] animate-pulse">
            <XCircle className="w-3.5 h-3.5" /> CONTRADICTION DETECTED
          </span>
        );
      case 'context':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-brand font-black bg-[#7a8fd8] text-[#1d1b18] border-2 border-[#1d1b18]">
            <Info className="w-3.5 h-3.5" /> EMPIRICAL CONTEXT
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner - Screen 3: Evidence Wall */}
      <div className="p-6 sm:p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] flex flex-col md:flex-row md:items-center justify-between gap-6 dots">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="tag-sticker yellow">SCREEN 3: EVIDENCE WALL</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#56b29e] border border-[#1d1b18] text-[11px] font-brand font-black uppercase text-[#1d1b18]">
              CLAIMS, SOURCES & CONTRADICTIONS
            </span>
          </div>
          <h1 className="font-brand font-black text-4xl sm:text-6xl text-[#1d1b18] uppercase leading-none">
            EVIDENCE WALL.
          </h1>
          <p className="text-sm font-semibold text-[#6e665b] mt-2 max-w-2xl">
            Live interactive depository of verified documentation, technical specifications, real source excerpts, and highlighted contradictions detected across AI courtroom proceedings.
          </p>
        </div>

        {/* Quick Stats Bento */}
        <div className="grid grid-cols-3 gap-2.5 shrink-0">
          <div className="p-3 rounded-[16px] bg-[#f1e4cf] border-2 border-[#1d1b18] text-center">
            <span className="text-[10px] font-brand font-bold uppercase block text-[#6e665b]">Total Records</span>
            <span className="font-brand font-black text-2xl text-[#1d1b18] leading-none">{total}</span>
          </div>
          <div className="p-3 rounded-[16px] bg-[#56b29e]/30 border-2 border-[#1d1b18] text-center">
            <span className="text-[10px] font-brand font-bold uppercase block text-[#1d1b18]">Supports</span>
            <span className="font-brand font-black text-2xl text-[#1d1b18] leading-none">{supportsCount}</span>
          </div>
          <div className="p-3 rounded-[16px] bg-[#e5452f]/20 border-2 border-[#1d1b18] text-center">
            <span className="text-[10px] font-brand font-bold uppercase block text-[#e5452f]">Contradictions</span>
            <span className="font-brand font-black text-2xl text-[#e5452f] leading-none">{contradictsCount}</span>
          </div>
        </div>
      </div>

      {/* Contradiction Detector Bar & Filter Form */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="p-5 rounded-[20px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search citations, claims, keywords, domains, excerpts..."
              className="rift-input text-xs"
            />
            <button type="submit" className="btn sm font-brand font-black">
              <Search className="w-3.5 h-3.5" />
              <span>SEARCH</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {/* Contradiction Quick Switch */}
            <button
              type="button"
              onClick={() => {
                setOnlyContradictions(!onlyContradictions);
                if (!onlyContradictions) setDirection('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-brand font-black uppercase border-2 border-[#1d1b18] transition-all ${
                onlyContradictions
                  ? 'bg-[#e5452f] text-white shadow-[2px_2px_0px_#1d1b18]'
                  : 'bg-[#f1e4cf] text-[#e5452f] hover:bg-[#ebdcc4]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>CONTRADICTIONS ONLY</span>
            </button>

            <span className="text-xs font-brand font-black uppercase text-[#6e665b] whitespace-nowrap ml-1">Direction:</span>
            <div className="flex gap-1.5 flex-wrap">
              {['', 'supports', 'contradicts', 'context'].map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={onlyContradictions}
                  onClick={() => setDirection(val)}
                  className={`px-3 py-1 rounded-full text-xs font-brand font-black uppercase border border-[#1d1b18] transition-colors ${
                    direction === val && !onlyContradictions
                      ? 'bg-[#f8c33c] text-[#1d1b18]'
                      : 'bg-[#f1e4cf] text-[#3a352e] hover:bg-[#ebdcc4] disabled:opacity-40'
                  }`}
                >
                  {val === '' ? 'ALL' : val}
                </button>
              ))}
            </div>
          </div>
        </form>

        {onlyContradictions && (
          <div className="p-3.5 rounded-[14px] bg-[#e5452f]/15 border-2 border-[#e5452f] flex items-center justify-between gap-3 text-xs font-bold text-[#1d1b18]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#e5452f] shrink-0" />
              <span>
                <b>Contradiction Detector Filter Active:</b> Showing exclusively statements and evidence citations that directly conflict with or refute submitted claims.
              </span>
            </div>
            <button
              onClick={() => setOnlyContradictions(false)}
              className="text-xs underline font-brand font-black uppercase hover:text-[#e5452f]"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Evidence Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-[#6e665b] font-brand font-black uppercase">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#f47a22] mb-2" />
            Harvesting verified citations and contradiction analysis...
          </div>
        ) : evidenceList.length === 0 ? (
          <div className="py-16 text-center text-[#6e665b] p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18]">
            <p className="font-brand font-black text-2xl uppercase text-[#1d1b18]">No citations matched your filter</p>
            <p className="text-xs font-semibold mt-1">Try resetting the filter or running a new courtroom investigation.</p>
          </div>
        ) : (
          evidenceList.map((item) => {
            const isContradiction = item.evidenceDirection === 'contradicts';
            return (
              <div
                key={item.evidenceId}
                className={`p-6 rounded-[22px] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-3.5 transition-all ${
                  isContradiction ? 'bg-[#fbeeed] border-l-[8px] border-l-[#e5452f]' : 'bg-[#f8eedc]'
                }`}
              >
                {/* Top Badge Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#1d1b18]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-brand font-black text-xs text-[#1d1b18] bg-[#f8c33c] px-3 py-1 rounded-full border border-[#1d1b18]">
                      {item.evidenceId}
                    </span>
                    <span className="text-xs font-bold text-[#1d1b18] bg-[#f1e4cf] px-2.5 py-1 rounded-full border border-[#1d1b18]">
                      {item.sourceDomain}
                    </span>
                    <span className="text-xs font-mono-code font-bold text-[#6e665b] bg-[#f1e4cf] px-2.5 py-1 rounded-full border border-[#1d1b18]">
                      Docket: {item.claimId}
                    </span>
                    <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#56b29e] text-[#1d1b18] border border-[#1d1b18]">
                      Status: {item.retrievalStatus || 'Verified'}
                    </span>
                  </div>

                  {getDirectionBadge(item.evidenceDirection)}
                </div>

                {/* Source Title */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-brand font-black text-2xl sm:text-3xl text-[#1d1b18] leading-tight">
                    {item.sourceTitle}
                  </h3>
                </div>

                {/* Contradiction Warning Callout */}
                {isContradiction && (
                  <div className="p-3 rounded-[12px] bg-[#e5452f]/10 border-2 border-[#e5452f] text-xs font-bold text-[#e5452f] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>CONTRADICTION DETECTED: This documented excerpt falsifies or conflicts with the original indictment premise.</span>
                  </div>
                )}

                {/* Excerpt Box */}
                <div className={`p-4 rounded-[14px] border-2 border-[#1d1b18] text-xs font-mono-code text-[#1d1b18] leading-relaxed ${
                  isContradiction ? 'bg-[#fff5f5]' : 'bg-[#f1e4cf]'
                }`}>
                  <span className="block font-brand font-black text-[11px] uppercase text-[#6e665b] mb-1">
                    Verified Source Excerpt:
                  </span>
                  "{item.excerpt}"
                </div>

                {/* Bottom Actions & Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-bold text-[#6e665b]">
                  <div className="flex items-center gap-3">
                    <span>
                      Corpus Type: <b className="text-[#1d1b18] uppercase">{item.sourceType ? item.sourceType.replace(/_/g, ' ') : 'Official Primary Document'}</b>
                    </span>
                    <span>
                      Retrieved: <b className="text-[#1d1b18]">{new Date(item.retrievedAt).toLocaleDateString()}</b>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.caseId && (
                      <Link
                        to={`/courtroom/${item.caseId}`}
                        className="btn sm ghost font-brand font-black border-2 border-[#1d1b18] flex items-center gap-1.5"
                      >
                        <Scale className="w-3.5 h-3.5 text-[#1d1b18]" />
                        <span>VIEW TRIAL DOCKET</span>
                      </Link>
                    )}

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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
