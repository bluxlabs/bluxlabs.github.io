// Register before first paint so incoming native transitions honor motion preferences.
(() => {
  const root = document.documentElement;
  root.dataset.viewTransition = 'idle';
  window.addEventListener('pageswap', event => {
    // The outgoing object's ready promise rejects when the document is hidden.
    event.viewTransition?.ready.catch(() => {});
  });
  window.addEventListener('pagereveal', event => {
    const transition = event.viewTransition;
    root.dataset.viewTransition = transition ? 'running' : 'idle';
    root.dataset.lastViewTransition = transition ? 'native' : 'none';
    if (!transition) return;
    // Skipping an optional animation must not leave an unhandled rejection.
    transition.ready.then(
      () => { root.dataset.lastViewTransitionResult = 'animated'; },
      () => { root.dataset.lastViewTransitionResult = 'skipped'; },
    );
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) transition.skipTransition();
    const settle = () => { root.dataset.viewTransition = 'idle'; };
    transition.finished.then(settle, settle);
  });
})();
