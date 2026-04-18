import './store.js';
import { registerRoute, initRouter } from './router.js';
import { createHeader } from './components/header.js';
import { renderLanding } from './pages/landing.js';
import { renderSearch } from './pages/search.js';
import { renderProfile } from './pages/profile.js';
import { renderTeamBuilder } from './pages/teamBuilder.js';
import { renderOnboarding } from './pages/onboarding.js';

const app = document.getElementById('app');

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

// Start router
initRouter();
