/* Motion only reveals or lights the shared scene; its geometry never moves. */
(() => {
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let entryTimer;
  let visible = true;

  const finishEntry = () => {
    clearTimeout(entryTimer);
    root.classList.remove('is-entering');
  };
  const enter = () => {
    if (preference.matches) return;
    finishEntry();
    // Flush the previous finished state when the visitor explicitly replays.
    void root.offsetWidth;
    root.classList.add('is-entering');
    entryTimer = setTimeout(finishEntry, 1400);
  };
  const syncMotion = () => {
    root.dataset.motion = preference.matches ? 'reduced' : paused ? 'paused' : 'running';
    if (preference.matches || paused) finishEntry();
    const controls = document.querySelector('.motion-controls');
    if (controls) controls.hidden = preference.matches;
    document.querySelector('.motion-toggle')?.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
  };
  const syncVisibility = () => {
    root.dataset.motionSuspended = String(document.hidden || !visible);
    if (document.hidden || !visible) finishEntry();
  };

  syncMotion();
  if (!preference.matches) root.classList.add('is-entering');
  document.addEventListener('DOMContentLoaded', () => {
    syncMotion();
    entryTimer = setTimeout(finishEntry, 1400);
    document.querySelector('.motion-toggle').addEventListener('click', () => {
      paused = !paused;
      syncMotion();
    });
    document.querySelector('.motion-replay').addEventListener('click', () => {
      paused = false;
      syncMotion();
      document.querySelector('.hero').scrollIntoView({ block: 'start', behavior: 'instant' });
      enter();
    });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncVisibility();
    });
    observer.observe(document.querySelector('.hero'));
    syncVisibility();
  }, { once: true });
  preference.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncVisibility);
})();
