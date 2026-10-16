import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Scale, ShieldAlert, Code2, Newspaper, HelpCircle, Compass,
  ArrowRight, Loader2, Link2, AlertCircle, FileText, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Category } from '../types';

export const NewInvestigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialClaim = (location.state as any)?.claim || '';

  const [claim, setClaim] = useState(initialClaim);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('general');
  const [context, setContext] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: { id: Category; label: string; icon: React.ElementType; description: string; color: string }[] = [
    {
      id: 'general',
      label: 'Factual Claim',
      icon: HelpCircle,
      description: 'Historical, scientific, or factual assertion',
      color: 'bg-[#56b29e]'
    },
    {
      id: 'programming',
      label: 'Code / Technical',
      icon: Code2,
      description: 'Language semantics, APIs, and frameworks',
      color: 'bg-[#f8c33c]'
    },
    {
      id: 'news',
      label: 'News & Event',
      icon: Newspaper,
      description: 'Recent reporting, policy, or current affairs',
      color: 'bg-[#f47a22]'
    },
    {
      id: 'decision',
      label: 'Argument / Policy',
      icon: Compass,
      description: 'Complex reasoning and disputed propositions',
      color: 'bg-[#f28cbf]'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!claim.trim() || claim.trim().length < 5) {
      setError('Claim must be at least 5 characters long.');
      return;
    }

    if (claim.trim().length > 3000) {
      setError('Claim cannot exceed 3000 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await api.createInvestigation({
        claim: claim.trim(),
        title: title.trim(),
        category,
        context: context.trim(),
        sourceUrl: sourceUrl.trim()
      });

      navigate(`/courtroom/${result.caseId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to empanel investigation.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] relative dots">
        <div className="flex items-center gap-2 mb-3">
          <span className="tag-sticker yellow">SCREEN 1: INTAKE DESK</span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#56b29e] border border-[#1d1b18] text-[11px] font-brand font-black uppercase text-[#1d1b18]">
            FILING & ADMISSION
          </span>
        </div>
        <h1 className="font-brand font-black text-4xl sm:text-6xl text-[#1d1b18] uppercase leading-none">
          SUBMIT CLAIM & START INVESTIGATION.
        </h1>
        <p className="text-sm font-semibold text-[#6e665b] mt-2 max-w-2xl">
          Submit any generative response, technical code snippet, or disputed factual statement to empanel the autonomous multi-agent courtroom.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-[16px] bg-[#e5452f] text-white border-[2.5px] border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] text-sm font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Panel */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-6">
        {/* Category Selector */}
        <div>
          <label className="block font-brand font-black text-sm uppercase tracking-wider text-[#1d1b18] mb-2">
            1. Select Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-[16px] border-[2px] border-[#1d1b18] text-left transition-all ${
                    isSelected
                      ? `${cat.color} text-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] scale-[1.02]`
                      : 'bg-[#f1e4cf] text-[#3a352e] hover:bg-[#ebdcc4]'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-2 text-[#1d1b18]" />
                  <h4 className="font-brand font-black text-lg uppercase leading-tight text-[#1d1b18]">
                    {cat.label}
                  </h4>
                  <p className="text-[11px] font-semibold text-[#1d1b18]/80 mt-1 leading-snug">
                    {cat.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Claim Text Area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-brand font-black text-sm uppercase tracking-wider text-[#1d1b18]">
              2. Claim / AI Output to Put on Trial *
            </label>
            <span className="font-brand font-bold text-xs text-[#6e665b]">
              {claim.length} / 3000 chars
            </span>
          </div>
          <textarea
            required
            rows={5}
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Paste the statement, code explanation, or disputed premise here..."
            className="rift-input font-medium leading-relaxed"
          />
        </div>

        {/* Optional Title */}
        <div>
          <label className="block font-brand font-black text-sm uppercase tracking-wider text-[#1d1b18] mb-2">
            3. Docket Title <span className="text-[#6e665b] font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. JavaScript Event Loop Microtask Execution Order"
            className="rift-input"
          />
        </div>

        {/* Context & Source URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-brand font-black text-sm uppercase tracking-wider text-[#1d1b18] mb-2">
              4. Additional Context <span className="text-[#6e665b] font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Background conditions, prompt used, or specific testing environment..."
              className="rift-input"
            />
          </div>

          <div>
            <label className="block font-brand font-black text-sm uppercase tracking-wider text-[#1d1b18] mb-2 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#1d1b18]" />
              <span>5. Reference URL <span className="text-[#6e665b] font-normal">(Optional)</span></span>
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://docs.python.org/..."
              className="rift-input"
            />
            <p className="text-[11px] font-semibold text-[#6e665b] mt-1.5">
              The Evidence Agent will crawl and verify this URL against the indicted statement.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-[#1d1b18]">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn ghost font-brand font-black border-2 border-[#1d1b18]"
          >
            CANCEL
          </button>

          <button
            type="submit"
            disabled={claim.trim().length < 5 || isSubmitting}
            className="btn arrow font-brand text-sm font-black disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#1d1b18]" />
                <span>EMPANELLING COURTROOM...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-[#1d1b18]" />
                <span>EMPANEL TRIAL</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
