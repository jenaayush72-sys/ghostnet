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
    const url = `${API_BASE_URL}/investigations/${caseId}/events`;
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
