import { loadTeamFromServer, checkAuth, subscribe } from './store.js';
import { startIdleCoach, stopIdleCoach } from './components/idleCoach.js';
import { initTheme, setArchetypeTheme, resetTheme } from './utils/theme.js';
import { registerRoute, initRouter, setNotFoundHandler } from './router.js';
import { createHeader } from './components/header.js';
import { initPageOrbs, syncPatternToRoute } from './components/pageOrbs.js';
import { renderLanding } from './pages/landing.js';
import { renderSearch } from './pages/search.js';
import { renderProfile } from './pages/profile.js';
import { renderTeamBuilder } from './pages/teamBuilder.js';
import { renderOnboarding } from './pages/onboarding.js';
import { renderAbout } from './pages/about.js';
import { renderProjects } from './pages/projects.js';
import { renderProjectDetail } from './pages/projectDetail.js';
import { renderPortfolio } from './pages/portfolio.js';
import { renderMessages } from './pages/messages.js';
import { renderSettings } from './pages/settings.js';
import { renderArchetypePage } from './pages/archetypePage.js';
import { renderTraining } from './pages/training.js';
import { renderLeaderboard } from './pages/leaderboard.js';
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

// Register routes
registerRoute('/', renderLanding);
registerRoute('/search', renderSearch);
registerRoute('/profile/:id', renderProfile);
registerRoute('/team', renderTeamBuilder);
registerRoute('/onboarding', renderOnboarding);
registerRoute('/about', renderAbout);
registerRoute('/projects', renderProjects);
registerRoute('/projects/:id', renderProjectDetail);
registerRoute('/u/:login', renderPortfolio);
registerRoute('/messages', renderMessages);
registerRoute('/messages/:id', renderMessages);
registerRoute('/settings', renderSettings);
registerRoute('/archetype/:key', renderArchetypePage);
registerRoute('/training', renderTraining);
registerRoute('/training/:exerciseId', (c, p) => renderTraining(c, { exerciseId: p.exerciseId }));
registerRoute('/leaderboard', renderLeaderboard);

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
loadTeamFromServer();

// Idle coach — starts when developer profile is available
subscribe('developer', (dev) => {
  if (dev && dev.scores && dev.scores.length > 0) {
    startIdleCoach();
  } else {
    stopIdleCoach();
  }
});
