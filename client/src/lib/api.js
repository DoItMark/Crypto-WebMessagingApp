const BASE = import.meta.env.VITE_API_URL || '/api';

function authHeaders() {
  const t = localStorage.getItem('jwt');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) Object.assign(headers, authHeaders());

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && data.error) || res.statusText || 'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
  contacts: () => request('/contacts'),
  publicKey: (email) => request(`/contacts/${encodeURIComponent(email)}/publickey`),
  sendMessage: (payload) => request('/messages', { method: 'POST', body: payload }),
  conversation: (email) => request(`/messages/${encodeURIComponent(email)}`),
};
