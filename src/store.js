const state = {
  user: null,        // { id, github_login, avatar_url, name }
  developer: null,   // { id, archetype, scores, ... } — linked dev profile
};

const listeners = {};

function getState(key) {
  if (key) return state[key];
  return { ...state };
}

function setState(key, value) {
  state[key] = value;
  if (listeners[key]) {
    listeners[key].forEach(fn => fn(value));
  }
}

function subscribe(key, callback) {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(callback);

  // Return unsubscribe function
  return () => {
    listeners[key] = listeners[key].filter(fn => fn !== callback);
  };
}

// --- Auth ---

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      setState('user', null);
      setState('developer', null);
      return null;
    }
    const data = await res.json();
    setState('user', data.user);
    setState('developer', data.developer);
    return data;
  } catch {
    setState('user', null);
    setState('developer', null);
    return null;
  }
}

async function logout() {
  try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  setState('user', null);
  setState('developer', null);
}

// Expose to window for console testing
window.Store = { getState, setState, subscribe, checkAuth, logout };

export { getState, setState, subscribe, checkAuth, logout };
