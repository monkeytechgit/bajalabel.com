(() => {
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getCandidates = () => {
    const selectors = [
      'main section',
      '.section-header',
      '.hero-grid > *',
      '.grid > *',
      '.product-grid > *',
      '.pills > *',
      '.steps > *',
      '.cta-section',
      '.material-card',
      '.feature-card',
      '.product-card',
      '.card',
    ];

    return Array.from(document.querySelectorAll(selectors.join(',')));
  };

  const initRevealAnimations = () => {
    if (prefersReducedMotion) return;

    const candidates = getCandidates().filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.classList.contains('reveal') || el.classList.contains('is-visible')) return false;
      if (el.closest('header')) return false;
      return true;
    });

    if (!candidates.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    for (const el of candidates) {
      el.classList.add('reveal');
      observer.observe(el);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevealAnimations);
  } else {
    initRevealAnimations();
  }
})();
