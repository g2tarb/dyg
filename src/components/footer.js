import { t } from '../i18n/index.js';
import { createLogoSVG } from './logo.js';

function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'dyg-footer';
  footer.innerHTML = `
    <div class="footer-inner container">
      <span class="footer-brand">${createLogoSVG('sm')}</span>
      <span class="footer-copy">${t('footer.copy')} &mdash; ${new Date().getFullYear()}</span>
      <div class="footer-links">
        <a href="#/">${t('landing.scan_btn')}</a>
        <a href="#/about">${t('header.about')}</a>
      </div>
    </div>
  `;
  return footer;
}

export { createFooter };
