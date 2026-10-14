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
  accentBorder: string;
  accentBg: string;
  accentText: string;
  badgeBg: string;
}> = {
  ghost: {
    name: 'Ghost Agent',
    title: 'Adversarial Flaw Injector',
    roleDescription: 'Formulates deliberately flawed premises to test factual resilience.',
    icon: Ghost,
    accentBorder: 'border-amber-500/40',
    accentBg: 'bg-amber-500/5',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
  },
  prosecutor: {
    name: 'Prosecutor Agent',
    title: 'Inaccuracy & Fallacy Prosecutor',
    roleDescription: 'Files formal objections against unsupported assumptions and causal leaps.',
    icon: ShieldX,
    accentBorder: 'border-rose-500/40',
    accentBg: 'bg-rose-500/5',
    accentText: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/20'
  },
  defense: {
    name: 'Defense Agent',
    title: 'Nuance & Contextual Defense',
    roleDescription: 'Tests the strength of prosecution and clarifies operational boundary conditions.',
    icon: ShieldCheck,
    accentBorder: 'border-sky-500/40',
    accentBg: 'bg-sky-500/5',
    accentText: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20'
  },
  evidence: {
    name: 'Evidence Agent',
    title: 'Primary Source Harvester',
    roleDescription: 'Indexes official specifications, documentation, and verified publications.',
    icon: Search,
    accentBorder: 'border-emerald-500/40',
    accentBg: 'bg-emerald-500/5',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
  },
  factChecker: {
    name: 'Fact-Checker Agent',
    title: 'Independent Evidence Auditor',
    roleDescription: 'Audits claims against source excerpts to eliminate confirmation bias.',
    icon: FileCheck,
    accentBorder: 'border-purple-500/40',
    accentBg: 'bg-purple-500/5',
    accentText: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
  },
  judge: {
    name: 'Judge Agent',
    title: 'Supreme Judicial Adjudicator',
    roleDescription: 'Weighs evidence priority over agent agreement to issue binding verdict.',
    icon: Gavel,
    accentBorder: 'border-yellow-500/50',
    accentBg: 'bg-yellow-500/5',
    accentText: 'text-yellow-400',
    badgeBg: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
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
      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        isActive
          ? `${config.accentBorder} ${config.accentBg} shadow-lg shadow-black/40 ring-1 ring-amber-500/30`
          : isCompleted
          ? 'border-[#272E3D] bg-[#12161E]/90'
          : 'border-[#1C222C] bg-[#0F1318]/60 opacity-65'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
              isActive || isCompleted
                ? `${config.accentBorder} ${config.accentText} bg-[#161B24]`
                : 'border-[#272E3D] text-gray-500 bg-[#12161E]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-100 flex items-center gap-1.5 font-mono-code">
              {config.name}
            </h4>
            <p className="text-[11px] text-gray-400">{config.title}</p>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {isActive ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse font-mono-code">
              <Loader2 className="w-3 h-3 animate-spin" />
              ACTIVE
            </span>
          ) : isCompleted ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-mono-code">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              DONE
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] text-gray-400 bg-[#161A22] border border-[#232A36] font-mono-code">
              STANDBY
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
        {config.roleDescription}
      </p>

      {/* Activity or Summary Badge */}
      <div className="pt-2.5 border-t border-[#1F2633] flex items-center justify-between text-xs">
        <span className="text-gray-400 truncate max-w-[170px] text-[11px]">
          {isActive ? (
            <span className="text-amber-300 font-mono-code flex items-center gap-1">
              {currentActivity || 'Formulating submission...'}
            </span>
          ) : isCompleted ? (
            <span className="text-gray-300">
              {itemCount !== undefined ? `${itemCount} item(s) logged` : 'Testimony rendered'}
            </span>
          ) : (
            'Awaiting trial stage'
          )}
        </span>

        {isCompleted && (
          <span className={`text-[10px] uppercase font-mono-code px-1.5 py-0.5 rounded border ${config.badgeBg}`}>
            Verified
          </span>
        )}
      </div>
    </div>
  );
};
