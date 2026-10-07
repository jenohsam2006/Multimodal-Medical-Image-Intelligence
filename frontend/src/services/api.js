const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchDemoCases() {
  const res = await fetch(`${API_BASE}/demo-cases`);
  if (!res.ok) throw new Error('Failed to fetch demo cases');
  return res.json();
}

export async function fetchDemoCase(caseId) {
  const res = await fetch(`${API_BASE}/demo-cases/${caseId}`);
  if (!res.ok) throw new Error(`Failed to fetch case ${caseId}`);
  return res.json();
}

export async function quickQualityCheck(imageBase64) {
  const res = await fetch(`${API_BASE}/quality-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: imageBase64 }),
  });
  if (!res.ok) throw new Error('Quality check failed');
  return res.json();
}

export async function analyzeMedicalCase(payload) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Analysis failed');
  }
  return res.json();
}

export async function saveDoctorReview(payload) {
  const res = await fetch(`${API_BASE}/save-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save doctor review');
  return res.json();
}

export async function fetchAnalyses(query = '', status = 'All') {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (status && status !== 'All') params.append('status', status);

  const res = await fetch(`${API_BASE}/analyses?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch analyses');
  return res.json();
}

export async function fetchAnalysisDetails(analysisId) {
  const res = await fetch(`${API_BASE}/analyses/${analysisId}`);
  if (!res.ok) throw new Error('Failed to fetch analysis details');
  return res.json();
}

export async function fetchStatistics() {
  const res = await fetch(`${API_BASE}/statistics`);
  if (!res.ok) throw new Error('Failed to fetch clinical statistics');
  return res.json();
}

export async function fetchModelInfo() {
  const res = await fetch(`${API_BASE}/model-info`);
  if (!res.ok) throw new Error('Failed to fetch model info');
  return res.json();
}
