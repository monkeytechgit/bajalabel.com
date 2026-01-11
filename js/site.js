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

    const revealIfInViewport = (elements) => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const topThreshold = viewportHeight * 0.08;
      const bottomThreshold = viewportHeight * 0.92;

      for (const el of elements) {
        if (!(el instanceof HTMLElement)) continue;
        if (!el.classList.contains('reveal') || el.classList.contains('is-visible')) continue;

        const rect = el.getBoundingClientRect();
        const inView = rect.bottom > topThreshold && rect.top < bottomThreshold;
        if (!inView) continue;

        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    };

    for (const el of candidates) {
      el.classList.add('reveal');
      observer.observe(el);
    }

    // Some browsers (notably Safari) may restore scroll position after DOMContentLoaded
    // without firing IntersectionObserver callbacks immediately. This ensures we don't
    // leave in-viewport elements stuck with opacity: 0 on refresh.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => revealIfInViewport(candidates));
    });

    window.addEventListener('load', () => {
      setTimeout(() => revealIfInViewport(candidates), 0);
    });

    window.addEventListener('pageshow', () => {
      setTimeout(() => revealIfInViewport(candidates), 0);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevealAnimations);
  } else {
    initRevealAnimations();
  }
})();
