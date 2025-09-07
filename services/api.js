import { Platform, NativeModules } from 'react-native';

function resolveApiBase() {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL || '';
    const withoutProtocol = scriptURL.split('://')[1] || '';
    const host = withoutProtocol.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:4000`;
    }
  } catch {}
  // Fallback to localhost for simulators
  return 'http://localhost:4000';
}

export const API_BASE = resolveApiBase();

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchReport(id) {
  const res = await fetch(`${API_BASE}/reports/${id}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function createReport(payload) {
  // If payload includes image (local uri), send multipart/form-data
  if (payload.image && payload.image.uri) {
    const form = new FormData();
    form.append('title', payload.title || '');
    form.append('description', payload.description || '');
    form.append('type', payload.type || '');
    form.append('location', JSON.stringify(payload.location || {}));
    form.append('priority', payload.priority || 'normal');
    const uri = payload.image.uri;
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '') || ['','jpg'];
    const type = `image/${match[1] || 'jpeg'}`;
    form.append('image', { uri, name: filename, type });
    const res = await fetch(`${API_BASE}/reports`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Failed to create report with image');
    return res.json();
  } else {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create report');
    return res.json();
  }
}

export async function updateReport(id, payload) {
  const res = await fetch(`${API_BASE}/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update report: ${res.status}`);
  return res.json();
}

export async function routeReport(id) {
  const res = await fetch(`${API_BASE}/route/${id}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to route report');
  return res.json();
}

export async function subscribeToken(token) {
  const res = await fetch(`${API_BASE}/subscribe`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ token })
  });
  if (!res.ok) throw new Error('Failed to subscribe');
  return res.json();
}
