import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-f360d15a`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'API request failed';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  async getItems() {
    return fetchAPI('/items');
  },

  async createItem(item: any) {
    return fetchAPI('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async getClaims() {
    return fetchAPI('/claims');
  },

  async createClaim(claim: any) {
    return fetchAPI('/claims', {
      method: 'POST',
      body: JSON.stringify(claim),
    });
  },

  async getStats() {
    return fetchAPI('/stats');
  },

  async getTheftReports() {
    return fetchAPI('/theft-reports');
  },

  async createTheftReport(report: any) {
    return fetchAPI('/theft-reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  },

  async updateTheftReport(id: string, report: any) {
    return fetchAPI(`/theft-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(report),
    });
  },
};