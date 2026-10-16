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
      <div className="py-24 text-center text-[#1d1b18]">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#f47a22] mb-3" />
        <p className="font-brand font-black text-xl uppercase tracking-wider">
          Querying backend subsystem telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] flex flex-col sm:flex-row sm:items-center justify-between gap-4 dots">
        <div>
          <div className="tag-sticker yellow mb-3">INFRASTRUCTURE TELEMETRY</div>
          <h1 className="font-brand font-black text-4xl sm:text-6xl text-[#1d1b18] uppercase leading-none">
            SYSTEM TELEMETRY.
          </h1>
          <p className="text-sm font-semibold text-[#6e665b] mt-2 max-w-xl">
            Safe operational telemetry. Secrets, API keys, and connection strings remain strictly protected on the backend server.
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="btn sm font-brand font-black"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>REFRESH TELEMETRY</span>
        </button>
      </div>

      {/* Subsystem Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. AI Engine */}
        <div className="p-6 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#1d1b18]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#1d1b18] text-[#f8eedc] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-[#f8c33c]" />
              </div>
              <h3 className="font-brand font-black text-2xl text-[#1d1b18] uppercase">
                AI Engine
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-brand font-black bg-[#56b29e] text-[#1d1b18] border border-[#1d1b18] uppercase">
              {status?.ai?.provider || 'MOCK'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-bold text-[#1d1b18]">
            <div className="flex justify-between py-1 border-b border-[#1d1b18]/10">
              <span className="text-[#6e665b] uppercase">Configured Model:</span>
              <span className="font-mono-code">{status?.ai?.model || 'llama3.2'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1d1b18]/10">
              <span className="text-[#6e665b] uppercase">Endpoint Base:</span>
              <span className="font-mono-code">{status?.ai?.baseUrl || 'http://localhost:11434'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#6e665b] uppercase">Configuration Status:</span>
              <span className="text-[#56b29e] uppercase">{status?.ai?.isConfigured ? 'Ready' : 'Simulated Sandbox'}</span>
            </div>
          </div>
        </div>

        {/* 2. Search Provider */}
        <div className="p-6 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#1d1b18]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#1d1b18] text-[#f8eedc] flex items-center justify-center">
                <Search className="w-4 h-4 text-[#7a8fd8]" />
              </div>
              <h3 className="font-brand font-black text-2xl text-[#1d1b18] uppercase">
                Search Harvester
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-brand font-black bg-[#7a8fd8] text-[#1d1b18] border border-[#1d1b18] uppercase">
              {status?.search?.provider || 'DUCKDUCKGO'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-bold text-[#1d1b18]">
            <div className="flex justify-between py-1 border-b border-[#1d1b18]/10">
              <span className="text-[#6e665b] uppercase">Active Indexer:</span>
              <span className="uppercase">{status?.search?.provider || 'DuckDuckGo API'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1d1b18]/10">
              <span className="text-[#6e665b] uppercase">Max Harvest per Claim:</span>
              <span className="font-mono-code">{status?.limits?.maxSearchResults || 6} Sources</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#6e665b] uppercase">API Key Protected:</span>
              <span className="text-[#56b29e] uppercase">{status?.search?.isConfigured ? 'Yes (Server-side)' : 'Public Scraper Mode'}</span>
            </div>
          </div>
        </div>

        {/* 3. Database Subsystem */}
        <div className="p-6 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#1d1b18]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#1d1b18] text-[#f8eedc] flex items-center justify-center">
                <Database className="w-4 h-4 text-[#56b29e]" />
              </div>
              <h3 className="font-brand font-black text-2xl text-[#1d1b18] uppercase">
                Evidentiary DB
              </h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-brand font-black uppercase border border-[#1d1b18] ${
              status?.database?.status === 'connected' ? 'bg-[#56b29e] text-[#1d1b18]' : 'bg-[#f8c33c] text-[#1d1b18]'
            }`}>
              {status?.database?.status === 'connected' ? 'MONGODB' : 'LOCAL FALLBACK'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-bold text-[#1d1b18]">
            <div className="flex justify-between py-1 border-b border-[#1d1b18]/10">
              <span className="text-[#6e665b] uppercase">Connection Target:</span>
              <span className="font-mono-code">{status?.database?.host || 'local-fallback'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1d1b18]/10">
              <span className="text-[#6e665b] uppercase">Database Status:</span>
              <span className="uppercase">{status?.database?.status || 'Active'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#6e665b] uppercase">Environment:</span>
              <span className="font-mono-code uppercase">{status?.app?.nodeEnv || 'development'}</span>
            </div>
          </div>
        </div>

        {/* 4. Safety & Limits */}
        <div className="p-6 rounded-[22px] bg-[#f8eedc] border-[2.5px] border-[#1d1b18] shadow-[3px_3px_0px_#1d1b18] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#1d1b18]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#1d1b18] text-[#f8eedc] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#f47a22]" />
              </div>
              <h3 className="font-brand font-black text-2xl text-[#1d1b18] uppercase">
                Chamber Limits
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-brand font-black bg-[#f47a22] text-[#fff] border border-[#1d1b18] uppercase">
              ENFORCED
            </span>
          </div>

          <div className="space-y-2 text-xs font-bold text-[#1d1b18]">
            <div className="flex justify-between py-1 border-b border-[#1d1b18]/10">
              <span className="text-[#6e665b] uppercase">Max Agent Deliberation Calls:</span>
              <span className="font-mono-code">{status?.limits?.maxAgentCalls || 12}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1d1b18]/10">
              <span className="text-[#6e665b] uppercase">Agent Execution Timeout:</span>
              <span className="font-mono-code">{status?.limits?.agentTimeoutMs || 60000} ms</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#6e665b] uppercase">HTTP Protection:</span>
              <span>Helmet & CORS Configured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
