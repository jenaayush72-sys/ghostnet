import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Search, Filter, ArrowRight, Gavel, Loader2,
  Calendar, CheckCircle2, AlertCircle, Scale
} from 'lucide-react';
import { api } from '../services/api';
import { CaseData, Category, VerdictType } from '../types';

export const CaseHistory: React.FC = () => {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [verdict, setVerdict] = useState<string>('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCases();
  }, [category, verdict]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await api.getInvestigations({
        category: category || undefined,
        verdict: verdict || undefined,
        search: search.trim() || undefined,
        limit: 50
      });
      setCases(res.data);
      setTotal(res.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve cases');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCases();
  };

  const getVerdictPill = (v?: VerdictType | string | null) => {
    switch (v) {
      case 'TRUE':
        return <span className="px-3 py-1 rounded-full text-xs font-brand font-black bg-[#56b29e] text-[#1d1b18] border border-[#1d1b18]">TRUE</span>;
      case 'FALSE':
        return <span className="px-3 py-1 rounded-full text-xs font-brand font-black bg-[#e5452f] text-white border border-[#1d1b18]">FALSE</span>;
      case 'PARTIALLY TRUE':
        return <span className="px-3 py-1 rounded-full text-xs font-brand font-black bg-[#f8c33c] text-[#1d1b18] border border-[#1d1b18]">PARTIALLY TRUE</span>;
      case 'MISLEADING':
        return <span className="px-3 py-1 rounded-full text-xs font-brand font-black bg-[#f47a22] text-[#fff] border border-[#1d1b18]">MISLEADING</span>;
      case 'INSUFFICIENT EVIDENCE':
        return <span className="px-3 py-1 rounded-full text-xs font-brand font-black bg-[#7a8fd8] text-[#1d1b18] border border-[#1d1b18]">INSUFFICIENT</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-brand font-black bg-[#f1e4cf] text-[#1d1b18] border border-[#1d1b18]">IN TRIAL</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] flex flex-col sm:flex-row sm:items-center justify-between gap-4 dots">
        <div>
          <div className="tag-sticker yellow mb-3">HISTORICAL DOCKETS</div>
          <h1 className="font-brand font-black text-4xl sm:text-6xl text-[#1d1b18] uppercase leading-none">
            CASE HISTORY.
          </h1>
          <p className="text-sm font-semibold text-[#6e665b] mt-2 max-w-xl">
            Complete judicial repository of all empanelled trials, deliberated premises, and binding rulings.
          </p>
        </div>

        <div className="px-4 py-3 rounded-[16px] bg-[#f8c33c] border-2 border-[#1d1b18] text-[#1d1b18] text-right shrink-0">
          <span className="text-xs font-bold uppercase block opacity-80">Total Trials</span>
          <span className="font-brand font-black text-4xl leading-none">{total}</span>
        </div>
      </div>

      {/* Filter and Search Form */}
      <form onSubmit={handleSearchSubmit} className="p-5 rounded-[20px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search claims, dockets, reasoning..."
            className="rift-input text-xs"
          />
          <button type="submit" className="btn sm font-brand font-black">
            <Search className="w-3.5 h-3.5" />
            <span>SEARCH</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-brand font-black uppercase text-[#6e665b]">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rift-input text-xs font-bold py-1 px-3 w-auto"
            >
              <option value="">All Categories</option>
              <option value="general">Factual Claim</option>
              <option value="programming">Code & Technical</option>
              <option value="news">News & Events</option>
              <option value="decision">Argument / Policy</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-brand font-black uppercase text-[#6e665b]">Verdict:</span>
            <select
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              className="rift-input text-xs font-bold py-1 px-3 w-auto"
            >
              <option value="">All Rulings</option>
              <option value="TRUE">True</option>
              <option value="PARTIALLY TRUE">Partially True</option>
              <option value="FALSE">False</option>
              <option value="MISLEADING">Misleading</option>
              <option value="INSUFFICIENT EVIDENCE">Insufficient</option>
            </select>
          </div>
        </div>
      </form>

      {/* Case Dockets Grid */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="py-16 text-center text-[#6e665b] font-brand font-black uppercase">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#f47a22] mb-2" />
            Loading case archives...
          </div>
        ) : cases.length === 0 ? (
          <div className="py-16 text-center text-[#6e665b] p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18]">
            <p className="font-brand font-black text-2xl uppercase text-[#1d1b18]">No trial records found</p>
            <p className="text-xs font-semibold mt-1">Try adjusting filters or empanel a new case.</p>
          </div>
        ) : (
          cases.map((c) => (
            <Link
              key={c.caseId}
              to={`/courtroom/${c.caseId}`}
              className="p-5 sm:p-6 rounded-[20px] bg-[#f8eedc] hover:bg-[#ebdcc4] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-transform hover:translate-y-[-2px] block"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-brand font-black text-xs text-[#1d1b18] bg-[#f8c33c] px-3 py-0.5 rounded-full border border-[#1d1b18]">
                    {c.caseId}
                  </span>
                  <span className="text-[10px] font-brand font-black uppercase px-2.5 py-0.5 rounded-full bg-[#f1e4cf] text-[#1d1b18] border border-[#1d1b18]">
                    {c.category}
                  </span>
                  <span className="text-xs font-bold text-[#6e665b] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <h3 className="font-brand font-black text-xl sm:text-2xl text-[#1d1b18] leading-snug">
                  "{c.originalClaim}"
                </h3>

                {c.verdict?.summary && (
                  <p className="text-xs font-medium text-[#6e665b] line-clamp-2">
                    {c.verdict.summary}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                {getVerdictPill(c.verdict?.verdict)}
                <span className="btn sm font-brand font-black">
                  INSPECT →
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
