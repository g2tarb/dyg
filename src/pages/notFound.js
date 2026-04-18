function renderNotFound(container) {
  container.innerHTML = `
    <section class="not-found">
      <div class="container" style="padding-top:var(--space-4xl);text-align:center;">
        <h1 class="not-found__code">404</h1>
        <p class="not-found__text">Cette page n'existe pas.</p>
        <a href="#/" class="btn-primary" style="margin-top:var(--space-xl);">Retour à l'accueil</a>
      </div>
    </section>
  `;
}

export { renderNotFound };
