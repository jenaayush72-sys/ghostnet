import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale, ShieldAlert, Code2, Newspaper, HelpCircle, Compass,
  ArrowRight, Loader2, Link2, AlertCircle, FileText
} from 'lucide-react';
import { api } from '../services/api';
import { Category } from '../types';

export const NewInvestigation: React.FC = () => {
  const navigate = useNavigate();

  const [claim, setClaim] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('general');
  const [context, setContext] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: { id: Category; label: string; icon: React.ElementType; description: string }[] = [
    {
      id: 'general',
      label: 'Factual Claim',
      icon: HelpCircle,
      description: 'Historical, scientific, or factual assertion'
    },
    {
      id: 'programming',
      label: 'Code / Technical',
      icon: Code2,
      description: 'Language semantics, APIs, and frameworks'
    },
    {
      id: 'news',
      label: 'News & Current Event',
      icon: Newspaper,
      description: 'Recent reporting, policy, or current affairs'
    },
    {
      id: 'decision',
      label: 'Argument / Policy',
      icon: Compass,
      description: 'Decisions and complex propositions'
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono-code text-amber-400 uppercase tracking-wider mb-1">
          <Scale className="w-4 h-4" />
          <span>Filing of Indictment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-100 tracking-tight">
          Empanel a New Trial
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Submit any AI output, technical explanation, or disputed claim to the autonomous courtroom.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <h4 className="font-semibold">Validation Error</h4>
            <p className="text-xs text-rose-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-mono-code uppercase text-gray-400 mb-2">
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
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-amber-500/50 bg-[#161B24] ring-1 ring-amber-500/30'
                      : 'border-[#232A36] bg-[#10141B] hover:border-[#323C4D] text-gray-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-amber-400' : 'text-gray-500'}`} />
                  <h4 className={`text-sm font-semibold ${isSelected ? 'text-gray-100' : 'text-gray-300'}`}>
                    {cat.label}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                    {cat.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Claim Text Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono-code uppercase text-gray-400">
              2. Claim / AI Output to Put on Trial <span className="text-amber-400">*</span>
            </label>
            <span className={`text-xs font-mono-code ${claim.length > 2800 ? 'text-rose-400' : 'text-gray-400'}`}>
              {claim.length} / 3000 chars
            </span>
          </div>
          <textarea
            required
            rows={5}
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Paste the statement, generated response, or technical claim under trial here..."
            className="w-full px-4 py-3 rounded-xl bg-[#0B0E13] border border-[#232A36] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500 text-sm text-gray-100 placeholder-gray-500 font-sans transition-all leading-relaxed"
          />
        </div>

        {/* Optional Title */}
        <div>
          <label className="block text-xs font-mono-code uppercase text-gray-400 mb-2">
            3. Docket Title <span className="text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. JavaScript Event Loop Macrotask Execution Order"
            className="w-full px-4 py-2.5 rounded-xl bg-[#0B0E13] border border-[#232A36] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500 text-sm text-gray-100 placeholder-gray-500 font-sans transition-all"
          />
        </div>

        {/* Optional Context & Source URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono-code uppercase text-gray-400 mb-2">
              4. Additional Context <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Background conditions, prompt used to generate answer, or test environment details..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0E13] border border-[#232A36] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500 text-sm text-gray-100 placeholder-gray-500 font-sans transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-code uppercase text-gray-400 mb-2 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-gray-400" />
              <span>5. Reference / Source URL <span className="text-gray-500">(Optional)</span></span>
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0E13] border border-[#232A36] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500 text-sm text-gray-100 placeholder-gray-500 font-sans transition-all"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Provide an official documentation link if known. The Evidence Agent will verify it against the claim.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1C222C]">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 rounded-lg border border-[#232A36] hover:bg-[#151921] text-gray-300 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={claim.trim().length < 5 || isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/10 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Empanelling Courtroom...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Empanel Trial</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
