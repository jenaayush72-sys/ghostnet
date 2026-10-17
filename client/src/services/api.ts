import axios from 'axios';
import { CaseData, EvidenceRecord, SystemStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  async getHealth() {
    const res = await apiClient.get('/health');
    return res.data;
  },

  async getSettingsStatus(): Promise<SystemStatus> {
    const res = await apiClient.get('/settings/status');
    return res.data;
  },

  async createInvestigation(data: {
    claim: string;
    title?: string;
    category?: string;
    context?: string;
    sourceUrl?: string;
  }): Promise<{ caseId: string; title: string; status: string; currentStage: string }> {
    const res = await apiClient.post('/investigations', data);
    return res.data.data;
  },

  async getInvestigations(params: {
    category?: string;
    status?: string;
    verdict?: string;
    search?: string;
    limit?: number;
    skip?: number;
  } = {}): Promise<{ data: CaseData[]; total: number }> {
    const res = await apiClient.get('/investigations', { params });
    return res.data;
  },

  async getInvestigation(caseId: string): Promise<CaseData> {
    const res = await apiClient.get(`/investigations/${caseId}`);
    return res.data.data;
  },

  async getCaseEvidence(caseId: string): Promise<EvidenceRecord[]> {
    const res = await apiClient.get(`/investigations/${caseId}/evidence`);
    return res.data.data;
  },

  async getAllEvidence(params: {
    caseId?: string;
    direction?: string;
    status?: string;
    search?: string;
    limit?: number;
    skip?: number;
  } = {}): Promise<{ data: EvidenceRecord[]; total: number }> {
    const res = await apiClient.get('/evidence', { params });
    return res.data;
  },

  async retryInvestigation(caseId: string) {
    const res = await apiClient.post(`/investigations/${caseId}/retry`);
    return res.data;
  },

  async challengeInvestigation(caseId: string, data: { counterEvidence: string; counterUrl?: string; reason?: string }) {
    const res = await apiClient.post(`/investigations/${caseId}/challenge`, data);
    return res.data;
  },

  getExportUrl(caseId: string, format: 'json' | 'markdown' = 'json') {
    const cleanId = encodeURIComponent(String(caseId || '').trim().replace(/\s+/g, '-'));
    return `${API_BASE_URL}/investigations/${cleanId}/export?format=${format}`;
  },

  async downloadReport(caseId: string, format: 'json' | 'markdown' = 'json', fallbackCaseData?: any) {
    const rawId = String(caseId || '').trim();
    const cleanId = encodeURIComponent(rawId.replace(/\s+/g, '-'));
    const url = `/investigations/${cleanId}/export?format=${format}`;

    try {
      const res = await apiClient.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: format === 'json' ? 'application/json' : 'text/markdown'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `GhostNet-Case-${cleanId}-Report.${format === 'json' ? 'json' : 'md'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      if (fallbackCaseData) {
        let content = '';
        if (format === 'json') {
          content = JSON.stringify({
            courtroom: 'GhostNet Autonomous Multi-Agent Courtroom',
            judgeModel: 'Gemma 4 Judge',
            exportedAt: new Date().toISOString(),
            case: fallbackCaseData
          }, null, 2);
        } else {
          const v = fallbackCaseData.verdict || {};
          content = `# GhostNet AI Courtroom Investigation Report: ${fallbackCaseData.caseId || cleanId}
**Indicted Claim**: "${fallbackCaseData.originalClaim || ''}"
**Docket Title**: ${fallbackCaseData.title || ''}
**Category**: ${fallbackCaseData.category || 'general'}
**Status**: ${fallbackCaseData.status || 'completed'}
**Empanelled At**: ${fallbackCaseData.createdAt || new Date().toISOString()}

---

## 1. JUDICIAL RULING (Gemma 4 Judge)
- **Official Ruling**: **${v.verdict || 'PENDING'}**
- **Takeaway**: ${v.takeaway || v.summary || 'N/A'}
- **Executive Summary**: ${v.summary || 'No summary rendered.'}
- **Judicial Synthesis & Reasoning**: ${v.reasoning || 'No reasoning rendered.'}

---

## 2. TRUTH BREAKDOWN
${(v.truthBreakdown || []).map((t: any) => `- [${t.status}] ${t.premise}: ${t.explanation}`).join('\n') || 'None'}

---

## 3. CORROBORATING FINDINGS
${(v.supportingFindings || []).map((f: string) => `- ${f}`).join('\n') || 'None'}

---

## 4. CONTRADICTIONS & LIMITATIONS
${(v.contradictingFindings || []).map((f: string) => `- ${f}`).join('\n') || 'None'}

---

## 5. AGENT PLEADINGS & ARGUMENTS
### Ghost Adversarial Premise:
${fallbackCaseData.agentResults?.ghost?.adversarialArgument || 'N/A'}

### Prosecution Objections:
${(fallbackCaseData.agentResults?.prosecutor?.objections || []).map((o: any) => `- **${o.statement}**: ${o.objection} (${o.reasoning})`).join('\n') || 'None'}

### Defense Counterarguments:
${(fallbackCaseData.agentResults?.defense?.counterarguments || []).map((d: any) => `- **Defense**: ${d.defenseArgument} (Valid when: ${d.conditionsWhereTrue})`).join('\n') || 'None'}
`;
        }
        const blob = new Blob([content], {
          type: format === 'json' ? 'application/json' : 'text/markdown'
        });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `GhostNet-Case-${cleanId}-Report.${format === 'json' ? 'json' : 'md'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        return;
      }
      throw err;
    }
  },

  /**
   * Real-time Server-Sent Events (SSE) connector
   */
  subscribeToCaseEvents(
    caseId: string,
    callbacks: {
      onEvent?: (event: any) => void;
      onComplete?: (data: any) => void;
      onError?: (err: any) => void;
      onConnected?: () => void;
    }
  ) {
    const cleanId = String(caseId).trim().replace(/\s+/g, '-');
    const url = `${API_BASE_URL}/investigations/${cleanId}/events`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('connected', () => {
      callbacks.onConnected?.();
    });

    eventSource.addEventListener('investigation_event', (e) => {
      try {
        const parsed = JSON.parse(e.data);
        callbacks.onEvent?.(parsed);
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    });

    eventSource.addEventListener('investigation_complete', (e) => {
      try {
        const parsed = JSON.parse(e.data);
        callbacks.onComplete?.(parsed);
      } catch {}
      eventSource.close();
    });

    eventSource.addEventListener('investigation_error', (e) => {
      try {
        const parsed = JSON.parse(e.data);
        callbacks.onError?.(parsed);
      } catch {}
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      // Browsers retry SSE automatically; notify if state closed
      if (eventSource.readyState === EventSource.CLOSED) {
        callbacks.onError?.(err);
      }
    };

    return () => {
      eventSource.close();
    };
  }
};
