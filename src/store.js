const state = {
  team: [],        // array of developer objects added to team
  developers: [],  // cached list from API
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
  return true;
}

function removeFromTeam(developerId) {
  const team = getState('team');
  setState('team', team.filter(d => d.id !== developerId));
}

function isInTeam(developerId) {
  return getState('team').some(d => d.id === developerId);
}

// Expose to window for console testing
window.Store = { getState, setState, subscribe, addToTeam, removeFromTeam, isInTeam };

export { getState, setState, subscribe, addToTeam, removeFromTeam, isInTeam };
