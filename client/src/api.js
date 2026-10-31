// Empty by default: the client calls /api on its own origin (Vite proxy locally, Netlify proxy in production).
// Set VITE_API_URL only if the API must be called directly on another domain.
const API_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = data.errors;
    throw err;
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  events: () => request('/events'),
  myEvents: () => request('/events/mine'),
  joinEvent: (id) => request(`/events/${id}/register`, { method: 'POST' }),
  feedback: () => request('/feedback'),
  sendFeedback: (body) => request('/feedback', { method: 'POST', body }),
};
