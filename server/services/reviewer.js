const GITHUB_API = 'https://api.github.com';

function getHeaders() {
  const headers = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'DYG-Reviewer' };
  if (process.env.GITHUB_PAT && process.env.GITHUB_PAT !== 'your_github_personal_access_token') {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_PAT}`;
  }
  return headers;
}

function parseRepoUrl(url) {
  if (!url) return null;
  // SSRF prevention: only allow github.com URLs
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') return null;
  } catch { return null; }
  const match = url.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace('.git', '') };
}

async function reviewSubmission(repoUrl, exerciseData) {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) return { gold_stars: 1, feedback: 'Could not parse GitHub repo URL.' };

  const { owner, repo } = parsed;
  const headers = getHeaders();

  // 1. Fetch repo tree
  let files = [];
  try {
    const treeRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, {
      headers, signal: AbortSignal.timeout(5000)
    });
    if (treeRes.ok) {
      const tree = await treeRes.json();
      files = (tree.tree || []).filter(f => f.type === 'blob').map(f => f.path.toLowerCase());
    }
  } catch { /* tree fetch failed */ }

  if (files.length === 0) {
    return { gold_stars: 1, feedback: 'Repo is empty or inaccessible.' };
  }

  // 2. Detect exercise type from file extensions
  const hasHTML = files.some(f => f.endsWith('.html'));
  const hasCSS = files.some(f => f.endsWith('.css'));
  const hasJS = files.some(f => f.endsWith('.js'));
  const hasPY = files.some(f => f.endsWith('.py'));

  // 3. Fetch key files for analysis
  const keyFiles = {};
  const filesToFetch = [];

  if (hasHTML) filesToFetch.push('index.html');
  if (hasCSS) {
    const cssFile = files.find(f => f.endsWith('.css') && !f.includes('node_modules'));
    if (cssFile) filesToFetch.push(cssFile);
  }
  if (hasJS) {
    const jsFile = files.find(f => f.endsWith('.js') && !f.includes('node_modules') && !f.includes('package'));
    if (jsFile) filesToFetch.push(jsFile);
  }
  if (hasPY) {
    const pyFile = files.find(f => f.endsWith('.py'));
    if (pyFile) filesToFetch.push(pyFile);
  }

  for (const filePath of filesToFetch.slice(0, 5)) {
    try {
      const actualPath = files.find(f => f === filePath || f.endsWith('/' + filePath)) || filePath;
      const contentRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${actualPath}`, {
        headers, signal: AbortSignal.timeout(5000)
      });
      if (contentRes.ok) {
        const data = await contentRes.json();
        if (data.content) {
          keyFiles[filePath] = Buffer.from(data.content, 'base64').toString('utf-8');
        }
      }
    } catch { /* individual file fetch failed */ }
  }

  // 4. Score based on criteria
  let stars = 0;
  const feedback = [];

  // ★ 1: Files exist (correct structure)
  const fileCount = files.filter(f => !f.includes('node_modules') && !f.startsWith('.')).length;
  if (fileCount >= 2) {
    stars++;
    feedback.push('File structure OK');
  } else {
    feedback.push('Need more files — at least HTML + CSS or JS/PY');
  }

  // ★ 2: Language-specific quality
  if (hasHTML) {
    const html = keyFiles['index.html'] || Object.values(keyFiles).find(v => v.includes('<!DOCTYPE')) || '';
    const htmlChecks = [
      html.includes('<!DOCTYPE') || html.includes('<!doctype'),
      html.includes('<header') || html.includes('<main') || html.includes('<footer'),
      html.includes('<meta') && html.includes('viewport'),
      html.includes('alt=')
    ];
    if (htmlChecks.filter(Boolean).length >= 2) {
      stars++;
      feedback.push('HTML structure is solid');
    } else {
      feedback.push('HTML needs semantic tags, meta viewport, alt attributes');
    }
  }

  if (hasCSS) {
    const css = Object.values(keyFiles).find(v => v.includes('{') && v.includes(':') && !v.includes('<!DOCTYPE')) || '';
    const cssChecks = [
      css.includes('--') && css.includes('var('), // CSS variables
      css.includes('@media') || css.includes('clamp('), // responsive
      css.includes(':hover') || css.includes('transition'), // interactivity
      css.includes('flex') || css.includes('grid'), // modern layout
      !css.includes('!important') || css.split('!important').length < 3 // not abusing !important
    ];
    if (cssChecks.filter(Boolean).length >= 2) {
      stars++;
      feedback.push('CSS shows good practices');
    } else {
      feedback.push('CSS needs variables, responsive design, or modern layout');
    }
  }

  if (hasJS && !hasHTML && !hasCSS) {
    const js = Object.values(keyFiles).find(v => v.includes('function') || v.includes('=>') || v.includes('const ')) || '';
    const jsChecks = [
      js.includes('function') || js.includes('=>'),
      js.includes('const ') || js.includes('let '),
      js.includes('addEventListener') || js.includes('querySelector') || js.includes('console.log'),
      !js.includes('var ') || js.split('var ').length < 3, // avoids var
      js.length > 200 // substantial code
    ];
    if (jsChecks.filter(Boolean).length >= 2) {
      stars++;
      feedback.push('JavaScript code is structured');
    } else {
      feedback.push('JavaScript needs functions, const/let, and DOM manipulation');
    }
  }

  if (hasPY) {
    const py = Object.values(keyFiles).find(v => v.includes('def ') || v.includes('import ') || v.includes('print(')) || '';
    const pyChecks = [
      py.includes('def '),
      py.includes('if __name__') || py.includes('import '),
      py.includes('class ') || py.includes('return '),
      !py.includes('print(') || py.split('print(').length < 20, // not just print spam
      py.length > 200
    ];
    if (pyChecks.filter(Boolean).length >= 2) {
      stars++;
      feedback.push('Python code is structured');
    } else {
      feedback.push('Python needs functions, imports, and clean structure');
    }
  }

  // ★ 3: Completeness (file variety)
  const uniqueExtensions = new Set(files.map(f => f.split('.').pop()));
  const multiplePages = files.filter(f => f.endsWith('.html')).length;
  if (uniqueExtensions.size >= 3 || multiplePages >= 2 || fileCount >= 5) {
    stars++;
    feedback.push('Project has good completeness');
  } else {
    feedback.push('Add more files or pages for completeness');
  }

  // ★ 4: Documentation
  const hasReadme = files.some(f => f === 'readme.md' || f === 'readme.txt');
  const hasComments = Object.values(keyFiles).some(v => v.includes('//') || v.includes('/*') || v.includes('#'));
  if (hasReadme || hasComments) {
    stars++;
    feedback.push(hasReadme ? 'README present — great documentation' : 'Code has comments');
  } else {
    feedback.push('Add a README.md or comments for documentation');
  }

  // Cap at 5
  stars = Math.min(5, Math.max(1, stars));

  return { gold_stars: stars, feedback: feedback.join('. ') + '.' };
}

export { reviewSubmission, parseRepoUrl };
