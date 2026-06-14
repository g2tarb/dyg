import { checkAuth } from './store.js';
import { initTheme } from './utils/theme.js';
import { registerRoute, initRouter, setNotFoundHandler } from './router.js';
import { createHeader } from './components/header.js';
import { initPageOrbs, syncPatternToRoute } from './components/pageOrbs.js';
import { renderLanding } from './pages/landing.js';
import { renderAbout } from './pages/about.js';
import { renderPortfolio } from './pages/portfolio.js';
import { renderSettings } from './pages/settings.js';
import { renderArchetypePage } from './pages/archetypePage.js';
import { renderNotFound } from './pages/notFound.js';
import { createFooter } from './components/footer.js';

const app = document.getElementById('app');

// Mount global orbs canvas (behind everything)
const orbsCanvas = document.createElement('canvas');
orbsCanvas.className = 'page-orbs';
app.appendChild(orbsCanvas);
initPageOrbs(orbsCanvas);

// Mount header
const header = createHeader();
app.appendChild(header);

// Page content container
const pageContent = document.createElement('main');
pageContent.id = 'page-content';
app.appendChild(pageContent);

// Register routes — version publique recentrée : scan → archétype + score + conseils
registerRoute('/', renderLanding);
registerRoute('/u/:login', renderPortfolio);
registerRoute('/archetype/:key', renderArchetypePage);
registerRoute('/about', renderAbout);
registerRoute('/settings', renderSettings);

// 404 handler
setNotFoundHandler(renderNotFound);

// Mount footer
const footer = createFooter();
app.appendChild(footer);

// Start theme system
initTheme();

// Start router
initRouter();

// Sync orb pattern on route change
window.addEventListener('hashchange', syncPatternToRoute);

// Restore state from server
checkAuth();
