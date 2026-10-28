/* src/api.js – simple wrapper around the Express API
   Uses a base URL so the code works both in development (with Vite proxy) and in production (same origin).
   The front‑end already uses relative URLs (e.g., '/api/data'), but having a central module makes it easier to maintain.
*/

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchData() {
  const res = await fetch(`${API_BASE}/api/data`);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

export async function createRecord(record) {
  const res = await fetch(`${API_BASE}/api/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error('Failed to create record');
  return res.json();
}

export async function bulkCreateRecords(records) {
  const res = await fetch(`${API_BASE}/api/records/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(records),
  });
  if (!res.ok) throw new Error('Failed to bulk create records');
  return res.json();
}

export async function resetMonth(month) {
  const res = await fetch(`${API_BASE}/api/records/reset/${encodeURIComponent(month)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month }),
  });
  if (!res.ok) throw new Error('Failed to reset month');
  return res.json();
}

export async function deleteMonth(month) {
  const res = await fetch(`${API_BASE}/api/records/month/${encodeURIComponent(month)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month }),
  });
  if (!res.ok) throw new Error('Failed to delete month');
  return res.json();
}

export async function deleteRecord(id) {
  const res = await fetch(`${API_BASE}/api/records/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete record');
  return res.json();
}

export async function createExpense(expense) {
  const res = await fetch(`${API_BASE}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function bulkCreateExpenses(expenses) {
  const res = await fetch(`${API_BASE}/api/expenses/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenses),
  });
  if (!res.ok) throw new Error('Failed to bulk create expenses');
  return res.json();
}

export async function deleteExpense(id) {
  const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete expense');
  return res.json();
}

export async function verifyManagerPassword(password) {
  const res = await fetch(`${API_BASE}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Incorrect manager password');
  }
  return res.json();
}
