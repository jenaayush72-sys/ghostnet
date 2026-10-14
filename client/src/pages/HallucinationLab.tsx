import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Ghost, AlertTriangle, ArrowRight, Code2,
  CheckCircle2, XCircle, Loader2, Bug, Play
} from 'lucide-react';
import { api } from '../services/api';

const PRESET_HALLUCINATIONS = [
  {
    title: 'Python Global Interpreter Lock (GIL)',
    claim: 'Python multithreading with standard threading.Thread speeds up CPU-intensive numerical matrix multiplication on multi-core processors.',
    type: 'Concurrency & CPython Runtimes',
    codeSnippet: `import threading

def compute_heavy_matrix(matrix):
    # CPU-bound matrix crunching
    return sum(x * 2 for x in matrix)

# Flawed assumption: Spawning 4 threads bypasses GIL for CPU-bound task
threads = [threading.Thread(target=compute_heavy_matrix, args=([i]*1000000,)) for i in range(4)]
for t in threads: t.start()
for t in threads: t.join()`,
    proposedTest: 'Assert wall-clock execution time of 4 CPython threads on CPU-bound workload does not exceed single-thread baseline execution (Expected: Fails due to GIL contention).'
  },
  {
    title: 'JavaScript Asynchronous Array.prototype.forEach',
    claim: 'In JavaScript, using async/await inside an Array.prototype.forEach callback ensures each iteration completes sequentially in order before code after forEach runs.',
    type: 'ECMAScript Event Loop & Promises',
    codeSnippet: `async function processItems(items) {
  // Common hallucination: forEach waits for async callbacks
  items.forEach(async (item) => {
    await fetchItemDetails(item);
  });
  console.log("All items finished"); // Executes prematurely!
}`,
    proposedTest: 'Verify that "All items finished" is logged only after all fetchItemDetails promises settle (Expected: Fails; forEach ignores returned promises).'
  },
  {
    title: 'Linux Kernel Space Memory Access',
    claim: 'User-space applications can directly read physical kernel ring buffer memory addresses via pointer dereferencing in modern protected virtual memory architectures.',
    type: 'Operating Systems & MMU Security',
    codeSnippet: `int *kernel_ptr = (int *)0xFFFF800000000000;
// Attempting direct pointer read from user space
int val = *kernel_ptr;`,
    proposedTest: 'Execute user-space dereference of higher-half kernel virtual address (Expected: SIGSEGV / General Protection Fault by hardware MMU).'
  }
];

export const HallucinationLab: React.FC = () => {
  const navigate = useNavigate();

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customClaim, setCustomClaim] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePreset = PRESET_HALLUCINATIONS[selectedPreset];

  const handleLaunchTrial = async (claimToTest: string, codeContext?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await api.createInvestigation({
        claim: claimToTest,
        category: 'programming',
        context: codeContext ? `Code snippet under interrogation:\n${codeContext}` : undefined
      });
      navigate(`/courtroom/${res.caseId}`);
    } catch (err: any) {
      alert(`Failed to launch lab trial: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono-code text-amber-400 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Special Interrogation Suite</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-100 tracking-tight">
          Hallucination Injection Lab
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl leading-relaxed">
          Submit tricky AI outputs, flawed code snippets, or architectural fallacies.
          The Ghost Agent will construct a deliberately deceptive counter-perspective to determine if the courtroom can isolate the subtle hallucination through primary evidence.
        </p>
      </div>

      {/* Mandatory Adversarial Warning Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-code flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold tracking-wide">ADVERSARIAL TEST ARGUMENT — NOT VERIFIED FACT</span>
          <p className="text-[11px] text-amber-300/80 mt-0.5 font-sans">
            Arguments generated inside this laboratory are intentionally engineered with hidden logical fallacies, edge-case traps, and inverted specifications to test verification resilience.
          </p>
        </div>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_HALLUCINATIONS.map((preset, idx) => (
          <button
            key={preset.title}
            onClick={() => setSelectedPreset(idx)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedPreset === idx
                ? 'border-amber-500 bg-[#161B24] ring-1 ring-amber-500/40'
                : 'border-[#232A36] bg-[#10141B] hover:border-[#323C4D] text-gray-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono-code px-2 py-0.5 rounded bg-[#1C222C] text-amber-400 border border-amber-500/20">
                Preset {idx + 1}
              </span>
              <Bug className="w-4 h-4 text-gray-500" />
            </div>
            <h4 className="text-sm font-semibold text-gray-200">{preset.title}</h4>
            <p className="text-xs text-gray-500 mt-1">{preset.type}</p>
          </button>
        ))}
      </div>

      {/* Active Scenario Inspector */}
      <div className="rounded-2xl border border-[#232A36] bg-[#10141B] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2532]">
          <div>
            <span className="text-xs font-mono-code text-gray-400 uppercase">
              Hallucination Scenario
            </span>
            <h3 className="text-xl font-bold text-gray-100 mt-0.5">
              {activePreset.title}
            </h3>
          </div>

          <button
            onClick={() => handleLaunchTrial(activePreset.claim, activePreset.codeSnippet)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-bold text-xs uppercase tracking-wider font-mono-code transition-all shadow-md shadow-amber-500/10"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Dispatching Trial...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-gray-950" />
                <span>Put Flawed Claim on Trial</span>
              </>
            )}
          </button>
        </div>

        {/* Claim Under Trial */}
        <div>
          <h4 className="text-xs uppercase font-mono-code text-gray-400 mb-1.5">
            1. Deceptive / Flawed Assertion:
          </h4>
          <p className="text-sm text-gray-200 font-medium bg-[#0B0E13] p-4 rounded-xl border border-[#232A36] leading-relaxed">
            "{activePreset.claim}"
          </p>
        </div>

        {/* Code Snippet Under Analysis */}
        <div>
          <h4 className="text-xs uppercase font-mono-code text-gray-400 mb-1.5 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>2. Code Snippet Subject to Cross-Examination:</span>
          </h4>
          <pre className="p-4 rounded-xl bg-[#07090C] border border-[#232A36] text-xs font-mono-code text-amber-300/90 overflow-x-auto leading-relaxed">
            {activePreset.codeSnippet}
          </pre>
        </div>

        {/* Proposed Test Specification */}
        <div className="p-4 rounded-xl bg-[#12161E] border border-[#273243]">
          <h4 className="text-xs font-mono-code uppercase text-emerald-400 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Proposed Evidentiary Sandbox Test Specification:</span>
          </h4>
          <p className="text-xs text-gray-300 font-mono-code">
            {activePreset.proposedTest}
          </p>
        </div>
      </div>

      {/* Custom Hallucination Injection Section */}
      <div className="rounded-2xl border border-[#232A36] bg-[#10141B] p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-100 font-mono-code flex items-center gap-2">
          <Ghost className="w-5 h-5 text-amber-400" />
          Inject Custom Code or Explanation
        </h3>
        <p className="text-xs text-gray-400">
          Want to test an answer an LLM gave you? Paste the claim and optional snippet below:
        </p>

        <div className="space-y-3">
          <input
            type="text"
            value={customClaim}
            onChange={(e) => setCustomClaim(e.target.value)}
            placeholder="Enter the AI statement or claim to test..."
            className="w-full px-4 py-2.5 rounded-xl bg-[#090B0E] border border-[#232A36] focus:border-amber-500 text-xs text-gray-100 placeholder-gray-500"
          />

          <textarea
            rows={3}
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="Optional code snippet or context..."
            className="w-full px-4 py-2.5 rounded-xl bg-[#090B0E] border border-[#232A36] focus:border-amber-500 text-xs text-gray-100 font-mono-code placeholder-gray-500"
          />

          <button
            onClick={() => handleLaunchTrial(customClaim, customCode)}
            disabled={customClaim.trim().length < 5 || isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-gray-950 font-bold text-xs uppercase font-mono-code tracking-wider flex items-center gap-1.5"
          >
            <span>Launch Adversarial Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
