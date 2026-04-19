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

  // --- Fetch detailed language breakdown + READMEs for top repos (parallel, max 5) ---
  const topRepos = repos.filter(r => !r.fork && r.size > 10).slice(0, 5);

  const [languageDetails, readmeDetails] = await Promise.all([
    // Languages per repo
    Promise.all(topRepos.map(repo =>
      fetch(`${GITHUB_API}/repos/${repo.full_name}/languages`, { headers, signal: AbortSignal.timeout(3000) })
        .then(r => r.ok ? r.json() : {})
        .catch(() => ({}))
    )),
    // README content per repo
    Promise.all(topRepos.map(repo =>
      fetch(`${GITHUB_API}/repos/${repo.full_name}/readme`, { headers, signal: AbortSignal.timeout(3000) })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data || !data.content) return null;
          try { return Buffer.from(data.content, 'base64').toString('utf-8'); } catch { return null; }
        })
        .catch(() => null)
    ))
  ]);

  // --- Analyze README quality ---
  let readmeScores = { hasReadme: 0, hasInstall: 0, hasUsage: 0, hasScreenshot: 0, hasLicense: 0, avgLength: 0 };
  let totalReadmeLength = 0;

  for (const readme of readmeDetails) {
    if (!readme) continue;
    readmeScores.hasReadme++;
    totalReadmeLength += readme.length;
    const lower = readme.toLowerCase();
    if (lower.includes('install') || lower.includes('setup') || lower.includes('getting started') || lower.includes('npm install') || lower.includes('pip install')) readmeScores.hasInstall++;
    if (lower.includes('usage') || lower.includes('how to use') || lower.includes('example') || lower.includes('utilisation')) readmeScores.hasUsage++;
    if (lower.includes('screenshot') || lower.includes('![') || lower.includes('demo') || lower.includes('.gif') || lower.includes('.png')) readmeScores.hasScreenshot++;
    if (lower.includes('license') || lower.includes('licence') || lower.includes('mit') || lower.includes('apache')) readmeScores.hasLicense++;
  }
  readmeScores.avgLength = readmeScores.hasReadme > 0 ? totalReadmeLength / readmeScores.hasReadme : 0;

  // --- Analyze project structure from repos ---
  let projectStructureScore = 0;
  for (const repo of topRepos) {
    let repoScore = 0;
    if (repo.description && repo.description.length > 10) repoScore++;
    if (repo.license) repoScore++;
    if (repo.homepage) repoScore++;
    if (repo.topics && repo.topics.length > 0) repoScore++;
    if (repo.size > 50) repoScore++; // substantial code
    projectStructureScore += repoScore;
  }
  const avgProjectStructure = topRepos.length > 0 ? projectStructureScore / topRepos.length : 0;

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
  const activeDays = pushDays.size;
  const repoCount = repos.length;
  const n = Math.max(1, repoCount);

  // ============================================================
  //  DEV STYLE DETECTION — Real Dev vs Vibe Coder vs IA Architect
  // ============================================================

  // Analyze commit messages from push events
  let totalCommits = 0;
  let genericCommitMsgs = 0;
  let descriptiveCommitMsgs = 0;
  let aiCoauthoredCommits = 0;
  let commitSizes = [];

  function analyzeCommitMsg(msg) {
    const lower = (msg || '').toLowerCase();
    totalCommits++;
    if (lower.length < 10 || /^(update|fix|init|wip|test|\.+|merge|commit|changes|stuff|misc)$/i.test(lower.trim()) || lower === 'initial commit') {
      genericCommitMsgs++;
    }
    if (lower.length >= 20 && /\b(add|fix|implement|refactor|update|remove|create|improve|migrate|configure)\b/i.test(lower)) {
      descriptiveCommitMsgs++;
    }
    if (lower.includes('co-authored-by') && (lower.includes('claude') || lower.includes('copilot') || lower.includes('gpt') || lower.includes('anthropic') || lower.includes('openai'))) {
      aiCoauthoredCommits++;
    }
  }

  // Source 1: Push events
  for (const event of events) {
    if (event.type === 'PushEvent' && event.payload?.commits) {
      commitSizes.push(event.payload.commits.length);
      for (const commit of event.payload.commits) {
        analyzeCommitMsg(commit.message);
      }
    }
  }

  // Source 2: If events gave few commits, fetch directly from top repos
  if (totalCommits < 10) {
    const commitFetches = await Promise.all(
      topRepos.slice(0, 3).map(repo =>
        fetch(`${GITHUB_API}/repos/${repo.full_name}/commits?per_page=30`, { headers, signal: AbortSignal.timeout(3000) })
          .then(r => r.ok ? r.json() : [])
          .catch(() => [])
      )
    );
    for (const commits of commitFetches) {
      for (const c of commits) {
        analyzeCommitMsg(c.commit?.message);
      }
    }
  }

  // Commit granularity: real devs do small incremental commits, vibe coders do huge dumps
  const avgCommitsPerPush = commitSizes.length > 0 ? commitSizes.reduce((a, b) => a + b, 0) / commitSizes.length : 0;
  const hasHugePushes = commitSizes.some(s => s > 20); // 20+ commits in one push = suspicious

  // Language depth analysis
  const totalBytesAll = Object.values(languageBytes).reduce((s, v) => s + v, 0);
  const langArray = Object.entries(languageBytes).sort((a, b) => b[1] - a[1]);
  const primaryLangBytes = langArray[0]?.[1] || 0;
  const primaryLangName = langArray[0]?.[0] || 'unknown';
  const primaryLangRatio = totalBytesAll > 0 ? primaryLangBytes / totalBytesAll : 1;

  // Depth indicators: using advanced/niche languages
  const NICHE_LANGS = new Set(['Rust', 'Haskell', 'Elixir', 'Clojure', 'OCaml', 'Zig', 'Nim', 'Crystal', 'Erlang']);
  const SYSTEM_LANGS = new Set(['C', 'C++', 'Rust', 'Go', 'Assembly']);
  const hasNicheLang = [...languageSet].some(l => NICHE_LANGS.has(l));
  const hasSystemLang = [...languageSet].some(l => SYSTEM_LANGS.has(l));

  // Dev style classification
  const commitDescriptiveRate = totalCommits > 0 ? descriptiveCommitMsgs / totalCommits : 0;
  const commitGenericRate = totalCommits > 0 ? genericCommitMsgs / totalCommits : 0;
  const aiRate = totalCommits > 0 ? aiCoauthoredCommits / totalCommits : 0;

  // Repo maturity: repos that evolved over time (multiple pushes) vs one-shot repos
  const reposWithMultiplePushes = repos.filter(r => {
    const created = new Date(r.created_at);
    const pushed = new Date(r.pushed_at || r.updated_at);
    return (pushed - created) > 7 * 24 * 60 * 60 * 1000; // pushed at least 7 days after creation
  }).length;
  const maturityRate = reposWithMultiplePushes / n;

  // ============================================================
  //  AI USAGE QUALITY — Bonus/malus based on HOW AI is used
  // ============================================================

  let aiUsageQuality = 'none'; // none, poor, decent, excellent
  let aiQualityScore = 0; // -1 to +1.5

  if (aiRate > 0) {
    // Uses AI — evaluate HOW
    const aiWithDescriptiveMsg = aiRate > 0 && commitDescriptiveRate > 0.3;
    const mixedApproach = aiRate > 0.1 && aiRate < 0.8; // not 100% AI
    const aiWithReadme = aiRate > 0 && readmeScores.hasReadme > 0;
    const aiWithStructure = aiRate > 0 && avgProjectStructure >= 3;
    const aiWithMaturity = aiRate > 0 && maturityRate > 0.3;

    const aiSignals = [aiWithDescriptiveMsg, mixedApproach, aiWithReadme, aiWithStructure, aiWithMaturity];
    const aiGoodSignals = aiSignals.filter(Boolean).length;

    if (aiGoodSignals >= 4) {
      // Excellent IA usage: descriptive commits, hybrid approach, README, good structure, mature repos
      aiUsageQuality = 'excellent';
      aiQualityScore = 1.5;
    } else if (aiGoodSignals >= 2) {
      aiUsageQuality = 'decent';
      aiQualityScore = 0.5;
    } else {
      // Bad IA usage: 100% AI, generic messages, no docs, one-shot repos
      aiUsageQuality = 'poor';
      aiQualityScore = -1;
    }
  }

  // ============================================================
  //  SCORING V4 — Strict. Base 1, max 10. 8+ = rare. 9+ = exceptional.
  //  Target distribution: average ~5, 8+ = top 15%, 9+ = top 5%
  // ============================================================

  // --- CODE: Technical depth, production volume, quality signals ---
  const sizeLog = Math.min(2, Math.log2(Math.max(1, totalSizeKB / 200))); // harder curve
  const substantialScore = Math.min(1.5, substantialRepos / 4);
  const largeScore = Math.min(1, largeRepos / 3);
  const starSignal = totalStars >= 200 ? 3 : totalStars >= 50 ? 2.5 : totalStars >= 20 ? 2 : totalStars >= 10 ? 1.5 : totalStars >= 5 ? 1 : totalStars >= 1 ? 0.5 : 0;
  const codeQuality = Math.min(1.5, repos.filter(r => !r.fork && r.size > 100 && r.description && r.description.length > 20).length / 3);
  const readmeCodeBonus = Math.min(1, (readmeScores.hasInstall + readmeScores.hasUsage) / 4);
  const depthBonus = (hasSystemLang ? 0.5 : 0) + (hasNicheLang ? 0.5 : 0); // deep technical knowledge
  const maturityBonus = Math.min(1, maturityRate * 1.5); // repos that evolved over time = real projects
  // IA architect who documents and structures well → code bonus
  const aiCodeBonus = aiUsageQuality === 'excellent' ? 1 : aiUsageQuality === 'poor' ? -0.5 : 0;
  const code = Math.min(10, Math.round(1 + sizeLog + substantialScore + largeScore + starSignal + codeQuality + readmeCodeBonus + depthBonus + maturityBonus + aiCodeBonus));

  // --- VELOCITY: Delivery speed, consistency, regularity ---
  const recentScore = Math.min(1.5, recentRepos6m / 4);
  const burstScore = Math.min(1, recentRepos1m * 0.5);
  const pushConsistency = Math.min(2.5, activeDays / 12); // need 30 active days for max
  const productivityRate = Math.min(1, (repoCount / Math.max(6, accountAgeMonths)) * 1.5);
  const prDelivery = Math.min(1.5, prMergedEvents / 5);
  const commitDensity = Math.min(1.5, pushEvents / 20);
  // Penalize huge single pushes (vibe coder pattern: dump 50 files at once)
  const pushGranularity = hasHugePushes ? -0.5 : (avgCommitsPerPush <= 5 ? 0.5 : 0);
  const velocity = Math.min(10, Math.round(1 + recentScore + burstScore + pushConsistency + productivityRate + prDelivery + commitDensity + pushGranularity));

  // --- CRAFT: Code quality, polish, documentation, professionalism ---
  const descRate = reposWithDescription / n;
  const topicRate = reposWithTopics / n;
  const descScore = Math.min(2, descRate * 2.5);
  const topicScore = Math.min(1.5, topicRate * 2);
  const licenseScore = reposWithLicense >= 5 ? 1.5 : reposWithLicense >= 3 ? 1 : reposWithLicense >= 1 ? 0.5 : 0;
  const homepageScore = reposWithHomepage >= 3 ? 1 : reposWithHomepage >= 1 ? 0.5 : 0;
  const reviewGiven = Math.min(1.5, reviewEvents / 5);
  const descQuality = Math.min(1, repos.filter(r => r.description && r.description.length > 30).length / 5);
  // README quality: install instructions, usage examples, screenshots = high craft
  const readmeCraftBonus = Math.min(2, (
    (readmeScores.hasInstall > 0 ? 0.5 : 0) +
    (readmeScores.hasUsage > 0 ? 0.5 : 0) +
    (readmeScores.hasScreenshot > 0 ? 0.5 : 0) +
    (readmeScores.avgLength > 500 ? 0.5 : readmeScores.avgLength > 200 ? 0.25 : 0)
  ));
  // Commit message quality = craft signal (descriptive vs generic)
  const commitMsgQuality = Math.min(1, commitDescriptiveRate * 2); // descriptive messages = high craft
  const commitMsgPenalty = commitGenericRate > 0.7 ? -0.5 : 0; // >70% generic = lazy
  // Good AI usage with proper documentation = craft discipline
  const aiCraftBonus = aiUsageQuality === 'excellent' ? 1 : aiUsageQuality === 'poor' ? -1 : 0;
  const craft = Math.min(10, Math.round(1 + descScore + topicScore + licenseScore + homepageScore + reviewGiven + descQuality + readmeCraftBonus + commitMsgQuality + commitMsgPenalty + aiCraftBonus));

  // --- COLLABORATION: Team play, community engagement, open source ---
  const forkedRepos = repos.filter(r => r.fork).length;
  const forkScore = Math.min(1.5, forkedRepos * 0.5);
  const externalScore = Math.min(2, externalContribRepos.size * 0.5);
  const prScore = Math.min(1.5, prEvents / 5);
  const reviewCollab = Math.min(1.5, reviewEvents / 5);
  const issueScore = Math.min(1, (issueEvents + issueCommentEvents) / 8);
  const followerScore = user.followers >= 100 ? 1.5 : user.followers >= 30 ? 1 : user.followers >= 10 ? 0.5 : 0;
  const collaboration = Math.min(10, Math.round(1 + forkScore + externalScore + prScore + reviewCollab + issueScore + followerScore));

  // --- VERSATILITY: Language & domain diversity, full-stack capability ---
  const langCount = languageSet.size;
  const langScore = Math.min(2, langCount * 0.35); // need 6+ langs for max
  const hasFrontend = [...languageSet].some(l => FRONTEND_LANGS.has(l));
  const hasBackend = [...languageSet].some(l => BACKEND_LANGS.has(l));
  const hasDevOps = [...languageSet].some(l => DEVOPS_LANGS.has(l));
  const stackBonus = (hasFrontend && hasBackend ? 1.5 : 0) + (hasDevOps ? 0.5 : 0);
  const topicDiversity = Math.min(1.5, topicSet.size / 5);
  const totalBytes = Object.values(languageBytes).reduce((s, v) => s + v, 0);
  const maxBytes = Math.max(...Object.values(languageBytes), 0);
  const dominanceRatio = totalBytes > 0 ? maxBytes / totalBytes : 1;
  const diversityBonus = dominanceRatio < 0.4 ? 1.5 : dominanceRatio < 0.6 ? 1 : dominanceRatio < 0.75 ? 0.5 : 0;
  // Penalize single-language devs harder
  const langPenalty = langCount <= 1 ? -1 : langCount <= 2 ? -0.5 : 0;
  const versatility = Math.min(10, Math.max(1, Math.round(1 + langScore + stackBonus + topicDiversity + diversityBonus + langPenalty)));

  // --- CREATIVITY: Originality, innovation, unique projects ---
  const uniqueTopics = [...topicSet].filter(t => !COMMON_TOPICS.has(t));
  const uniqueTopicScore = Math.min(1.5, uniqueTopics.length * 0.3);
  const originalScore = Math.min(2, originalRepos / 4);
  const personalProjects = repos.filter(r => !r.fork && r.size > 20 && !r.description?.toLowerCase().includes('tutorial') && !r.description?.toLowerCase().includes('course') && !r.description?.toLowerCase().includes('udemy')).length;
  const personalScore = Math.min(2, personalProjects / 4);
  const createScore = Math.min(1, createEvents / 8);
  // Penalize if most repos are forks (not creative)
  const forkRatio = forkedRepos / n;
  const forkPenalty = forkRatio > 0.7 ? -1.5 : forkRatio > 0.5 ? -1 : forkRatio > 0.3 ? -0.5 : 0;
  // Repos that evolved = creative iteration (not one-shot AI dump)
  const iterationBonus = Math.min(1, maturityRate * 1.5);
  const creativity = Math.min(10, Math.max(1, Math.round(1 + originalScore + uniqueTopicScore + personalScore + createScore + forkPenalty + iterationBonus)));

  // --- AUTONOMY: Self-sufficiency, independence, documentation ---
  const originalRate = originalRepos / n;
  const originalRateScore = Math.min(2, originalRate * 2.5);
  const documentedRepos = repos.filter(r => r.description && r.description.length > 15 && r.size > 20).length;
  const documentedScore = Math.min(2, documentedRepos / 4);
  const structuredRepos = repos.filter(r => !r.fork && r.size > 100 && r.description).length;
  const structuredScore = Math.min(1.5, structuredRepos / 3);
  const ageScore = Math.min(1.5, accountAgeMonths / 24); // experience over time
  const soloRepos = repos.filter(r => !r.fork && r.forks_count === 0 && r.size > 20).length;
  const soloScore = Math.min(1, soloRepos / 4); // builds alone
  // README = proof of autonomy (you document your own work)
  const readmeAutonomyBonus = Math.min(1.5, readmeScores.hasReadme * 0.4);
  const projectStructureBonus = Math.min(1, avgProjectStructure / 4); // well-structured projects
  const autonomy = Math.min(10, Math.round(1 + originalRateScore + documentedScore + structuredScore + ageScore + soloScore + readmeAutonomyBonus + projectStructureBonus));

  // --- IA MASTERY: How well the dev uses AI as a tool ---
  // 5 = neutral (no AI). <5 = bad AI usage. >5 = good AI usage. 10 = IA Architect.
  let ia = 5; // neutral baseline

  if (aiRate > 0) {
    // Uses AI — evaluate quality
    ia = 1; // start from 1 for AI users, earn your way up

    // Signal 1: Descriptive commits even with AI (+2) — means you understand what AI generates
    if (commitDescriptiveRate > 0.5) ia += 2;
    else if (commitDescriptiveRate > 0.25) ia += 1;

    // Signal 2: Hybrid approach — not 100% AI (+1.5) — AI is a tool, not a crutch
    if (aiRate >= 0.1 && aiRate <= 0.7) ia += 1.5;
    else if (aiRate > 0.9) ia -= 1; // 90%+ AI = probably can't code without it

    // Signal 3: Documentation exists (+1.5) — IA Architect documents, vibe coder doesn't
    if (readmeScores.hasReadme >= 2) ia += 1.5;
    else if (readmeScores.hasReadme >= 1) ia += 0.75;

    // Signal 4: Good project structure despite AI (+1) — architecture skills
    if (avgProjectStructure >= 3.5) ia += 1;
    else if (avgProjectStructure >= 2) ia += 0.5;

    // Signal 5: Repo maturity — iterates on AI output vs one-shot dump (+1.5)
    if (maturityRate > 0.5) ia += 1.5;
    else if (maturityRate > 0.25) ia += 0.75;
    else ia -= 0.5; // one-shot repos = bad AI workflow

    // Signal 6: Code volume with AI — produces substantial code (+1)
    if (substantialRepos >= 5 && aiRate > 0.1) ia += 1;

    // Penalty: generic commits + AI = copy-paste monkey
    if (commitGenericRate > 0.7 && aiRate > 0.3) ia -= 1.5;
  }
  // No AI at all → stays at 5 (neutral, not penalized)

  ia = Math.min(10, Math.max(1, Math.round(ia)));


  let devStyle = 'traditional'; // default
  let devStyleConfidence = 'low';

  if (aiRate > 0.3) {
    // >30% of commits are AI co-authored → IA Architect
    devStyle = 'ia-architect';
    devStyleConfidence = aiRate > 0.6 ? 'high' : 'medium';
  } else if (
    commitGenericRate > 0.6 &&
    hasHugePushes &&
    readmeScores.hasReadme === 0 &&
    maturityRate < 0.3
  ) {
    // Generic commits + huge pushes + no README + one-shot repos → Vibe Coder
    devStyle = 'vibe-coder';
    devStyleConfidence = commitGenericRate > 0.8 ? 'high' : 'medium';
  } else if (
    commitDescriptiveRate > 0.4 &&
    !hasHugePushes &&
    maturityRate > 0.4
  ) {
    // Descriptive commits + granular pushes + mature repos → Real Dev
    devStyle = 'traditional';
    devStyleConfidence = commitDescriptiveRate > 0.6 ? 'high' : 'medium';
  }

  return {
    username: user.login,
    name: user.name || user.login,
    avatar_url: user.avatar_url,
    languages: Array.from(languageSet),
    dev_style: devStyle,
    dev_style_confidence: devStyleConfidence,
    ai_usage_quality: aiUsageQuality,
    dev_metrics: {
      commit_descriptive_rate: Math.round(commitDescriptiveRate * 100),
      commit_generic_rate: Math.round(commitGenericRate * 100),
      ai_coauthored_rate: Math.round(aiRate * 100),
      avg_commits_per_push: Math.round(avgCommitsPerPush * 10) / 10,
      repo_maturity_rate: Math.round(maturityRate * 100),
      primary_language: primaryLangName,
      primary_language_ratio: Math.round(primaryLangRatio * 100),
      has_niche_lang: hasNicheLang,
      has_system_lang: hasSystemLang,
      readme_quality: readmeScores,
      ai_usage_quality: aiUsageQuality,
      ai_quality_score: aiQualityScore
    },
    scores: [
      { pillar: 'code', score: Math.max(1, code) },
      { pillar: 'velocity', score: Math.max(1, velocity) },
      { pillar: 'craft', score: Math.max(1, craft) },
      { pillar: 'collaboration', score: Math.max(1, collaboration) },
      { pillar: 'versatility', score: Math.max(1, versatility) },
      { pillar: 'creativity', score: Math.max(1, creativity) },
      { pillar: 'autonomy', score: Math.max(1, autonomy) },
      { pillar: 'ia', score: Math.max(1, ia) }
    ]
  };
}

export { fetchGitHubProfile };
