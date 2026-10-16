import React from 'react';
import { Ghost, ShieldX, ShieldCheck, Search, FileCheck, Gavel, Loader2, CheckCircle2 } from 'lucide-react';

export type AgentRole = 'ghost' | 'prosecutor' | 'defense' | 'evidence' | 'factChecker' | 'judge';

interface AgentCardProps {
  role: AgentRole;
  isActive: boolean;
  isCompleted: boolean;
  currentActivity?: string;
  itemCount?: number;
}

const AGENT_CONFIGS: Record<AgentRole, {
  name: string;
  title: string;
  roleDescription: string;
  icon: React.ElementType;
  color: string;
  badge: string;
}> = {
  ghost: {
    name: 'Ghost Agent',
    title: 'Adversarial Flaw Injector',
    roleDescription: 'Formulates deliberately flawed premises to test factual resilience.',
    icon: Ghost,
    color: 'bg-[#56b29e]',
    badge: 'PROBE'
  },
  prosecutor: {
    name: 'Prosecutor Agent',
    title: 'Inaccuracy Prosecutor',
    roleDescription: 'Files formal objections against unsupported assumptions and causal leaps.',
    icon: ShieldX,
    color: 'bg-[#f47a22]',
    badge: 'OBJECTION'
  },
  defense: {
    name: 'Defense Agent',
    title: 'Nuance & Contextual Defense',
    roleDescription: 'Tests the strength of prosecution and clarifies operational boundary conditions.',
    icon: ShieldCheck,
    color: 'bg-[#7a8fd8]',
    badge: 'DEFENSE'
  },
  evidence: {
    name: 'Evidence Agent',
    title: 'Primary Source Harvester',
    roleDescription: 'Indexes official specifications, documentation, and verified publications.',
    icon: Search,
    color: 'bg-[#5fb2e6]',
    badge: 'EVIDENCE'
  },
  factChecker: {
    name: 'Fact-Checker Agent',
    title: 'Independent Evidence Auditor',
    roleDescription: 'Audits claims against source excerpts to eliminate confirmation bias.',
    icon: FileCheck,
    color: 'bg-[#f28cbf]',
    badge: 'AUDIT'
  },
  judge: {
    name: 'Judge Agent',
    title: 'Supreme Judicial Adjudicator',
    roleDescription: 'Weighs evidence priority over agent agreement to issue binding verdict.',
    icon: Gavel,
    color: 'bg-[#f8c33c]',
    badge: 'VERDICT'
  }
};

export const AgentCard: React.FC<AgentCardProps> = ({
  role,
  isActive,
  isCompleted,
  currentActivity,
  itemCount
}) => {
  const config = AGENT_CONFIGS[role];
  const Icon = config.icon;

  return (
    <div
      className={`relative rounded-[18px] border-[2.5px] border-[#1d1b18] p-4 transition-all ${
        isActive
          ? `${config.color} shadow-[3px_3px_0px_#1d1b18] scale-[1.02] ring-2 ring-[#1d1b18]`
          : isCompleted
          ? 'bg-[#f8eedc] shadow-[2px_2px_0px_#1d1b18]'
          : 'bg-[#f1e4cf] opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-[#1d1b18] ${
              isActive || isCompleted
                ? 'bg-[#1d1b18] text-[#f8eedc]'
                : 'bg-[#f8eedc] text-[#6e665b]'
            }`}
          >
            <Icon className="w-4 h-4 text-[#f8c33c]" />
          </div>
          <div>
            <h4 className="font-brand font-black text-lg uppercase tracking-tight text-[#1d1b18] leading-tight">
              {config.name}
            </h4>
            <p className="text-[10px] font-bold uppercase text-[#6e665b]">
              {config.title}
            </p>
          </div>
        </div>

        {/* Status indicator badge */}
        <div>
          {isActive ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1d1b18] text-[#f8c33c] text-[10px] font-brand font-black uppercase tracking-wider animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              DELIBERATING
            </span>
          ) : isCompleted ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#56b29e] text-[#1d1b18] border border-[#1d1b18] text-[10px] font-brand font-black uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3" />
              FILED
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-[#f1e4cf] text-[#6e665b] border border-[#1d1b18]/40 text-[10px] font-brand font-bold uppercase">
              STANDBY
            </span>
          )}
        </div>
      </div>

      <p className="text-xs font-semibold text-[#3a352e] leading-snug line-clamp-2 mt-2">
        {currentActivity || config.roleDescription}
      </p>

      {itemCount !== undefined && itemCount > 0 && (
        <div className="mt-3 pt-2 border-t border-[#1d1b18]/20 flex items-center justify-between text-[11px] font-bold text-[#1d1b18]">
          <span className="uppercase text-[10px] text-[#6e665b]">Artifacts indexed</span>
          <span className="px-2 py-0.5 rounded-full bg-[#f8c33c] border border-[#1d1b18] font-brand font-black">
            {itemCount} ITEMS
          </span>
        </div>
      )}
    </div>
  );
};
