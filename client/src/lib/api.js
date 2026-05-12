const BASE = '/api';

function authHeaders() {
  const t = localStorage.getItem('jwt');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) Object.assign(headers, authHeaders());

  // Debug logging
  if (auth) {
    const token = localStorage.getItem('jwt');
    console.log(`[API] ${method} ${BASE}${path}`);
    console.log(`[API] Token in localStorage: ${token ? 'YES' : 'NO'}`);
    if (token) {
      console.log(`[API] Token preview: ${token.substring(0, 20)}...`);
      console.log(`[API] Authorization header being sent: Bearer ${token.substring(0, 20)}...`);
    }
    console.log('[API] All request headers:', headers);
  }

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    // Response is not JSON (likely HTML error page)
    console.error(`[API] Failed to parse response from ${BASE}${path}`);
    console.error(`[API] Response: ${text.substring(0, 100)}`);
    const msg = `Server error or incorrect API endpoint. Got: ${text.substring(0, 50)}...`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  
  if (!res.ok) {
    const msg = (data && data.error) || res.statusText || 'Request failed';
    console.error(`[API] ${res.status} ${msg}`);
    
    // Special handling for 401
    if (res.status === 401) {
      console.error('[API] Unauthorized - checking token...');
      const token = localStorage.getItem('jwt');
      console.error(`[API] Token in storage: ${token ? 'YES' : 'NO'}`);
      if (token) {
        console.error(`[API] Token preview: ${token.substring(0, 20)}...`);
      }
    }
    
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
