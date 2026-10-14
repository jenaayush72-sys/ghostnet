import React, { useEffect, useState } from 'react';
import {
  Settings, Cpu, Search, Database, Shield, CheckCircle2,
  AlertTriangle, RefreshCw, Loader2, Info
} from 'lucide-react';
import { api } from '../services/api';
import { SystemStatus } from '../types';

export const SettingsPage: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettingsStatus();
      setStatus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to query system status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-2" />
        <p className="text-xs font-mono-code">Querying backend subsystem telemetry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-amber-400 uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Infrastructure & Diagnostics</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">
            System Settings & Providers
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Safe operational telemetry. Secrets, tokens, and database credentials remain exclusively on the server.
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#202734] border border-[#273243] text-xs font-mono-code text-gray-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {status && (
        <div className="space-y-4">
          {/* AI Model Subsystem */}
          <div className="p-6 rounded-2xl bg-[#10141B] border border-[#232A36] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2532]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-100 font-mono-code">
                    AI Inference Provider
                  </h3>
                  <p className="text-xs text-gray-500">Autonomous reasoning and adversarial agent engine</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded text-xs font-mono-code uppercase font-semibold ${
                status.ai.isConfigured
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
              }`}>
                {status.ai.isConfigured ? 'Operational' : 'Needs Config'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-code">
              <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1C222C]">
                <span className="text-gray-400 block text-[11px]">Provider:</span>
                <span className="text-gray-100 font-semibold">{status.ai.provider}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1C222C]">
                <span className="text-gray-400 block text-[11px]">Model:</span>
                <span className="text-gray-100 font-semibold">{status.ai.model || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1C222C]">
                <span className="text-gray-400 block text-[11px]">Endpoint Base:</span>
                <span className="text-gray-100 font-semibold truncate block">{status.ai.baseUrl}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 bg-[#0E1218] p-3 rounded-lg border border-[#1E2532] leading-relaxed">
              <Info className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
              {status.ai.note}
            </p>
          </div>

          {/* Search & Evidence Subsystem */}
          <div className="p-6 rounded-2xl bg-[#10141B] border border-[#232A36] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2532]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-100 font-mono-code">
                    Search & Source Harvester
                  </h3>
                  <p className="text-xs text-gray-500">Live primary document and specification indexer</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded text-xs font-mono-code uppercase font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-code">
              <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1C222C]">
                <span className="text-gray-400 block text-[11px]">Active Provider:</span>
                <span className="text-gray-100 font-semibold">{status.search.provider}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1C222C]">
                <span className="text-gray-400 block text-[11px]">Max Results Per Claim:</span>
                <span className="text-gray-100 font-semibold">{status.limits.maxSearchResults}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 bg-[#0E1218] p-3 rounded-lg border border-[#1E2532] leading-relaxed">
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
              {status.search.note}
            </p>
          </div>

          {/* Database & Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#10141B] border border-[#232A36] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono-code text-gray-400 mb-1">
                <Database className="w-4 h-4 text-sky-400" />
                <span>MongoDB Persistence</span>
              </div>
              <div className="text-sm font-semibold text-gray-100 font-mono-code">
                Status: <span className="text-emerald-400">{status.database.status}</span>
              </div>
              <p className="text-xs text-gray-500 font-mono-code">
                Host: {status.database.host}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#10141B] border border-[#232A36] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono-code text-gray-400 mb-1">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Execution Governance</span>
              </div>
              <div className="text-xs text-gray-300 font-mono-code space-y-1">
                <p>Max Agent Calls: {status.limits.maxAgentCalls}</p>
                <p>Agent Timeout: {status.limits.agentTimeoutMs / 1000}s</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
