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

  const getVerdictBadge = (verdict?: string | null) => {
    switch (verdict) {
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
      {/* 1. Header Banner Bento */}
      <div className="p-6 sm:p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] flex flex-col md:flex-row md:items-center justify-between gap-6 dots">
        <div>
          <div className="tag-sticker yellow mb-2">COURT CHAMBERS ACTIVE</div>
          <h1 className="font-brand font-black text-4xl sm:text-6xl text-[#1d1b18] uppercase leading-none">
            AI VERIFICATION DOCKET.
          </h1>
          <p className="text-sm font-semibold text-[#6e665b] mt-2 max-w-xl">
            Review live and archived trials, inspect primary citations, or empanel new claims for adversarial cross-examination.
          </p>
        </div>

        <Link
          to="/investigate"
          className="btn arrow font-brand font-black"
        >
          <ShieldAlert className="w-4 h-4 text-[#1d1b18]" />
          <span>EMPANEL TRIAL</span>
        </Link>
      </div>

      {/* 2. Stat Chips Row (Signature 4 colors: Orange, Blue, Pink, Yellow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-[18px] bg-[#f47a22] border-[2.5px] border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-[#1d1b18] opacity-80 block">Total Dockets</span>
            <span className="font-brand font-black text-4xl text-[#1d1b18] leading-tight">{totalCases}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1d1b18] text-[#f47a22] flex items-center justify-center font-brand font-black">
            Σ
          </div>
        </div>

        <div className="p-4 rounded-[18px] bg-[#56b29e] border-[2.5px] border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-[#1d1b18] opacity-80 block">Verdicts Concluded</span>
            <span className="font-brand font-black text-4xl text-[#1d1b18] leading-tight">{completedCases}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1d1b18] text-[#56b29e] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-[18px] bg-[#7a8fd8] border-[2.5px] border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-[#1d1b18] opacity-80 block">Active Chamber Trials</span>
            <span className="font-brand font-black text-4xl text-[#1d1b18] leading-tight">{inProgressCases}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1d1b18] text-[#7a8fd8] flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-[18px] bg-[#f8c33c] border-[2.5px] border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-[#1d1b18] opacity-80 block">Indexed Citations</span>
            <span className="font-brand font-black text-4xl text-[#1d1b18] leading-tight">{totalEvidenceCount}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1d1b18] text-[#f8c33c] flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Quick Empanel Card + Recent Cases Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Empanel Form (4 cols) */}
        <div className="lg:col-span-5 p-6 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-4">
          <div>
            <span className="tag-sticker teal mb-2">QUICK CHAMBER TRIAL</span>
            <h3 className="font-brand font-black text-2xl text-[#1d1b18] uppercase mt-2">
              Empanel a Statement
            </h3>
            <p className="text-xs font-semibold text-[#6e665b] mt-1">
              Test any generative answer or factual claim instantly.
            </p>
          </div>

          <form onSubmit={handleQuickSubmit} className="space-y-3">
            <div>
              <label className="block font-brand font-black text-xs uppercase text-[#1d1b18] mb-1">
                Category
              </label>
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value as Category)}
                className="rift-input text-xs font-bold"
              >
                <option value="general">Factual / General Assertion</option>
                <option value="programming">Code & Technical Framework</option>
                <option value="news">News & Current Affairs</option>
                <option value="decision">Complex Argument / Policy</option>
              </select>
            </div>

            <div>
              <label className="block font-brand font-black text-xs uppercase text-[#1d1b18] mb-1">
                Claim / Assertion
              </label>
              <textarea
                rows={4}
                required
                value={quickClaim}
                onChange={(e) => setQuickClaim(e.target.value)}
                placeholder="Paste statement to interrogate..."
                className="rift-input text-xs font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || quickClaim.trim().length < 5}
              className="btn w-full arrow font-brand font-black text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#1d1b18]" />
                  <span>EMPANELLING...</span>
                </>
              ) : (
                <span>EMPANEL TRIAL NOW</span>
              )}
            </button>
          </form>
        </div>

        {/* Recent Cases List (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1d1b18]">
              <div>
                <h3 className="font-brand font-black text-2xl text-[#1d1b18] uppercase flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#f47a22]" />
                  Recent Court Dockets
                </h3>
                <p className="text-xs font-semibold text-[#6e665b]">
                  Showing latest investigations in local memory/database.
                </p>
              </div>
              <Link
                to="/history"
                className="text-xs font-brand font-black uppercase text-[#1d1b18] hover:underline"
              >
                VIEW ALL →
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {loading ? (
                <div className="py-12 text-center text-[#6e665b] font-brand font-black uppercase">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#f47a22] mb-2" />
                  Loading case records...
                </div>
              ) : cases.length === 0 ? (
                <div className="py-12 text-center text-[#6e665b]">
                  <p className="font-brand font-black text-lg uppercase">No cases empanelled yet</p>
                  <p className="text-xs font-semibold mt-1">Submit your first claim using the form on the left!</p>
                </div>
              ) : (
                cases.slice(0, 5).map((c) => (
                  <Link
                    key={c.caseId}
                    to={`/courtroom/${c.caseId}`}
                    className="p-3.5 rounded-[16px] bg-[#f1e4cf] hover:bg-[#ebdcc4] border-2 border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] flex items-center justify-between gap-3 transition-transform hover:translate-x-1 block"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-brand font-black text-xs text-[#1d1b18] bg-[#f8c33c] px-2 py-0.5 rounded border border-[#1d1b18]">
                          {c.caseId}
                        </span>
                        <span className="text-[10px] font-brand font-bold uppercase text-[#6e665b]">
                          {c.category}
                        </span>
                        <span className="text-[10px] font-bold text-[#6e665b]">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-brand font-bold text-sm text-[#1d1b18] truncate">
                        "{c.originalClaim}"
                      </h4>
                    </div>

                    <div className="shrink-0">
                      {getVerdictBadge(c.verdict?.verdict)}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t-2 border-[#1d1b18] flex items-center justify-between text-xs font-bold text-[#6e665b]">
            <span>Empanelling powered by 6 autonomous agents</span>
            <Link to="/history" className="text-[#1d1b18] hover:underline font-brand font-black uppercase">
              Full Archive →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
