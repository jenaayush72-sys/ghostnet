import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale, ShieldAlert, ArrowRight, Gavel, Search, CheckCircle2,
  FileCheck, ShieldX, ShieldCheck, Ghost, BookOpen, AlertTriangle, Sparkles,
  Zap, Compass, HelpCircle, Code2, ExternalLink
} from 'lucide-react';
import { useInView } from '../hooks/useInView';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [quickClaim, setQuickClaim] = useState('');

  // Scroll Reveal Hooks
  const chipsSection = useInView({ threshold: 0.1 });
  const howSection = useInView({ threshold: 0.1 });
  const agentsSection = useInView({ threshold: 0.1 });
  const ctaSection = useInView({ threshold: 0.1 });

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickClaim.trim().length >= 5) {
      navigate('/investigate', { state: { claim: quickClaim.trim() } });
    }
  };

  const agents = [
    {
      name: 'Ghost Agent',
      role: 'Adversarial Flaw Injector',
      description: 'Formulates deliberately deceptive counter-theses and trap questions to test factual resilience.',
      color: 'teal',
      badge: 'PROBE',
      icon: Ghost
    },
    {
      name: 'Prosecutor Agent',
      role: 'Inaccuracy Prosecutor',
      description: 'Files formal objections against unsupported assumptions, logical leaps, and hallucinations.',
      color: 'orange',
      badge: 'OBJECTION',
      icon: ShieldX
    },
    {
      name: 'Defense Agent',
      role: 'Nuance & Context Advocate',
      description: 'Defends operational validity, introduces necessary edge caveats, and clarifies scope.',
      color: 'blue',
      badge: 'DEFEND',
      icon: ShieldCheck
    },
    {
      name: 'Evidence Agent',
      role: 'Normative Source Harvester',
      description: 'Indexes genuine technical specs, encyclopedia entries, and documentation without fabrication.',
      color: 'sky',
      badge: 'EVIDENCE',
      icon: Search
    },
    {
      name: 'Fact-Checker Agent',
      role: 'Independent Citation Auditor',
      description: 'Cross-examines claim excerpts directly against primary source text to stop hallucination bias.',
      color: 'pink',
      badge: 'AUDIT',
      icon: FileCheck
    },
    {
      name: 'Judge Agent',
      role: 'Supreme Judicial Adjudicator',
      description: 'Weighs evidence priority over agent consensus to deliver explainable, binding verdicts.',
      color: 'yellow',
      badge: 'VERDICT',
      icon: Gavel
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-14 relative">
      {/* 0. SUBTLE AMBIENT LIGHTING (Imperceptible, organic warmth) */}
      <div className="ambient-hero-glow" aria-hidden="true" />

      {/* 1. HERO BENTO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 relative z-10">
        {/* Main Hero Panel (Fade in + 20px rise, coordinated timeline) */}
        <div className="lg:col-span-8 relative flex flex-col justify-end p-6 sm:p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] overflow-hidden dots motion-panel-hero">
          {/* Animated Courtroom Seal (Outer ring rotates slowly; text stays crystal clear & legible) */}
          <div className="absolute right-4 sm:right-8 top-4 seal" aria-hidden="true">
            <svg viewBox="0 0 200 200" className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible">
              <defs>
                <path id="seal-t" d="M32,100 A68,68 0 0 1 168,100" />
                <path id="seal-b" d="M16,100 A84,84 0 0 0 184,100" />
              </defs>
              {/* Outer Base Disc */}
              <circle cx="100" cy="100" r="94" fill="#56b29e" stroke="#1d1b18" strokeWidth="4" />

              {/* Decorative dashed outer orbit ring - rotates smoothly */}
              <circle
                cx="100"
                cy="100"
                r="86"
                fill="none"
                stroke="#1d1b18"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                className="seal-outer-ring"
              />

              {/* Inner Disc with organic breath animation */}
              <circle cx="100" cy="100" r="44" fill="#f8c33c" stroke="#1d1b18" strokeWidth="3" />

              {/* High-legibility Non-rotating curved typography */}
              <text fill="#1d1b18" className="font-brand font-black text-[18px] tracking-wider uppercase select-none">
                <textPath href="#seal-t" startOffset="50%" textAnchor="middle">AI COURTROOM</textPath>
              </text>
              <text fill="#1d1b18" className="font-brand font-black text-[18px] tracking-wider uppercase select-none">
                <textPath href="#seal-b" startOffset="50%" textAnchor="middle">FREE TRIAL</textPath>
              </text>

              {/* Central Scale icon */}
              <g transform="translate(82, 82)" className="seal-core-scale">
                <Scale className="w-9 h-9 text-[#1d1b18]" />
              </g>
            </svg>
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f8c33c] border-2 border-[#1d1b18] text-xs font-brand font-black tracking-wider uppercase mb-4 w-fit motion-fade-up"
            style={{ animationDelay: '0.08s' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1d1b18]" />
            <span>Autonomous Intelligence & Evidence</span>
          </div>

          {/* Sophisticated Word-Level Staggered Heading */}
          <h1 className="font-brand font-black text-5xl sm:text-7xl lg:text-8xl leading-[0.88] tracking-tight text-[#1d1b18] uppercase">
            <span className="block overflow-hidden pb-1">
              <span className="motion-word" style={{ animationDelay: '0.08s' }}>PUT&nbsp;</span>
              <span className="motion-word" style={{ animationDelay: '0.18s' }}>AI&nbsp;</span>
              <span className="motion-word" style={{ animationDelay: '0.28s' }}>ANSWERS</span>
            </span>
            <span className="block overflow-hidden pt-1">
              <span className="text-[#e5452f] motion-underline">
                <span className="motion-word" style={{ animationDelay: '0.42s' }}>ON&nbsp;</span>
                <span className="motion-word" style={{ animationDelay: '0.50s' }}>TRIAL.</span>
              </span>
            </span>
          </h1>

          {/* Subheading / Body Text with graceful fade up */}
          <p
            className="mt-4 text-base sm:text-lg text-[#3a352e] font-medium max-w-xl leading-snug motion-fade-up"
            style={{ animationDelay: '0.62s' }}
          >
            Don't trust hallucinated LLM consensus. Challenge answers, cross-examine evidence, and render explainable verdicts through multi-agent adversarial courtrooms.
          </p>
        </div>

        {/* Right-Side Challenge Panel (Horizontal entrance transition) */}
        <div className="lg:col-span-4 flex flex-col justify-between p-6 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] motion-panel-side">
          <div>
            {/* Word emphasis sequence for key phrase */}
            <div className="flex flex-wrap gap-1.5 font-brand font-black text-xl tracking-tight text-[#1d1b18] uppercase pb-3 border-b-2 border-[#1d1b18]">
              <span className="motion-emphasis-1">CHALLENGE.</span>
              <span className="text-[#f47a22] motion-emphasis-2">CROSS-EXAMINE.</span>
              <span className="text-[#56b29e] motion-emphasis-3">RULE.</span>
            </div>
            <p className="text-xs sm:text-sm text-[#3a352e] mt-3 leading-relaxed">
              Paste any disputed assertion, technical output, or generated claim. The courtroom empanels instantly.
            </p>
          </div>

          <form onSubmit={handleQuickSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              value={quickClaim}
              onChange={(e) => setQuickClaim(e.target.value)}
              placeholder="e.g. The Eiffel Tower expands 15cm..."
              className="rift-input text-xs"
              aria-label="Claim to empanel"
            />
            <button
              type="submit"
              className="btn w-full arrow font-brand text-sm font-black group transition-transform duration-180 hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <span>EMPANEL FREE TRIAL</span>
            </button>
          </form>

          <p className="text-[11px] text-[#6e665b] mt-3">
            Core principle: <b>Evidence takes priority over agent agreement.</b>
          </p>
        </div>

        {/* Large Illustrated Interactive Banner (Teal) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-[22px] bg-[#56b29e] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] hover:shadow-[5px_5px_0px_#1d1b18] hover:-translate-y-0.5 transition-all duration-220 relative overflow-hidden dots motion-panel-feature group">
          {/* Stickers with subtle hover micro-reactions */}
          <div className="sticker burst tilt-l top-4 left-4 group-hover:rotate-[-6deg] transition-transform duration-200" aria-hidden="true">
            <span>POW!<br /><span className="text-[11px]">VERIFY</span></span>
          </div>
          <div className="sticker tag-sticker orange tilt-r bottom-4 left-4 group-hover:rotate-[4deg] transition-transform duration-200">
            NO HALLUCINATIONS!
          </div>

          <div className="max-w-md ml-auto text-right">
            <span className="font-brand font-black text-xs uppercase px-2 py-0.5 rounded bg-[#f8eedc] border border-[#1d1b18] inline-block transition-transform duration-200 group-hover:scale-105">
              Live Courtroom Engine
            </span>
            <h2 className="font-brand font-black text-3xl sm:text-5xl text-[#1d1b18] uppercase leading-tight mt-2">
              REAL-TIME ADVERSARIAL DELIBERATION
            </h2>
            <p className="text-sm font-semibold text-[#1d1b18] mt-2">
              Watch Prosecutor, Defense, and Fact-Checker agents debate each premise line by line with verifiable citations.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <Link
                to="/courtroom/CASE-DEMO-01"
                className="btn sm orange font-brand tracking-wider font-black group-hover:shadow-[2px_2px_0px_#1d1b18] transition-all"
              >
                EXPLORE DEMO TRIAL →
              </Link>
            </div>
          </div>
        </div>

        {/* Side Bento Feature (Yellow + Pink) */}
        <div className="lg:col-span-4 grid grid-rows-2 gap-4">
          {/* Past Dockets Card */}
          <Link
            to="/history"
            className="p-5 rounded-[22px] bg-[#f8c33c] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] hover:shadow-[5px_5px_0px_#1d1b18] hover:bg-[#ebd039] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group motion-panel-dockets"
          >
            <div>
              <span className="font-brand font-black text-3xl text-[#1d1b18] uppercase block leading-none">
                PAST DOCKETS
              </span>
              <span className="text-xs font-bold text-[#1d1b18] uppercase mt-1 block">
                Browse verified case archives
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1d1b18] text-[#f8eedc] flex items-center justify-center transition-transform duration-200 group-hover:rotate-12 group-hover:scale-105">
              <BookOpen className="w-5 h-5 text-[#f8c33c]" />
            </div>
          </Link>

          {/* Ghost Lab Card */}
          <Link
            to="/lab"
            className="p-5 rounded-[22px] bg-[#f28cbf] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] hover:shadow-[5px_5px_0px_#1d1b18] hover:bg-[#eb74ad] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group motion-panel-lab"
          >
            <div>
              <span className="font-brand font-black text-3xl text-[#1d1b18] uppercase block leading-none">
                GHOST LAB
              </span>
              <span className="text-xs font-bold text-[#1d1b18] uppercase mt-1 block">
                Test code & sneaky fallacies
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1d1b18] text-[#f8eedc] flex items-center justify-center transition-transform duration-200 group-hover:rotate-[-12deg] group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-[#f28cbf]" />
            </div>
          </Link>
        </div>
      </section>

      {/* 2. CHIPS ROW (Scroll-Triggered Stagger Reveal) */}
      <section
        ref={chipsSection.ref}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div
          className={`scroll-reveal stagger-1 flex items-center gap-3.5 p-4 rounded-[18px] bg-[#f47a22] border-[2.5px] border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] hover:shadow-[4px_4px_0px_#1d1b18] hover:-translate-y-0.5 transition-all duration-200 text-[#1d1b18] group ${
            chipsSection.isInView ? 'is-revealed' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#1d1b18] text-[#fff] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
            <Scale className="w-5 h-5 text-[#f8c33c]" />
          </div>
          <div>
            <b className="font-brand font-black text-lg uppercase block leading-none">6 AGENTS</b>
            <span className="text-xs font-bold uppercase">Autonomous Chamber</span>
          </div>
        </div>

        <div
          className={`scroll-reveal stagger-2 flex items-center gap-3.5 p-4 rounded-[18px] bg-[#7a8fd8] border-[2.5px] border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] hover:shadow-[4px_4px_0px_#1d1b18] hover:-translate-y-0.5 transition-all duration-200 text-[#1d1b18] group ${
            chipsSection.isInView ? 'is-revealed' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#1d1b18] text-[#fff] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
            <Search className="w-5 h-5 text-[#7a8fd8]" />
          </div>
          <div>
            <b className="font-brand font-black text-lg uppercase block leading-none">EVIDENCE FIRST</b>
            <span className="text-xs font-bold uppercase">Citations Over Bias</span>
          </div>
        </div>

        <div
          className={`scroll-reveal stagger-3 flex items-center gap-3.5 p-4 rounded-[18px] bg-[#f28cbf] border-[2.5px] border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] hover:shadow-[4px_4px_0px_#1d1b18] hover:-translate-y-0.5 transition-all duration-200 text-[#1d1b18] group ${
            chipsSection.isInView ? 'is-revealed' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#1d1b18] text-[#fff] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
            <FileCheck className="w-5 h-5 text-[#f28cbf]" />
          </div>
          <div>
            <b className="font-brand font-black text-lg uppercase block leading-none">AUDITED FACTS</b>
            <span className="text-xs font-bold uppercase">Primary Source Docs</span>
          </div>
        </div>

        <div
          className={`scroll-reveal stagger-4 flex items-center gap-3.5 p-4 rounded-[18px] bg-[#f8c33c] border-[2.5px] border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] hover:shadow-[4px_4px_0px_#1d1b18] hover:-translate-y-0.5 transition-all duration-200 text-[#1d1b18] group ${
            chipsSection.isInView ? 'is-revealed' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#1d1b18] text-[#fff] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
            <Gavel className="w-5 h-5 text-[#f8c33c]" />
          </div>
          <div>
            <b className="font-brand font-black text-lg uppercase block leading-none">EXPLAINABLE</b>
            <span className="text-xs font-bold uppercase">Judicial Verdicts</span>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Scroll-Triggered 3 Bento Steps) */}
      <section
        ref={howSection.ref}
        className="space-y-6"
      >
        <div
          className={`scroll-reveal flex flex-wrap items-end justify-between gap-4 ${
            howSection.isInView ? 'is-revealed' : ''
          }`}
        >
          <div>
            <div className="tag-sticker yellow mb-2">3 STEPS. THAT'S IT.</div>
            <h2 className="font-brand font-black text-4xl sm:text-6xl text-[#1d1b18] uppercase leading-none">
              HOW IT WORKS.
            </h2>
          </div>
          <p className="text-sm font-semibold text-[#6e665b] max-w-md">
            Every investigation follows an adversarial court procedure to verify empirical truth without compromise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 01 */}
          <div
            className={`scroll-reveal stagger-1 p-6 rounded-[22px] bg-[#56b29e] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] hover:shadow-[5px_5px_0px_#1d1b18] hover:-translate-y-0.5 transition-all duration-200 relative dots flex flex-col justify-between min-h-[220px] group ${
              howSection.isInView ? 'is-revealed' : ''
            }`}
          >
            <span className="font-brand font-black text-5xl text-[#1d1b18] transition-transform duration-200 group-hover:translate-x-1">
              01
            </span>
            <div>
              <h3 className="font-brand font-black text-2xl text-[#1d1b18] uppercase mt-4 pt-3 border-t-2 border-[#1d1b18]">
                Empanel The Claim
              </h3>
              <p className="text-xs font-semibold text-[#1d1b18] mt-1 leading-relaxed">
                Submit an AI response, technical explanation, or factual claim under suspicion.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div
            className={`scroll-reveal stagger-2 p-6 rounded-[22px] bg-[#f8c33c] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] hover:shadow-[5px_5px_0px_#1d1b18] hover:-translate-y-0.5 transition-all duration-200 relative dots flex flex-col justify-between min-h-[220px] group ${
              howSection.isInView ? 'is-revealed' : ''
            }`}
          >
            <span className="font-brand font-black text-5xl text-[#1d1b18] transition-transform duration-200 group-hover:translate-x-1">
              02
            </span>
            <div>
              <h3 className="font-brand font-black text-2xl text-[#1d1b18] uppercase mt-4 pt-3 border-t-2 border-[#1d1b18]">
                Harvest Citations
              </h3>
              <p className="text-xs font-semibold text-[#1d1b18] mt-1 leading-relaxed">
                The Evidence Agent scours primary documentation, verified specs, and official corpora.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div
            className={`scroll-reveal stagger-3 p-6 rounded-[22px] bg-[#f28cbf] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] hover:shadow-[5px_5px_0px_#1d1b18] hover:-translate-y-0.5 transition-all duration-200 relative dots flex flex-col justify-between min-h-[220px] group ${
              howSection.isInView ? 'is-revealed' : ''
            }`}
          >
            <span className="font-brand font-black text-5xl text-[#1d1b18] transition-transform duration-200 group-hover:translate-x-1">
              03
            </span>
            <div>
              <h3 className="font-brand font-black text-2xl text-[#1d1b18] uppercase mt-4 pt-3 border-t-2 border-[#1d1b18]">
                Judicial Verdict
              </h3>
              <p className="text-xs font-semibold text-[#1d1b18] mt-1 leading-relaxed">
                Prosecution and Defense clash before the Judge renders an explainable, binding ruling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEET THE 6 AGENTS (Scroll-Triggered Bento Grid) */}
      <section
        ref={agentsSection.ref}
        className="space-y-6"
      >
        <div
          className={`scroll-reveal flex flex-wrap items-end justify-between gap-4 ${
            agentsSection.isInView ? 'is-revealed' : ''
          }`}
        >
          <div>
            <div className="tag-sticker pink mb-2">AUTONOMOUS BENCH</div>
            <h2 className="font-brand font-black text-4xl sm:text-6xl text-[#1d1b18] uppercase leading-none">
              THE 6 COURTROOM AGENTS.
            </h2>
          </div>
          <p className="text-sm font-semibold text-[#6e665b] max-w-md">
            Engineered with conflicting motivations so no hallucination escapes cross-examination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            const bgClass =
              agent.color === 'teal' ? 'bg-[#56b29e]' :
              agent.color === 'orange' ? 'bg-[#f47a22]' :
              agent.color === 'blue' ? 'bg-[#7a8fd8]' :
              agent.color === 'sky' ? 'bg-[#5fb2e6]' :
              agent.color === 'pink' ? 'bg-[#f28cbf]' : 'bg-[#f8c33c]';

            const staggerClass = `stagger-${idx + 1}`;

            return (
              <div
                key={agent.name}
                className={`scroll-reveal ${staggerClass} p-6 rounded-[22px] ${bgClass} border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] hover:shadow-[5px_5px_0px_#1d1b18] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[220px] group ${
                  agentsSection.isInView ? 'is-revealed' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#1d1b18] text-[#f8eedc] flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6">
                      <Icon className="w-5 h-5 text-[#f8c33c]" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1d1b18] text-[#f8eedc] font-brand font-black text-xs tracking-wider uppercase transition-colors duration-200">
                      {agent.badge}
                    </span>
                  </div>
                  <h4 className="font-brand font-black text-2xl text-[#1d1b18] uppercase tracking-tight">
                    {agent.name}
                  </h4>
                  <p className="text-[11px] font-bold text-[#1d1b18] uppercase opacity-90 mt-0.5">
                    {agent.role}
                  </p>
                </div>

                <p className="text-xs font-semibold text-[#1d1b18] mt-3 pt-3 border-t-2 border-[#1d1b18]/40 leading-snug">
                  {agent.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FOOTER CALLOUT / READY BANNER */}
      <section
        ref={ctaSection.ref}
        className={`scroll-reveal p-8 sm:p-12 rounded-[24px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[4px_4px_0px_#1d1b18] hover:shadow-[6px_6px_0px_#1d1b18] transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-6 dots ${
          ctaSection.isInView ? 'is-revealed' : ''
        }`}
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f8c33c] border-2 border-[#1d1b18] text-xs font-brand font-black uppercase mb-3">
            <span>READY TO VERIFY?</span>
          </div>
          <h2 className="font-brand font-black text-3xl sm:text-5xl text-[#1d1b18] uppercase leading-none">
            START YOUR FIRST TRIAL NOW.
          </h2>
          <p className="text-sm font-semibold text-[#6e665b] mt-2 max-w-xl">
            Test any assertion instantly on the free beta. No subscription or complex setup required.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/investigate"
            className="btn arrow font-brand text-sm font-black group transition-transform duration-180 hover:-translate-y-0.5 active:translate-y-0.5"
          >
            EMPANEL TRIAL NOW
          </Link>
          <Link
            to="/dashboard"
            className="btn ghost font-brand text-sm font-black border-2 border-[#1d1b18] transition-transform duration-180 hover:-translate-y-0.5 active:translate-y-0.5"
          >
            VIEW DASHBOARD
          </Link>
        </div>
      </section>

      {/* Minimal Neo-brutalist Footer */}
      <footer className="pt-6 pb-8 border-t-2 border-[#1d1b18] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-[#6e665b] uppercase">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1d1b18] flex items-center justify-center text-[#f8eedc]">
            <Scale className="w-3 h-3 text-[#f8c33c]" />
          </div>
          <span className="font-brand font-black text-sm text-[#1d1b18]">GHOSTNET AI COURTROOM</span>
          <span>© 2026. All trials logged.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/history" className="hover:underline text-[#1d1b18] transition-colors">Case History</Link>
          <Link to="/evidence" className="hover:underline text-[#1d1b18] transition-colors">Evidence Vault</Link>
          <Link to="/settings" className="hover:underline text-[#1d1b18] transition-colors">Telemetry</Link>
        </div>
      </footer>
    </div>
  );
};
