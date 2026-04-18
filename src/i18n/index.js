import fr from './fr.js';
import en from './en.js';

const TRANSLATIONS = { fr, en };
let locale = localStorage.getItem('dyg_lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en');

export function t(key, params = {}) {
  const dict = TRANSLATIONS[locale] || TRANSLATIONS.en;
  let text = dict[key];
  if (text === undefined) return key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replaceAll(`{${k}}`, v);
  }
  return text;
}

export function getLocale() { return locale; }

export function setLocale(lang) {
  if (!TRANSLATIONS[lang]) return;
  locale = lang;
  localStorage.setItem('dyg_lang', lang);
  document.documentElement.lang = lang;
  // Re-render current page
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function getAvailableLocales() {
  return Object.keys(TRANSLATIONS);
}
