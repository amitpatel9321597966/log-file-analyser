const envApiUrl = import.meta.env.VITE_API_URL;
export const API_BASE = envApiUrl 
  ? (envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl.replace(/\/$/, '')}/api`)
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://127.0.0.1:8000/api'
    : '/api';

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export async function fetchJobs() {
  const res = await fetch(`${API_BASE}/jobs`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function fetchJobDetail(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch job details');
  return res.json();
}

export async function deleteJob(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete job');
  return res.json();
}

export async function uploadLogFile(formData) {
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('File upload failed');
  return res.json();
}

export async function generateSampleLogs(options = {}) {
  const res = await fetch(`${API_BASE}/generate-sample`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      line_count: options.line_count || 100000,
      format: options.format || 'apache_nginx',
      inject_anomalies: options.inject_anomalies !== false,
    }),
  });
  if (!res.ok) throw new Error('Sample generation failed');
  return res.json();
}

export async function fetchJobLogs(jobId, params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.ip) query.set('ip', params.ip);
  if (params.status) query.set('status', params.status);
  if (params.level) query.set('level', params.level);
  if (params.url) query.set('url', params.url);
  if (params.only_anomalies) query.set('only_anomalies', 'true');
  if (params.page) query.set('page', params.page);
  if (params.page_size) query.set('page_size', params.page_size);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);

  const res = await fetch(`${API_BASE}/jobs/${jobId}/logs?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function fetchJobAnomalies(jobId, severity = null) {
  const url = severity && severity !== 'All' 
    ? `${API_BASE}/jobs/${jobId}/anomalies?severity=${encodeURIComponent(severity)}`
    : `${API_BASE}/jobs/${jobId}/anomalies`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch anomalies');
  return res.json();
}

export async function runBenchmark(jobId, workers = null) {
  const url = workers 
    ? `${API_BASE}/jobs/${jobId}/benchmark?workers=${workers}`
    : `${API_BASE}/jobs/${jobId}/benchmark`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Benchmark failed to run');
  }
  return res.json();
}

export async function fetchBenchmark(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/benchmark`);
  if (!res.ok) throw new Error('Failed to fetch benchmark');
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settings) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function clearAllData() {
  const res = await fetch(`${API_BASE}/settings/clear-data`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to clear data');
  return res.json();
}

