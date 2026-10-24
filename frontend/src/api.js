// frontend/src/api.js
// API helper methods for Smart Road Infrastructure Backend

const API_BASE = 'http://localhost:5001/api';

export async function fetchCorridorRoute() {
  try {
    const res = await fetch(`${API_BASE}/corridor/route`);
    if (!res.ok) throw new Error('Failed to fetch route');
    return await res.json();
  } catch (err) {
    console.warn('Backend route fetch failed, using client verified geometry:', err);
    return null;
  }
}

export async function fetchReports(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.severity && filters.severity !== 'all') params.append('severity', filters.severity);
  if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
  if (filters.landmark && filters.landmark !== 'all') params.append('landmark', filters.landmark);
  if (filters.issue_type && filters.issue_type !== 'all') params.append('issue_type', filters.issue_type);
  if (filters.search) params.append('search', filters.search);

  const url = `${API_BASE}/reports?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return await res.json();
}

export async function fetchReportById(id) {
  const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(id)}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch report');
  }
  return await res.json();
}

export async function createReport(data) {
  let body;
  let headers = {};

  if (data instanceof FormData) {
    body = data;
    // multipart form data doesn't set Content-Type manually
  } else {
    body = JSON.stringify(data);
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers,
    body
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || 'Failed to submit report');
  }
  return json;
}

export async function updateReportStatus(id, updateData) {
  const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || 'Failed to update report status');
  }
  return json;
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return await res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/reports/reset-demo`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return await res.json();
}
