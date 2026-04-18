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

function hashUsername(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const GITHUB_USERNAME_RE = /^[a-z0-9]([a-z0-9-]{0,37}[a-z0-9])?$/i;

async function fetchGitHubProfile(username) {
  if (!username || !GITHUB_USERNAME_RE.test(username)) {
    throw new Error('Invalid GitHub username');
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${username}`, { headers }),
    fetch(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`, { headers })
  ]);

  if (!userRes.ok) {
    console.error(`GitHub API error for ${username}: ${userRes.status} ${userRes.statusText}`);
    throw new Error('GitHub user not found');
  }

  const user = await userRes.json();
  const repos = await reposRes.json();

  // Extract languages across all repos
  const languageSet = new Set();
  repos.forEach(repo => {
    if (repo.language) languageSet.add(repo.language);
  });

  // Calculate pillar scores from GitHub data
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
  const hasReadmes = repos.filter(r => r.description).length;

  // Code: based on repo count and quality signals
  const code = Math.min(10, Math.round(repos.length / 5 + (totalStars > 10 ? 2 : 0) + (totalForks > 5 ? 1 : 0)));

  // Velocity: based on recent activity (repos updated in last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentRepos = repos.filter(r => new Date(r.updated_at) > sixMonthsAgo).length;
  const velocity = Math.min(10, Math.round(recentRepos / 2 + (user.public_repos > 20 ? 2 : 0)));

  // Collaboration: based on forks and org membership
  const collaboration = Math.min(10, Math.round(totalForks / 3 + (repos.filter(r => r.fork).length > 2 ? 3 : 0)));

  // Versatility: based on language diversity
  const versatility = Math.min(10, Math.round(languageSet.size * 1.5));

  // Autonomy: based on repos with descriptions and non-fork original work
  const originalRepos = repos.filter(r => !r.fork).length;
  const autonomy = Math.min(10, Math.round(originalRepos / 4 + (hasReadmes > 5 ? 2 : 0)));

  // Craft & Creativity: deterministic from username (not measurable from GitHub)
  const h = hashUsername(username);
  const craft = (h % 4) + 5;
  const creativity = ((h >>> 8) % 4) + 4;

  return {
    username: user.login,
    name: user.name || user.login,
    avatar_url: user.avatar_url,
    languages: Array.from(languageSet),
    scores: [
      { pillar: 'code', score: Math.max(1, code) },
      { pillar: 'velocity', score: Math.max(1, velocity) },
      { pillar: 'craft', score: Math.max(1, craft) },
      { pillar: 'collaboration', score: Math.max(1, collaboration) },
      { pillar: 'versatility', score: Math.max(1, versatility) },
      { pillar: 'creativity', score: Math.max(1, creativity) },
      { pillar: 'autonomy', score: Math.max(1, autonomy) }
    ]
  };
}

export { fetchGitHubProfile };
