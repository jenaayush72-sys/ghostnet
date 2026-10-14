import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale, ShieldAlert, ArrowRight, Gavel, Clock, Search,
  CheckCircle2, XCircle, AlertTriangle, HelpCircle, Sparkles, Plus, Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { CaseData, Category } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick investigation form state
  const [quickClaim, setQuickClaim] = useState('');
  const [quickCategory, setQuickCategory] = useState<Category>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.getInvestigations({ limit: 10 });
      setCases(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load case records from database');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClaim.trim() || quickClaim.length < 5 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await api.createInvestigation({
        claim: quickClaim.trim(),
        category: quickCategory
      });
      navigate(`/courtroom/${created.caseId}`);
    } catch (err: any) {
      alert(`Failed to empanel case: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  // Derive real statistics from loaded cases
  const totalCases = cases.length;
  const completedCases = cases.filter(c => c.status === 'completed').length;
  const inProgressCases = cases.filter(c => c.status === 'in_progress' || c.status === 'queued').length;
  const totalEvidenceCount = cases.reduce((acc, c) => acc + (c.evidenceReferences?.length || 0), 0);

  // Verdict breakdown
  const trueCount = cases.filter(c => c.verdict?.verdict === 'TRUE').length;
  const falseCount = cases.filter(c => c.verdict?.verdict === 'FALSE').length;
  const partiallyTrueCount = cases.filter(c => c.verdict?.verdict === 'PARTIALLY TRUE').length;
  const misleadingCount = cases.filter(c => c.verdict?.verdict === 'MISLEADING').length;
  const insufficientCount = cases.filter(c => c.verdict?.verdict === 'INSUFFICIENT EVIDENCE').length;

  const getVerdictBadge = (verdict?: string | null) => {
    switch (verdict) {
      case 'TRUE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">TRUE</span>;
      case 'FALSE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-rose-500/15 text-rose-400 border border-rose-500/25">FALSE</span>;
      case 'PARTIALLY TRUE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-amber-500/15 text-amber-400 border border-amber-500/25">PARTIALLY TRUE</span>;
      case 'MISLEADING':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-orange-500/15 text-orange-400 border border-orange-500/25">MISLEADING</span>;
      case 'INSUFFICIENT EVIDENCE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-slate-500/15 text-slate-300 border border-slate-500/25">INSUFFICIENT EVIDENCE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-amber-500/10 text-amber-300 border border-amber-500/20">IN TRIAL</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Quick Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#12161E] border border-[#232A36]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-amber-400 uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>Courtroom Chamber Active</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
            AI Verification Docket
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Select a past trial to review evidence records, or empanel a new case for immediate adversarial cross-examination.
          </p>
        </div>

        <Link
          to="/investigate"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm transition-all shadow-md shadow-amber-500/10 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Investigation</span>
        </Link>
      </div>

      {/* Quick Empanelling Input */}
      <div className="p-6 rounded-2xl bg-[#10141B] border border-[#232A36] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-200 font-mono-code flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Empanel Claim on Trial
          </h2>
          <span className="text-xs text-gray-400 font-mono-code">Fast-Track Filing</span>
        </div>

        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={quickClaim}
              onChange={(e) => setQuickClaim(e.target.value)}
              placeholder="Enter an AI answer, factual claim, or technical assertion (e.g. 'Node.js is purely single-threaded without threads')..."
              className="w-full px-4 py-3 rounded-xl bg-[#090B0E] border border-[#262E3E] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500 text-sm text-gray-100 placeholder-gray-500 transition-all font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono-code">Category:</span>
              {(['general', 'programming', 'news', 'decision'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setQuickCategory(cat)}
                  className={`px-2.5 py-1 rounded text-xs font-mono-code capitalize transition-colors ${
                    quickCategory === cat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#151921] text-gray-400 border border-[#232A36] hover:text-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={quickClaim.trim().length < 5 || isSubmitting}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-gray-950 font-bold text-xs uppercase tracking-wider font-mono-code transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Empanelling...</span>
                </>
              ) : (
                <>
                  <span>File Charges</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Real Statistics derived from database */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#12161E] border border-[#232A36]">
          <span className="text-xs text-gray-400 font-mono-code">Total Cases</span>
          <p className="text-2xl font-bold text-gray-100 font-mono-code mt-1">{totalCases}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#12161E] border border-[#232A36]">
          <span className="text-xs text-gray-400 font-mono-code">Trials Concluded</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono-code mt-1">{completedCases}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#12161E] border border-[#232A36]">
          <span className="text-xs text-gray-400 font-mono-code">In Active Trial</span>
          <p className="text-2xl font-bold text-amber-400 font-mono-code mt-1">{inProgressCases}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#12161E] border border-[#232A36]">
          <span className="text-xs text-gray-400 font-mono-code">Evidence Referenced</span>
          <p className="text-2xl font-bold text-sky-400 font-mono-code mt-1">{totalEvidenceCount}</p>
        </div>
      </div>

      {/* Verdict Breakdown Strip */}
      {completedCases > 0 && (
        <div className="p-4 rounded-xl bg-[#10141B] border border-[#232A36] flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code">
          <span className="text-gray-400">Verdict Precedent Distribution:</span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-emerald-400">TRUE: {trueCount}</span>
            <span className="text-rose-400">FALSE: {falseCount}</span>
            <span className="text-amber-400">PARTIAL: {partiallyTrueCount}</span>
            <span className="text-orange-400">MISLEADING: {misleadingCount}</span>
            <span className="text-slate-400">INSUFFICIENT: {insufficientCount}</span>
          </div>
        </div>
      )}

      {/* Recent Investigations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Court Dockets
          </h2>
          <Link
            to="/history"
            className="text-xs font-mono-code text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs font-mono-code">Loading case archives from MongoDB...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        ) : cases.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-[#232A36] p-8 text-gray-400">
            <Gavel className="w-10 h-10 mx-auto text-gray-600 mb-3" />
            <h3 className="text-base font-semibold text-gray-200">The Courtroom is currently adjourned</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
              No investigation cases have been empanelled yet. Enter a claim above to initiate the first trial!
            </p>
            <Link
              to="/investigate"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs font-mono-code"
            >
              <Plus className="w-4 h-4" /> Empanel First Case
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-[#232A36] overflow-hidden bg-[#10141B]">
            <div className="divide-y divide-[#1D232F]">
              {cases.map((c) => (
                <Link
                  key={c.caseId}
                  to={`/courtroom/${c.caseId}`}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#151A24] transition-colors block"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code text-xs font-bold text-amber-400">
                        {c.caseId}
                      </span>
                      <span className="text-[10px] uppercase font-mono-code px-2 py-0.5 rounded bg-[#1A202C] text-gray-300 border border-[#2D3748]">
                        {c.category}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-100 line-clamp-1">
                      {c.originalClaim}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getVerdictBadge(c.verdict?.verdict)}
                    <span className="text-xs text-gray-500 hidden md:block font-mono-code">
                      Stage: {c.currentStage}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
