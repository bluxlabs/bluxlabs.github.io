// Carry one visible facet into a native navigation; links always work independently.
(() => {
  const key = 'blux-facet-entry';
  const root = document.documentElement;
  const ids = ['products', 'team', 'statements', 'about', 'contact'];
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const validPoints = points => Array.isArray(points) && points.length === 3 &&
    points.every(point => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite));

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || reduced()) return;
    const link = event.target.closest?.('[data-facet-entry]');
    if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    try {
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash || !ids.includes(link.dataset.facetEntry)) return;
      const id = link.dataset.facetEntry;
      const group = link.closest('section').querySelector(`[data-facet="${id}"], [data-mobile-facet="${id}"]`);
      const svg = group?.ownerSVGElement;
      if (!svg) return;
      const points = JSON.parse(group.dataset.facetPoints);
      if (!validPoints(points)) return;
      const rect = svg.getBoundingClientRect();
      const box = svg.viewBox.baseVal;
      if (!box.width || !box.height || !window.innerWidth || !window.innerHeight) return;
      const viewportPoints = points.map(([x, y]) => [
        ((x - box.x) * rect.width / box.width + rect.left) / window.innerWidth * 100,
        ((y - box.y) * rect.height / box.height + rect.top) / window.innerHeight * 100,
      ]);
      window.sessionStorage.setItem(key, JSON.stringify({id, path: url.pathname + url.search, time: Date.now(), points: viewportPoints}));
    } catch { /* Geometry or storage is optional; never interrupt the link. */ }
  });

  window.addEventListener('pagereveal', event => {
    let entry;
    try {
      const stored = window.sessionStorage.getItem(key);
      window.sessionStorage.removeItem(key);
      entry = JSON.parse(stored);
    } catch { return; }
    if (!event.viewTransition || reduced() || !entry || !ids.includes(entry.id) ||
        entry.path !== window.location.pathname + window.location.search ||
        !Number.isFinite(entry.time) || Date.now() - entry.time < 0 || Date.now() - entry.time > 8000 ||
        !validPoints(entry.points)) return;

    // Preserve clockwise order so the triangle unfolds into a convex four-corner window.
    const points = entry.points.map(point => [...point]);
    const [a, b, c] = points;
    if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) < 0) points.reverse();
    const start = points.reduce((best, p, i) => p[0] + p[1] < points[best][0] + points[best][1] ? i : best, 0);
    const ordered = [...points.slice(start), ...points.slice(0, start)];
    ordered.push(ordered[2]);
    const polygon = `polygon(${ordered.map(p => `${p[0].toFixed(3)}% ${p[1].toFixed(3)}%`).join(', ')})`;
    root.style.setProperty('--facet-reveal-from', polygon);
    root.dataset.facetTransition = entry.id;
    root.dataset.lastFacetTransition = entry.id;
    const clean = () => {
      delete root.dataset.facetTransition;
      root.style.removeProperty('--facet-reveal-from');
    };
    event.viewTransition.ready.catch(() => {});
    event.viewTransition.finished.then(clean, clean);
  });
})();
