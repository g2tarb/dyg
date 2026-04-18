function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'dyg-footer';
  footer.innerHTML = `
    <div class="footer-inner container">
      <span class="footer-brand">DYG</span>
      <span class="footer-copy">4Dayvelopment &mdash; ${new Date().getFullYear()}</span>
      <div class="footer-links">
        <a href="#/about">Qui sommes-nous</a>
        <a href="#/projects">Projets</a>
        <a href="#/search">Explorer</a>
      </div>
    </div>
  `;
  return footer;
}

export { createFooter };
