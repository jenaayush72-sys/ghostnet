import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scale, ShieldAlert, ArrowRight, Gavel, Search, CheckCircle2,
  FileCheck, ShieldX, ShieldCheck, Ghost, BookOpen, AlertTriangle, Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const agents = [
    {
      name: 'Ghost Agent',
      role: 'Adversarial Flaw Injector',
      description: 'Generates subtly flawed arguments and hidden premise traps to rigorously stress-test the submitted claim.',
      icon: Ghost,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    },
    {
      name: 'Prosecutor Agent',
      role: 'Inaccuracy & Fallacy Prosecutor',
      description: 'Challenges false premises, unsupported assumptions, causal leaps, and demands documentary proof.',
      icon: ShieldX,
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
    },
    {
      name: 'Defense Agent',
      role: 'Contextual Nuance Defense',
      description: 'Tests prosecution strength, introduces legitimate operational caveats, and clarifies edge conditions.',
      icon: ShieldCheck,
      color: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
    },
    {
      name: 'Evidence Agent',
      role: 'Normative Source Harvester',
      description: 'Indexes genuine specifications, official documentation, and primary sources without fabrication.',
      icon: Search,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      name: 'Fact-Checker Agent',
      role: 'Independent Evidence Auditor',
      description: 'Validates claim-level excerpts against indexed citations to stop hallucinated consensus.',
      icon: FileCheck,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
    },
    {
      name: 'Judge Agent',
      role: 'Supreme Judicial Adjudicator',
      description: 'Weighs evidence priority over agent agreement to issue binding, explainable verdicts.',
      icon: Gavel,
      color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
    }
  ];

  const stages = [
    { num: '01', title: 'Case Empanelling', desc: 'Claim registered with atomic query decomposition.' },
    { num: '02', title: 'Ghost Formulation', desc: 'Deliberate adversarial flawed argument constructed.' },
    { num: '03', title: 'Evidence Harvest', desc: 'Primary sources, specs & encyclopedia entries retrieved.' },
    { num: '04', title: 'Prosecution', desc: 'Formal objections filed against unverified assertions.' },
    { num: '05', title: 'Defense Cross-Exam', desc: 'Boundary conditions and counterarguments clarified.' },
    { num: '06', title: 'Fact-Checker Audit', desc: 'Excerpts audited against primary citations.' },
    { num: '07', title: 'Supreme Verdict', desc: 'Binding explainable verdict rendered with evidence links.' }
  ];

  return (
    <div className="min-h-screen bg-[#090B0E] text-gray-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#1C222C]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.08),rgba(255,255,255,0))]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151921] border border-[#272E3D] text-xs font-mono-code text-amber-400 mb-8 shadow-sm">
            <Scale className="w-3.5 h-3.5" />
            <span>Don't Trust the Answer. Put It on Trial.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Every Claim <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">Has a Case.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Challenge AI answers, expose flawed reasoning, and investigate the evidence through an interactive multi-agent courtroom.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/investigate"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-base transition-all shadow-lg shadow-amber-500/10 active:scale-95"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>Start Investigation</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/courtroom/CASE-DEMO-01"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#151921] hover:bg-[#1E2430] text-gray-200 border border-[#2B3545] font-semibold text-base transition-all"
            >
              <Gavel className="w-5 h-5 text-amber-400" />
              <span>Explore Demo Case</span>
            </Link>
          </div>

          {/* Core Principle Callout */}
          <div className="mt-14 max-w-2xl mx-auto p-4 rounded-xl bg-[#11151D] border border-[#232A36] text-xs text-gray-400 font-mono-code flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>CORE PRINCIPLE: Evidence must take priority over agent agreement.</span>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[#1C222C] bg-[#0C0F14]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-widest font-mono-code text-amber-400 mb-2">
              The Seven-Stage Evidentiary Process
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-100">
              How GhostNet Conducts a Trial
            </h3>
            <p className="text-sm text-gray-400 mt-2">
              Unlike chatbots that generate unverified opinions in a black box, GhostNet enforces a deterministic judicial trial.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {stages.map((stg) => (
              <div
                key={stg.num}
                className="rounded-xl border border-[#232A36] bg-[#12161E] p-4 flex flex-col justify-between hover:border-[#323C4D] transition-colors"
              >
                <div>
                  <span className="font-mono-code text-xs text-amber-400 font-bold block mb-2">
                    {stg.num}
                  </span>
                  <h4 className="text-sm font-semibold text-gray-200 mb-1">
                    {stg.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-snug">
                    {stg.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 6 AI Agents */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[#1C222C]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-widest font-mono-code text-amber-400 mb-2">
              Autonomous Courtroom Emissaries
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-100">
              Six Specialized AI Agents
            </h3>
            <p className="text-sm text-gray-400 mt-2">
              No single model decides truth alone. Each agent has an adversarial or judicial duty governed by strict evidentiary rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.name}
                  className="rounded-xl border border-[#232A36] bg-[#12161E] p-6 hover:border-[#333E52] transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${agent.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-100 font-mono-code">
                        {agent.name}
                      </h4>
                      <p className="text-xs text-gray-400">{agent.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    {agent.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Example Interactive Verdict Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[#1C222C] bg-[#0C0F14]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-wider font-mono-code text-amber-400">
              Precedent Spotlight
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-100 mt-1">
              Sample Case Proceeding
            </h3>
          </div>

          <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2C3444]">
              <div>
                <span className="text-xs font-mono-code text-gray-400">CASE-DEMO-01 • PROGRAMMING</span>
                <h4 className="text-lg font-bold text-gray-100 mt-1">
                  "In JavaScript, setTimeout(fn, 0) executes immediately before any other code in the call stack runs."
                </h4>
              </div>
              <span className="px-3.5 py-1.5 rounded-lg border text-sm font-bold font-mono-code bg-rose-500/20 text-rose-300 border-rose-500/30 self-start sm:self-auto">
                VERDICT: FALSE
              </span>
            </div>

            <p className="text-sm text-gray-300 mt-4 leading-relaxed">
              WHATWG and MDN specifications decisively prove that <code className="text-amber-300 font-mono-code">setTimeout</code> schedules a callback on the macrotask queue. Queued macrotasks can never preempt synchronous frames running on the active execution stack.
            </p>

            <div className="mt-5 pt-4 border-t border-[#232A36] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Cited Evidence: MDN Event Loop Docs & WHATWG HTML Living Standard</span>
              </div>
              <Link
                to="/courtroom/CASE-DEMO-01"
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 font-mono-code"
              >
                Inspect Trial Docket <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 mt-auto border-t border-[#1C222C] text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono-code">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="text-gray-300 font-bold">GHOSTNET</span>
            <span>— The AI Courtroom</span>
          </div>
          <p className="text-center sm:text-right">
            Deterministic Multi-Agent Verification Platform. Evidence Over Agreement.
          </p>
        </div>
      </footer>
    </div>
  );
};
