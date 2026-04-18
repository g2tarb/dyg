const state = {
  team: [],
  teamId: localStorage.getItem('dyg_team_id') || null,
  synergy: { coverage: 0, diversityBonus: 0, total: 0 },
  developers: [],
  filters: {
    pillar: null,
    min: null,
    archetype: null,
    price: null
  }
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

// Team helpers
function addToTeam(developer) {
  const team = getState('team');
  if (team.length >= 5) return false;
  if (team.find(d => d.id === developer.id)) return false;
  setState('team', [...team, developer]);
  debouncedSync();
  return true;
}

function removeFromTeam(developerId) {
  const team = getState('team');
  setState('team', team.filter(d => d.id !== developerId));
  debouncedSync();
}

function isInTeam(developerId) {
  return getState('team').some(d => d.id === developerId);
}

// --- Team persistence ---

let syncTimer = null;

function debouncedSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncTeamToServer, 500);
}

function updateSynergyFromResponse(data) {
  const coverage = parseFloat(data.synergy_score) || 0;
  const diversityBonus = parseFloat(data.diversity_bonus) || 0;
  const total = Math.min(100, Math.round(coverage + diversityBonus));
  setState('synergy', { coverage, diversityBonus, total });
}

async function syncTeamToServer() {
  const team = getState('team');
  const ids = team.map(d => d.id);
  let teamId = getState('teamId');

  try {
    if (teamId) {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developer_ids: ids })
      });
      if (res.status === 404) {
        setState('teamId', null);
        localStorage.removeItem('dyg_team_id');
        if (ids.length > 0) return syncTeamToServer();
        setState('synergy', { coverage: 0, diversityBonus: 0, total: 0 });
        return;
      }
      if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
      const data = await res.json();
      updateSynergyFromResponse(data);
    } else if (ids.length > 0) {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Ma Team', developer_ids: ids })
      });
      if (!res.ok) throw new Error(`POST failed: ${res.status}`);
      const data = await res.json();
      setState('teamId', data.id);
      localStorage.setItem('dyg_team_id', data.id);
      updateSynergyFromResponse(data);
    } else {
      setState('synergy', { coverage: 0, diversityBonus: 0, total: 0 });
    }
  } catch (err) {
    console.error('Team sync failed:', err);
  }
}

async function loadTeamFromServer() {
  const teamId = getState('teamId');
  if (!teamId) return;
  try {
    const res = await fetch(`/api/teams/${teamId}`);
    if (!res.ok) {
      setState('teamId', null);
      localStorage.removeItem('dyg_team_id');
      return;
    }
    const data = await res.json();
    setState('team', data.members || []);
    updateSynergyFromResponse(data);
  } catch (err) {
    console.error('Team load failed:', err);
  }
}

// Expose to window for console testing
window.Store = { getState, setState, subscribe, addToTeam, removeFromTeam, isInTeam, loadTeamFromServer };

export { getState, setState, subscribe, addToTeam, removeFromTeam, isInTeam, loadTeamFromServer };
