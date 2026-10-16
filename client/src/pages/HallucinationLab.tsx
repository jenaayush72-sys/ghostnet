import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Ghost, AlertTriangle, ArrowRight, Code2,
  CheckCircle2, XCircle, Loader2, Bug, Play, Terminal
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
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] relative dots">
        <div className="tag-sticker pink mb-3">SPECIAL INTERROGATION SUITE</div>
        <h1 className="font-brand font-black text-4xl sm:text-6xl text-[#1d1b18] uppercase leading-none">
          HALLUCINATION INJECTION LAB.
        </h1>
        <p className="text-sm font-semibold text-[#6e665b] mt-2 max-w-2xl">
          Submit tricky AI code outputs, edge fallacies, or inverted specifications. The Ghost Agent will synthesize an adversarial counter-thesis to stress test the courtroom's fact-checking rigor.
        </p>
      </div>

      {/* Mandatory Adversarial Warning Banner */}
      <div className="p-4 rounded-[18px] bg-[#f47a22] text-[#fff] border-[2.5px] border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 shrink-0 text-[#fff]" />
        <div>
          <span className="font-brand font-black text-base uppercase tracking-wider block leading-tight">
            ADVERSARIAL TEST ARGUMENT — NOT VERIFIED FACT
          </span>
          <p className="text-xs font-semibold opacity-90 mt-0.5">
            Arguments inside this suite are intentionally engineered with hidden logical traps and edge fallacies.
          </p>
        </div>
      </div>

      {/* Preset Selector Grid */}
      <div className="space-y-4">
        <h3 className="font-brand font-black text-2xl text-[#1d1b18] uppercase">
          1. Select Known Fallacy Preset
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_HALLUCINATIONS.map((preset, idx) => {
            const isSelected = selectedPreset === idx;
            const colors = ['bg-[#56b29e]', 'bg-[#f8c33c]', 'bg-[#f28cbf]'];
            const activeColor = colors[idx % colors.length];

            return (
              <button
                key={preset.title}
                type="button"
                onClick={() => setSelectedPreset(idx)}
                className={`p-5 rounded-[20px] border-[2.5px] border-[#1d1b18] text-left transition-all ${
                  isSelected
                    ? `${activeColor} shadow-[3px_3px_0px_#1d1b18] scale-[1.02] ring-2 ring-[#1d1b18]`
                    : 'bg-[#f8eedc] hover:bg-[#eae0cd] shadow-[2px_2px_0px_#1d1b18]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-brand font-black text-xl text-[#1d1b18]">0{idx + 1}</span>
                  <span className="text-[10px] font-brand font-black uppercase px-2 py-0.5 rounded-full bg-[#1d1b18] text-[#f8eedc]">
                    PRESET
                  </span>
                </div>
                <h4 className="font-brand font-black text-xl text-[#1d1b18] leading-tight uppercase">
                  {preset.title}
                </h4>
                <p className="text-xs font-semibold text-[#1d1b18]/80 mt-1">
                  {preset.type}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Preset Interrogation Panel */}
      <div className="p-6 sm:p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-6">
        <div>
          <span className="tag-sticker yellow mb-2">ACTIVE CODE INTERROGATION</span>
          <h3 className="font-brand font-black text-3xl text-[#1d1b18] uppercase mt-2">
            "{activePreset.title}"
          </h3>
          <p className="text-sm font-semibold text-[#3a352e] mt-1.5 leading-relaxed bg-[#f1e4cf] p-4 rounded-[14px] border-2 border-[#1d1b18]">
            <b className="uppercase text-[#1d1b18]">Claim on Trial: </b>
            {activePreset.claim}
          </p>
        </div>

        <div>
          <label className="block font-brand font-black text-xs uppercase text-[#1d1b18] mb-1.5 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>Target Code Snippet</span>
          </label>
          <pre className="p-4 rounded-[14px] bg-[#1d1b18] text-[#f8eedc] border-2 border-[#1d1b18] text-xs font-mono-code overflow-x-auto leading-relaxed">
            {activePreset.codeSnippet}
          </pre>
        </div>

        <div className="p-4 rounded-[14px] bg-[#f1e4cf] border-2 border-[#1d1b18] text-xs font-semibold text-[#3a352e]">
          <b className="uppercase text-[#1d1b18] block mb-1">Proposed Falsification Test:</b>
          {activePreset.proposedTest}
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={() => handleLaunchTrial(activePreset.claim, activePreset.codeSnippet)}
            disabled={isSubmitting}
            className="btn arrow font-brand text-sm font-black disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#1d1b18]" />
                <span>EMPANELLING LAB TRIAL...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-[#1d1b18]" />
                <span>EMPANEL LAB TRIAL NOW</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
