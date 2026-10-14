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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-amber-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Evidentiary Repository</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">
            Normative Evidence Vault
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            All primary documents, web citations, and official specifications harvested across active cases.
          </p>
        </div>

        <span className="text-xs font-mono-code px-3 py-1.5 rounded-lg bg-[#141922] border border-[#273243] text-gray-300 self-start sm:self-auto">
          {total} Documents Indexed
        </span>
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-xl bg-[#10141B] border border-[#232A36] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within source titles, excerpts, domains..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0B0E13] border border-[#232A36] focus:border-amber-500 text-xs text-gray-100 placeholder-gray-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#0B0E13] border border-[#232A36] text-xs font-mono-code text-gray-300"
          >
            <option value="">All Evidentiary Directions</option>
            <option value="supports">Supports Claim</option>
            <option value="contradicts">Contradicts Claim</option>
            <option value="context">Provides Context</option>
          </select>

          <button
            onClick={loadEvidence}
            className="px-4 py-2 rounded-lg bg-[#181E29] hover:bg-[#222B3B] border border-[#2B3648] text-xs font-mono-code text-gray-200 transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Evidence Cards */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-2" />
          <p className="text-xs font-mono-code">Indexing evidentiary archive...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      ) : evidenceList.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-[#232A36] p-8 text-gray-500 text-xs font-mono-code">
          No evidence records matched your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidenceList.map((item) => (
            <div
              key={item.evidenceId}
              className="rounded-xl border border-[#232A36] bg-[#10141B] p-5 hover:border-[#323C4D] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.evidenceId}
                    </span>
                    <Link
                      to={`/courtroom/${item.caseId}`}
                      className="text-[11px] font-mono-code text-gray-400 hover:text-amber-300 bg-[#161B24] px-2 py-0.5 rounded border border-[#272E3D] flex items-center gap-1"
                    >
                      <span>{item.caseId}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  {getDirectionBadge(item.evidenceDirection)}
                </div>

                <h3 className="text-sm font-semibold text-gray-100 hover:text-amber-300 transition-colors mb-2">
                  <a
                    href={item.sourceURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5"
                  >
                    <span>{item.sourceTitle}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </a>
                </h3>

                <blockquote className="p-3 rounded-lg bg-[#090C10] border-l-2 border-emerald-500/70 text-xs text-gray-300 italic leading-relaxed mb-3">
                  "{item.excerpt}"
                </blockquote>
              </div>

              <div className="pt-3 border-t border-[#1C222C] flex items-center justify-between text-[11px] font-mono-code text-gray-400">
                <span className="text-gray-300">{item.sourceDomain}</span>
                <span className={item.retrievalStatus === 'verified' ? 'text-emerald-400' : 'text-amber-400'}>
                  {item.retrievalStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
