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

const FRONTEND_LANGS = new Set(['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte', 'Dart', 'SCSS', 'Less']);
const BACKEND_LANGS = new Set(['Python', 'Java', 'Go', 'Rust', 'C#', 'C++', 'C', 'Ruby', 'PHP', 'Kotlin', 'Swift', 'Elixir', 'Scala']);
const DEVOPS_LANGS = new Set(['Shell', 'Dockerfile', 'HCL', 'Nix', 'Makefile']);
const COMMON_TOPICS = new Set(['javascript', 'python', 'react', 'nodejs', 'html', 'css', 'api', 'web', 'app', 'project', 'learning', 'tutorial']);

async function fetchGitHubProfile(username) {
  if (!username || !GITHUB_USERNAME_RE.test(username)) {
    throw new Error('Invalid GitHub username');
  }

  // Parallel fetch: profile, repos, events, and contributed-to repos
  const [userRes, reposRes, eventsRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${username}`, { headers }),
    fetch(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=pushed&direction=desc`, { headers }),
    fetch(`${GITHUB_API}/users/${username}/events/public?per_page=100`, { headers }).catch(() => null)
  ]);

  if (!userRes.ok) {
    console.error(`GitHub API error for ${username}: ${userRes.status} ${userRes.statusText}`);
    throw new Error('GitHub user not found');
  }

  const user = await userRes.json();
  const repos = await reposRes.json();
  const events = eventsRes?.ok ? await eventsRes.json() : [];

  // --- Fetch detailed language breakdown for top repos (parallel, max 5) ---
  const topRepos = repos.filter(r => !r.fork && r.size > 10).slice(0, 5);
  const languageDetails = await Promise.all(
    topRepos.map(repo =>
      fetch(`${GITHUB_API}/repos/${repo.full_name}/languages`, { headers, signal: AbortSignal.timeout(3000) })
        .then(r => r.ok ? r.json() : {})
        .catch(() => ({}))
    )
  );

  // --- Extract comprehensive metrics ---

  const languageSet = new Set();
  const languageBytes = {};
  let totalSizeKB = 0;
  let totalStars = 0;
  let totalForks = 0;
  let totalWatchers = 0;
  let reposWithDescription = 0;
  let reposWithTopics = 0;
  let reposWithLicense = 0;
  let reposWithHomepage = 0;
  let originalRepos = 0;
  let substantialRepos = 0;
  let largeRepos = 0;
  const topicSet = new Set();

  const now = new Date();
  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(now.getMonth() - 6);
  const threeMonthsAgo = new Date(now); threeMonthsAgo.setMonth(now.getMonth() - 3);
  const oneMonthAgo = new Date(now); oneMonthAgo.setMonth(now.getMonth() - 1);
  let recentRepos6m = 0;
  let recentRepos3m = 0;
  let recentRepos1m = 0;

  for (const repo of repos) {
    if (repo.language) languageSet.add(repo.language);
    if (repo.topics) repo.topics.forEach(t => topicSet.add(t));
    totalSizeKB += repo.size || 0;
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
    totalWatchers += repo.watchers_count || 0;
    if (repo.description && repo.description.length > 5) reposWithDescription++;
    if (repo.topics && repo.topics.length > 0) reposWithTopics++;
    if (repo.license) reposWithLicense++;
    if (repo.homepage) reposWithHomepage++;
    if (!repo.fork) originalRepos++;
    if (repo.size > 5) substantialRepos++;
    if (repo.size > 500) largeRepos++;

    const updated = new Date(repo.pushed_at || repo.updated_at);
    if (updated > sixMonthsAgo) recentRepos6m++;
    if (updated > threeMonthsAgo) recentRepos3m++;
    if (updated > oneMonthAgo) recentRepos1m++;
  }

  // Merge language bytes from detailed breakdown
  for (const langObj of languageDetails) {
    for (const [lang, bytes] of Object.entries(langObj)) {
      languageSet.add(lang);
      languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
    }
  }

  // Events analysis
  let pushEvents = 0;
  let prEvents = 0;
  let prMergedEvents = 0;
  let reviewEvents = 0;
  let issueEvents = 0;
  let issueCommentEvents = 0;
  let createEvents = 0;
  const externalContribRepos = new Set();
  const pushDays = new Set();

  for (const event of events) {
    const eventDate = new Date(event.created_at);
    switch (event.type) {
      case 'PushEvent':
        pushEvents++;
        pushDays.add(eventDate.toISOString().split('T')[0]);
        break;
      case 'PullRequestEvent':
        prEvents++;
        if (event.payload?.action === 'closed' && event.payload?.pull_request?.merged) prMergedEvents++;
        break;
      case 'PullRequestReviewEvent': reviewEvents++; break;
      case 'IssuesEvent': issueEvents++; break;
      case 'IssueCommentEvent': issueCommentEvents++; break;
      case 'CreateEvent': createEvents++; break;
    }
    // Track contributions to OTHER people's repos
    if (event.repo && !event.repo.name.startsWith(username + '/')) {
      externalContribRepos.add(event.repo.name);
    }
  }

  const accountAgeMonths = Math.max(1, Math.floor((now - new Date(user.created_at)) / (30 * 24 * 60 * 60 * 1000)));
  const activeDays = pushDays.size; // unique days with pushes in last 90 days
  const repoCount = repos.length;
  const n = Math.max(1, repoCount);

  // ============================================================
  //  SCORING — each pillar: base 2 + up to 8 points from metrics
  // ============================================================

  // --- CODE: Technical depth, production volume, quality signals ---
  const sizeLog = Math.min(2.5, Math.log2(Math.max(1, totalSizeKB / 100))); // 0-2.5 based on total code volume
  const substantialScore = Math.min(2, substantialRepos / 3); // having real projects
  const largeScore = Math.min(1, largeRepos / 2); // big projects bonus
  const starSignal = totalStars >= 100 ? 2.5 : totalStars >= 30 ? 2 : totalStars >= 10 ? 1.5 : totalStars >= 3 ? 1 : totalStars >= 1 ? 0.5 : 0;
  const code = Math.min(10, Math.round(2 + sizeLog + substantialScore + largeScore + starSignal));

  // --- VELOCITY: Delivery speed, consistency, regularity ---
  const recentScore = Math.min(2, recentRepos6m / 3); // active in last 6 months
  const burstScore = Math.min(1.5, recentRepos1m * 0.75); // very recent activity
  const pushConsistency = Math.min(2, activeDays / 10); // spread of activity (not just 1 big push day)
  const productivityRate = Math.min(1.5, (repoCount / accountAgeMonths) * 2); // repos/month
  const prDelivery = Math.min(1, prMergedEvents / 3); // merged PRs
  const velocity = Math.min(10, Math.round(2 + recentScore + burstScore + pushConsistency + productivityRate + prDelivery));

  // --- CRAFT: Code quality, polish, documentation, professionalism ---
  const descRate = reposWithDescription / n;
  const topicRate = reposWithTopics / n;
  const descScore = Math.min(2.5, descRate * 3.5); // repos with descriptions
  const topicScore = Math.min(1.5, topicRate * 2.5); // repos with topics
  const licenseScore = reposWithLicense >= 5 ? 1.5 : reposWithLicense >= 2 ? 1 : reposWithLicense >= 1 ? 0.5 : 0;
  const homepageScore = reposWithHomepage >= 3 ? 1.5 : reposWithHomepage >= 1 ? 0.8 : 0;
  const reviewGiven = Math.min(1, reviewEvents / 3); // gives code reviews = cares about quality
  const craft = Math.min(10, Math.round(2 + descScore + topicScore + licenseScore + homepageScore + reviewGiven));

  // --- COLLABORATION: Team play, community engagement, open source ---
  const forkedRepos = repos.filter(r => r.fork).length;
  const forkScore = Math.min(2, forkedRepos * 0.7); // contributes to others
  const externalScore = Math.min(2, externalContribRepos.size * 0.7); // events on other repos
  const prScore = Math.min(1.5, prEvents / 4); // opens PRs
  const reviewCollab = Math.min(1, reviewEvents / 3); // reviews others
  const issueScore = Math.min(1, (issueEvents + issueCommentEvents) / 5); // issue engagement
  const followerScore = user.followers >= 50 ? 1.5 : user.followers >= 10 ? 1 : user.followers >= 3 ? 0.5 : 0;
  const collaboration = Math.min(10, Math.round(2 + forkScore + externalScore + prScore + reviewCollab + issueScore + followerScore));

  // --- VERSATILITY: Language & domain diversity, full-stack capability ---
  const langCount = languageSet.size;
  const langScore = Math.min(2.5, langCount * 0.5); // raw language count
  const hasFrontend = [...languageSet].some(l => FRONTEND_LANGS.has(l));
  const hasBackend = [...languageSet].some(l => BACKEND_LANGS.has(l));
  const hasDevOps = [...languageSet].some(l => DEVOPS_LANGS.has(l));
  const stackBonus = (hasFrontend && hasBackend ? 2 : 0) + (hasDevOps ? 1 : 0); // full-stack + devops
  const topicDiversity = Math.min(1.5, topicSet.size / 4); // topic breadth
  // Dominant language ratio — penalize if >80% is one language
  const totalBytes = Object.values(languageBytes).reduce((s, v) => s + v, 0);
  const maxBytes = Math.max(...Object.values(languageBytes), 0);
  const dominanceRatio = totalBytes > 0 ? maxBytes / totalBytes : 1;
  const diversityBonus = dominanceRatio < 0.5 ? 1 : dominanceRatio < 0.7 ? 0.5 : 0;
  const versatility = Math.min(10, Math.round(2 + langScore + stackBonus + topicDiversity + diversityBonus));

  // --- CREATIVITY: Originality, innovation, unique projects ---
  const uniqueTopics = [...topicSet].filter(t => !COMMON_TOPICS.has(t));
  const uniqueTopicScore = Math.min(2, uniqueTopics.length * 0.4); // non-generic topics
  const originalScore = Math.min(2.5, originalRepos / 3); // original (non-fork) work
  const personalProjects = repos.filter(r => !r.fork && r.size > 10 && !r.description?.toLowerCase().includes('tutorial')).length;
  const personalScore = Math.min(2, personalProjects / 3); // original projects (not tutorials)
  const createScore = Math.min(1, createEvents / 5); // creates new things
  const creativity = Math.min(10, Math.round(2 + originalScore + uniqueTopicScore + personalScore + createScore));

  // --- AUTONOMY: Self-sufficiency, independence, documentation ---
  const originalRate = originalRepos / n;
  const originalRateScore = Math.min(2, originalRate * 3); // high % of original repos
  const documentedRepos = repos.filter(r => r.description && r.description.length > 10 && r.size > 10).length;
  const documentedScore = Math.min(2, documentedRepos / 3); // well-described repos
  const structuredRepos = repos.filter(r => !r.fork && r.size > 50 && r.description).length;
  const structuredScore = Math.min(1.5, structuredRepos / 2); // structured projects
  const ageScore = Math.min(1.5, accountAgeMonths / 24); // experience over time
  const soloRepos = repos.filter(r => !r.fork && r.forks_count === 0 && r.size > 20).length;
  const soloScore = Math.min(1, soloRepos / 4); // builds alone
  const autonomy = Math.min(10, Math.round(2 + originalRateScore + documentedScore + structuredScore + ageScore + soloScore));

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
