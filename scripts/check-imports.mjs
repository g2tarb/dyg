/**
 * Validation de la résolution des imports ESM, sans effet de bord.
 *
 * `node --check` ne valide que la syntaxe d'UN fichier, pas la résolution de ses
 * imports externes (cf. incident projet). Ici on importe réellement chaque module
 * -feuille (routes, services, schémas, constantes, utils) : une erreur d'import —
 * chemin faux, export manquant, dépendance absente — fait échouer le script.
 *
 * On n'importe volontairement PAS server/index.js : il appelle listen() et lance
 * les crons au chargement. C'est le point de bootstrap, pas un module-feuille.
 */

import { readdir } from 'fs/promises';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

process.env.DOTENV_CONFIG_QUIET = 'true';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER = join(__dirname, '..', 'server');
const DIRS = ['routes', 'services', 'schemas', 'constants', 'utils', 'config'];

async function jsFilesIn(dir) {
  try {
    const entries = await readdir(dir);
    return entries.filter(f => f.endsWith('.js')).map(f => join(dir, f));
  } catch {
    return [];
  }
}

let failed = 0;
let ok = 0;

for (const sub of DIRS) {
  const files = await jsFilesIn(join(SERVER, sub));
  for (const file of files) {
    const rel = relative(join(__dirname, '..'), file);
    try {
      await import(pathToFileURL(file).href);
      ok++;
    } catch (err) {
      failed++;
      console.error(`✖ ${rel}\n  ${err.message}`);
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} module(s) en échec d'import, ${ok} OK.`);
  process.exit(1);
}
console.log(`${ok} modules importés sans erreur.`);
