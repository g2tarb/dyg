import dotenv from 'dotenv';

dotenv.config();

const GITHUB_API = 'https://api.github.com';
const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'DYG-App'
};

if (process.env.GITHUB_PAT && process.env.GITHUB_PAT !== 'your_github_personal_access_token') {
  headers['Authorization'] = `Bearer ${process.env.GITHUB_PAT}`;
}

const GITHUB_USERNAME_RE = /^[a-z0-9]([a-z0-9-]{0,37}[a-z0-9])?$/i;

// Frontend + backend language detection for full-stack bonus
const FRONTEND_LANGS = new Set(['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte', 'Dart']);
const BACKEND_LANGS = new Set(['Python', 'Java', 'Go', 'Rust', 'C#', 'C++', 'C', 'Ruby', 'PHP', 'Kotlin', 'Swift', 'Elixir']);
const COMMON_TOPICS = new Set(['javascript', 'python', 'react', 'nodejs', 'html', 'css', 'api', 'web', 'app', 'project']);

async function fetchGitHubProfile(username) {
  if (!username || !GITHUB_USERNAME_RE.test(username)) {
    throw new Error('Invalid GitHub username');
  }

  // Fetch profile, repos, and recent events in parallel
  const [userRes, reposRes, eventsRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${username}`, { headers }),
    fetch(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`, { headers }),
    fetch(`${GITHUB_API}/users/${username}/events/public?per_page=100`, { headers }).catch(() => null)
  ]);

  if (!userRes.ok) {
    console.error(`GitHub API error for ${username}: ${userRes.status} ${userRes.statusText}`);
    throw new Error('GitHub user not found');
  }

  const user = await userRes.json();
  const repos = await reposRes.json();
  const events = eventsRes?.ok ? await eventsRes.json() : [];

  // --- Extract raw metrics ---

  const languageSet = new Set();
  const topicSet = new Set();
  let totalSizeKB = 0;
  let totalStars = 0;
  let totalForks = 0;
  let reposWithDescription = 0;
  let reposWithTopics = 0;
  let reposWithLicense = 0;
  let reposWithHomepage = 0;
  let originalRepos = 0;
  let substantialRepos = 0; // repos with actual code (>5KB)

  const now = new Date();
  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(now.getMonth() - 6);
  const oneMonthAgo = new Date(now); oneMonthAgo.setMonth(now.getMonth() - 1);
  let recentRepos = 0;    // updated in 6 months
  let veryRecentRepos = 0; // updated in 1 month

  for (const repo of repos) {
    if (repo.language) languageSet.add(repo.language);
    if (repo.topics) repo.topics.forEach(t => topicSet.add(t));
    totalSizeKB += repo.size || 0;
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
    if (repo.description) reposWithDescription++;
    if (repo.topics && repo.topics.length > 0) reposWithTopics++;
    if (repo.license) reposWithLicense++;
    if (repo.homepage) reposWithHomepage++;
    if (!repo.fork) originalRepos++;
    if (repo.size > 5) substantialRepos++;
    if (new Date(repo.updated_at) > sixMonthsAgo) recentRepos++;
    if (new Date(repo.updated_at) > oneMonthAgo) veryRecentRepos++;
  }

  // Events analysis (last 90 days of activity)
  let pushEvents = 0;
  let prEvents = 0;
  let reviewEvents = 0;
  let issueCommentEvents = 0;
  let createEvents = 0;
  const contributedRepos = new Set();

  for (const event of events) {
    switch (event.type) {
      case 'PushEvent': pushEvents++; break;
      case 'PullRequestEvent': prEvents++; break;
      case 'PullRequestReviewEvent': reviewEvents++; break;
      case 'IssueCommentEvent': issueCommentEvents++; break;
      case 'CreateEvent': createEvents++; break;
    }
    if (event.repo) contributedRepos.add(event.repo.name);
  }

  // Account age in months
  const accountAge = Math.max(1, Math.floor((now - new Date(user.created_at)) / (30 * 24 * 60 * 60 * 1000)));

  // --- Calculate pillar scores ---

  // CODE: Technical depth & production volume
  const sizeScore = Math.min(3, Math.log2(Math.max(1, totalSizeKB / 50)));
  const repoQuality = Math.min(3, substantialRepos / 2);
  const starSignal = totalStars >= 50 ? 2 : totalStars >= 10 ? 1.5 : totalStars >= 3 ? 1 : totalStars >= 1 ? 0.5 : 0;
  const forkSignal = totalForks >= 10 ? 1 : totalForks >= 3 ? 0.5 : 0;
  const code = Math.min(10, Math.round(2 + sizeScore + repoQuality + starSignal + forkSignal));

  // VELOCITY: Delivery speed & consistency
  const recentActivity = Math.min(3, recentRepos / 2);
  const burstActivity = Math.min(2, veryRecentRepos);
  const pushRate = Math.min(2, pushEvents / 10);
  const productivityRate = Math.min(1.5, (repos.length / Math.max(1, accountAge)) * 3);
  const velocity = Math.min(10, Math.round(2 + recentActivity + burstActivity + pushRate + productivityRate));

  // CRAFT: Code quality & polish
  const descRate = repos.length > 0 ? reposWithDescription / repos.length : 0;
  const topicRate = repos.length > 0 ? reposWithTopics / repos.length : 0;
  const licenseBonus = reposWithLicense >= 3 ? 1.5 : reposWithLicense >= 1 ? 0.8 : 0;
  const homepageBonus = reposWithHomepage >= 2 ? 1 : reposWithHomepage >= 1 ? 0.5 : 0;
  const craft = Math.min(10, Math.round(2 + descRate * 3 + topicRate * 2 + licenseBonus + homepageBonus));

  // COLLABORATION: Team play & community
  const forkedRepos = repos.filter(r => r.fork).length;
  const forkedScore = Math.min(2, forkedRepos * 0.8);
  const prScore = Math.min(2, prEvents / 3);
  const reviewScore = Math.min(1.5, reviewEvents / 2);
  const issueScore = Math.min(1, issueCommentEvents / 5);
  const followerRatio = user.followers > 0 ? Math.min(1.5, Math.log2(user.followers + 1) * 0.5) : 0;
  const collaboration = Math.min(10, Math.round(2 + forkedScore + prScore + reviewScore + issueScore + followerRatio));

  // VERSATILITY: Language & domain diversity
  const langCount = languageSet.size;
  const langScore = Math.min(3, langCount * 0.8);
  const hasFrontend = [...languageSet].some(l => FRONTEND_LANGS.has(l));
  const hasBackend = [...languageSet].some(l => BACKEND_LANGS.has(l));
  const fullStackBonus = hasFrontend && hasBackend ? 2 : 0;
  const topicDiversity = Math.min(2, topicSet.size / 3);
  const versatility = Math.min(10, Math.round(2 + langScore + fullStackBonus + topicDiversity));

  // CREATIVITY: Originality & innovation
  const uniqueTopics = [...topicSet].filter(t => !COMMON_TOPICS.has(t));
  const uniqueTopicScore = Math.min(2, uniqueTopics.length * 0.5);
  const originalScore = Math.min(3, originalRepos / 3);
  const personalProjects = repos.filter(r => !r.fork && r.size > 10 && r.stargazers_count === 0).length;
  const personalScore = Math.min(2, personalProjects / 2);
  const createScore = Math.min(1, createEvents / 5);
  const creativity = Math.min(10, Math.round(2 + originalScore + uniqueTopicScore + personalScore + createScore));

  // AUTONOMY: Self-sufficiency & independence
  const originalRate = repos.length > 0 ? originalRepos / repos.length : 0;
  const documentedRepos = repos.filter(r => r.description && r.size > 5).length;
  const documentedScore = Math.min(2.5, documentedRepos / 2);
  const structuredRepos = repos.filter(r => !r.fork && r.description && r.size > 20).length;
  const structuredScore = Math.min(2, structuredRepos / 2);
  const ageBonus = Math.min(1.5, accountAge / 24);
  const autonomy = Math.min(10, Math.round(2 + originalRate * 2 + documentedScore + structuredScore + ageBonus));

  return {
    username: user.login,
    name: user.name || user.login,
    avatar_url: user.avatar_url,
    languages: Array.from(languageSet),
    scores: [
      { pillar: 'code', score: Math.max(2, code) },
      { pillar: 'velocity', score: Math.max(2, velocity) },
      { pillar: 'craft', score: Math.max(2, craft) },
      { pillar: 'collaboration', score: Math.max(2, collaboration) },
      { pillar: 'versatility', score: Math.max(2, versatility) },
      { pillar: 'creativity', score: Math.max(2, creativity) },
      { pillar: 'autonomy', score: Math.max(2, autonomy) }
    ]
  };
}

export { fetchGitHubProfile };
