import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Search, Filter, ArrowRight, Gavel, Loader2,
  Calendar, CheckCircle2, AlertCircle
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
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono-code font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">TRUE</span>;
      case 'FALSE':
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono-code font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">FALSE</span>;
      case 'PARTIALLY TRUE':
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono-code font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">PARTIALLY TRUE</span>;
      case 'MISLEADING':
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono-code font-bold bg-orange-500/15 text-orange-400 border border-orange-500/25">MISLEADING</span>;
      case 'INSUFFICIENT EVIDENCE':
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono-code font-bold bg-slate-500/15 text-slate-300 border border-slate-500/25">INSUFFICIENT</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono-code bg-amber-500/10 text-amber-300 border border-amber-500/20">PENDING</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-amber-400 uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Evidentiary Archives</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">
            Case Law & Past Investigations
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Historical docket entries persisted in MongoDB. Click any case to inspect trial findings.
          </p>
        </div>

        <span className="text-xs font-mono-code px-3 py-1.5 rounded-lg bg-[#141922] border border-[#273243] text-gray-300 self-start sm:self-auto">
          {total} Case Records Inscribed
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-[#10141B] border border-[#232A36] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by case ID, claim, or keywords..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0B0E13] border border-[#232A36] focus:border-amber-500 text-xs text-gray-100 placeholder-gray-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#0B0E13] border border-[#232A36] text-xs font-mono-code text-gray-300"
          >
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="programming">Programming</option>
            <option value="news">News</option>
            <option value="decision">Decision</option>
          </select>

          {/* Verdict Filter */}
          <select
            value={verdict}
            onChange={(e) => setVerdict(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#0B0E13] border border-[#232A36] text-xs font-mono-code text-gray-300"
          >
            <option value="">All Verdicts</option>
            <option value="TRUE">TRUE</option>
            <option value="FALSE">FALSE</option>
            <option value="PARTIALLY TRUE">PARTIALLY TRUE</option>
            <option value="MISLEADING">MISLEADING</option>
            <option value="INSUFFICIENT EVIDENCE">INSUFFICIENT</option>
          </select>

          <button
            onClick={loadCases}
            className="px-4 py-2 rounded-lg bg-[#181E29] hover:bg-[#222B3B] border border-[#2B3648] text-xs font-mono-code text-gray-200 transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Case Table / List */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-2" />
          <p className="text-xs font-mono-code">Retrieving trial docket records...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      ) : cases.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-[#232A36] p-8 text-gray-500 text-xs font-mono-code">
          No cases match the selected search or filter parameters.
        </div>
      ) : (
        <div className="rounded-xl border border-[#232A36] overflow-hidden bg-[#10141B]">
          <div className="divide-y divide-[#1D232F]">
            {cases.map((c) => (
              <Link
                key={c.caseId}
                to={`/courtroom/${c.caseId}`}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#151A24] transition-colors block"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono-code text-xs font-bold text-amber-400">
                      {c.caseId}
                    </span>
                    <span className="text-[10px] uppercase font-mono-code px-2 py-0.5 rounded bg-[#1A202C] text-gray-300 border border-[#2D3748]">
                      {c.category}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono-code flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-100 line-clamp-2">
                    {c.originalClaim}
                  </h3>

                  {c.verdict?.summary && (
                    <p className="text-xs text-gray-400 line-clamp-1 italic">
                      "{c.verdict.summary}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                  <div className="text-right">
                    {getVerdictPill(c.verdict?.verdict)}
                    <span className="block text-[10px] text-gray-500 font-mono-code mt-1">
                      {c.evidenceReferences?.length || 0} Sources
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
