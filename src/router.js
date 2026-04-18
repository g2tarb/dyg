const routes = {};
let currentCleanup = null;

function registerRoute(path, handler) {
  routes[path] = handler;
}

function navigate(path) {
  window.location.hash = path;
}

function getParam(key) {
  const hash = window.location.hash.slice(1);
  const [, queryString] = hash.split('?');
  if (!queryString) return null;
  const params = new URLSearchParams(queryString);
  return params.get(key);
}

function getPath() {
  const hash = window.location.hash.slice(1) || '/';
  return hash.split('?')[0];
}

function handleRoute() {
  const path = getPath();
  const content = document.getElementById('page-content');
  if (!content) return;

  // Cleanup previous page
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  const handler = routes[path];
  if (handler) {
    currentCleanup = handler(content);
  } else {
    // Try matching dynamic routes like /profile/:id
    for (const [pattern, routeHandler] of Object.entries(routes)) {
      if (pattern.includes(':')) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length === pathParts.length) {
          const params = {};
          let match = true;
          for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
              params[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            currentCleanup = routeHandler(content, params);
            return;
          }
        }
      }
    }
    // 404 fallback
    if (notFoundHandler) {
      currentCleanup = notFoundHandler(content);
    } else {
      navigate('/');
    }
  }
}

let notFoundHandler = null;

function setNotFoundHandler(handler) {
  notFoundHandler = handler;
}

function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  // Initial route
  handleRoute();
}

export { registerRoute, navigate, getParam, initRouter, setNotFoundHandler };
