import pool from '../db/connection.js';
import { decrypt } from '../utils/crypto.js';

// Anonymize code content: strip emails, names, URLs, tokens
function anonymize(text) {
  if (!text) return '';
  return text
    // Emails
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    // URLs with tokens/keys
    .replace(/https?:\/\/[^\s"'`]+/g, (url) => {
      try {
        const u = new URL(url);
        u.search = '';
        u.hash = '';
        return u.toString();
      } catch { return '[URL]'; }
    })
    // API keys / tokens (long hex/base64 strings)
    .replace(/['"][a-zA-Z0-9+/=_-]{32,}['"]/g, '"[REDACTED]"')
    // IP addresses
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
    // Absolute paths
    .replace(/\/Users\/[^\s"'`]+/g, '[PATH]')
    .replace(/C:\\Users\\[^\s"'`]+/g, '[PATH]');
}

// Collect commits from a GitHub repo for a specific user during a project window
async function collectProjectContributions(projectId, userId) {
  // Check user consent
  const userResult = await pool.query(
    'SELECT data_consent, access_token, github_login FROM users WHERE id = $1',
    [userId]
  );
  if (userResult.rows.length === 0 || !userResult.rows[0].data_consent) return;

  const user = userResult.rows[0];
  const token = decrypt(user.access_token);

  // Get project info
  const projResult = await pool.query(
    'SELECT repo_url, started_at, ended_at FROM projects WHERE id = $1',
    [projectId]
  );
  if (projResult.rows.length === 0 || !projResult.rows[0].repo_url) return;

  const project = projResult.rows[0];
  const repoUrl = project.repo_url;

  // Parse owner/repo from URL
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return;
  const [, owner, repo] = match;

  // Get user's archetype
  const devResult = await pool.query(
    'SELECT archetype FROM developers WHERE user_id = $1',
    [userId]
  );
  if (devResult.rows.length === 0) return;
  const archetype = devResult.rows[0].archetype;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DYG-Collector'
  };

  const since = project.started_at ? `&since=${project.started_at}` : '';
  const until = project.ended_at ? `&until=${project.ended_at}` : '';

  try {
    // 1. Collect commits by this user
    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?author=${user.github_login}&per_page=50${since}${until}`,
      { headers }
    );
    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      for (const commit of commits.slice(0, 30)) {
        // Commit message
        if (commit.commit?.message) {
          await insertSample(userId, projectId, archetype, 'commit_message',
            anonymize(commit.commit.message), { sha: commit.sha?.slice(0, 8) });
        }

        // Commit diff (fetch individual commit for patch)
        try {
          const diffRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`,
            { headers, signal: AbortSignal.timeout(5000) }
          );
          if (diffRes.ok) {
            const detail = await diffRes.json();
            for (const file of (detail.files || []).slice(0, 10)) {
              if (file.patch && file.patch.length < 5000 && file.patch.length > 20) {
                const lang = detectLanguage(file.filename);
                await insertSample(userId, projectId, archetype, 'commit_diff',
                  anonymize(file.patch), { filename: anonymizeFilename(file.filename), additions: file.additions, deletions: file.deletions }, lang);
              }
            }
          }
        } catch { /* individual commit fetch failure is OK */ }
      }
    }

    // 2. Collect PRs by this user
    const prsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=20`,
      { headers }
    );
    if (prsRes.ok) {
      const prs = await prsRes.json();
      for (const pr of prs) {
        if (pr.user?.login !== user.github_login) continue;
        if (pr.body && pr.body.length > 10) {
          await insertSample(userId, projectId, archetype, 'pr_description',
            anonymize(pr.body), { pr_number: pr.number, state: pr.state });
        }
      }
    }

    // 3. Collect code reviews by this user
    const reviewsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=10`,
      { headers }
    );
    if (reviewsRes.ok) {
      const pulls = await reviewsRes.json();
      for (const pr of pulls.slice(0, 10)) {
        try {
          const revRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}/reviews`,
            { headers, signal: AbortSignal.timeout(5000) }
          );
          if (revRes.ok) {
            const reviews = await revRes.json();
            for (const review of reviews) {
              if (review.user?.login !== user.github_login) continue;
              if (review.body && review.body.length > 10) {
                await insertSample(userId, projectId, archetype, 'code_review',
                  anonymize(review.body), { pr_number: pr.number, state: review.state });
              }
            }
          }
        } catch { /* review fetch failure is OK */ }
      }
    }

    // 4. Collect file structure
    try {
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
        { headers, signal: AbortSignal.timeout(5000) }
      );
      if (treeRes.ok) {
        const tree = await treeRes.json();
        const paths = (tree.tree || [])
          .filter(t => t.type === 'blob')
          .map(t => anonymizeFilename(t.path))
          .slice(0, 200);
        if (paths.length > 5) {
          await insertSample(userId, projectId, archetype, 'file_structure',
            paths.join('\n'), { file_count: paths.length });
        }
      }
    } catch { /* tree fetch failure is OK */ }

    console.info(`[collector] Collected data for user ${user.github_login} on project ${projectId}`);
  } catch (err) {
    console.warn(`[collector] Failed for user ${user.github_login}:`, err.message);
  }
}

async function insertSample(userId, projectId, archetype, sampleType, content, metadata = {}, language = null) {
  if (!content || content.length < 10) return;
  await pool.query(`
    INSERT INTO code_samples (user_id, project_id, archetype, sample_type, content, metadata, language, anonymized)
    VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
  `, [userId, projectId, archetype, sampleType, content.slice(0, 10000), JSON.stringify(metadata), language]);
}

function detectLanguage(filename) {
  const ext = (filename || '').split('.').pop()?.toLowerCase();
  const map = {
    js: 'JavaScript', ts: 'TypeScript', py: 'Python', rb: 'Ruby',
    go: 'Go', rs: 'Rust', java: 'Java', cs: 'C#', cpp: 'C++',
    c: 'C', php: 'PHP', swift: 'Swift', kt: 'Kotlin', dart: 'Dart',
    lua: 'Lua', gd: 'GDScript', glsl: 'GLSL', css: 'CSS', html: 'HTML',
    sql: 'SQL', sh: 'Shell', yml: 'YAML', json: 'JSON', md: 'Markdown'
  };
  return map[ext] || null;
}

function anonymizeFilename(path) {
  // Keep extension and folder structure, anonymize specific names
  return path
    .replace(/[A-Z][a-z]+(?=[A-Z])/g, 'Xxx')  // CamelCase class names
    .replace(/\/\.[^/]+/g, '/[dotfile]');        // dotfiles
}

export { collectProjectContributions, anonymize };
