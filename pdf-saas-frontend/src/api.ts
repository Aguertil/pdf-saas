const API = '/api';

export type PlanTier = 'free' | 'starter' | 'pro' | 'business';

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  plan: PlanTier;
  is_admin: boolean;
  pdfs_used_this_month: number;
  ocr_pages_used_this_month: number;
}

export interface DocumentItem {
  id: number;
  original_filename: string;
  page_count: number;
  font_metadata?: { pages: Array<{ page: number; fonts: Array<{ font: string; size: number }> }> };
  created_at: string;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(email: string, password: string, full_name?: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Erreur inscription');
  return res.json();
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('Identifiants invalides');
  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  return data;
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${API}/auth/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Non authentifié');
  return res.json();
}

export async function listDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API}/pdfs/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Erreur chargement documents');
  return res.json();
}

export async function uploadPdf(file: File): Promise<DocumentItem> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API}/pdfs/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Upload échoué');
  }
  return res.json();
}

export async function editText(docId: number, page: number, old_text: string, new_text: string) {
  const res = await fetch(`${API}/pdfs/${docId}/edit-text`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, old_text, new_text }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'Édition échouée');
  return res.json();
}

export async function ocrPage(docId: number, pageIndex: number) {
  const res = await fetch(`${API}/pdfs/${docId}/ocr/${pageIndex}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).detail || 'OCR échoué');
  return res.json();
}

export async function getPlans() {
  const res = await fetch(`${API}/subscriptions/plans`);
  return res.json();
}

export async function upgradePlan(tier: PlanTier) {
  const res = await fetch(`${API}/subscriptions/upgrade/${tier}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Upgrade échoué');
  return res.json();
}

export async function adminStats() {
  const res = await fetch(`${API}/admin/stats`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Accès admin refusé');
  return res.json();
}

export async function adminUsers() {
  const res = await fetch(`${API}/admin/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Accès admin refusé');
  return res.json();
}

export function logout() {
  localStorage.removeItem('token');
}

export function pdfFileUrl(docId: number) {
  return `${API}/pdfs/${docId}/file?token=${localStorage.getItem('token')}`;
}
