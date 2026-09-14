// A single active surface, with no idle animation loop or React mouse-move renders.
export function attachPointerFeedback() {
  const preference = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const properties = ['--pointer-x', '--pointer-y', '--pull-x', '--pull-y'];
  let active = null;
  let frame = 0;
  let x = 0;
  let y = 0;

  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!active) return;
    delete active.dataset.pointerActive;
    // Keep the last light position while its opacity settles on pointer leave.
    ['--pull-x', '--pull-y'].forEach(name => active.style.removeProperty(name));
    active = null;
  };

  const update = () => {
    frame = 0;
    if (!active?.isConnected) return reset();
    const rect = active.getBoundingClientRect();
    if (!rect.width || !rect.height) return reset();
    const px = Math.max(0, Math.min(rect.width, x - rect.left));
    const py = Math.max(0, Math.min(rect.height, y - rect.top));
    active.style.setProperty('--pointer-x', `${px.toFixed(1)}px`);
    active.style.setProperty('--pointer-y', `${py.toFixed(1)}px`);
    active.style.setProperty('--pull-x', `${((px / rect.width - .5) * 6).toFixed(2)}px`);
    active.style.setProperty('--pull-y', `${((py / rect.height - .5) * 4).toFixed(2)}px`);
  };

  const move = event => {
    if (!preference.matches || event.pointerType !== 'mouse') return reset();
    const target = event.target.closest?.('[data-pointer-feedback]');
    if (!target || target.matches(':disabled, [aria-disabled="true"]')) return reset();
    if (target !== active) {
      reset();
      active = target;
      active.dataset.pointerActive = 'true';
    }
    x = event.clientX;
    y = event.clientY;
    if (!frame) frame = requestAnimationFrame(update);
  };

  const leave = event => {
    if (active && (!event.relatedTarget || !active.contains(event.relatedTarget))) reset();
  };
  const key = event => {
    if (event.key === 'Tab') reset();
  };

  document.addEventListener('pointerover', move, {passive: true});
  document.addEventListener('pointermove', move, {passive: true});
  document.addEventListener('pointerout', leave, {passive: true});
  document.addEventListener('pointercancel', reset, {passive: true});
  document.addEventListener('scroll', reset, {passive: true, capture: true});
  document.addEventListener('visibilitychange', reset);
  document.addEventListener('keydown', key);
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset, {passive: true});
  preference.addEventListener('change', reset);

  return () => {
    reset();
    document.querySelectorAll('[data-pointer-feedback]').forEach(element => {
      properties.forEach(name => element.style.removeProperty(name));
    });
    document.removeEventListener('pointerover', move);
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerout', leave);
    document.removeEventListener('pointercancel', reset);
    document.removeEventListener('scroll', reset, true);
    document.removeEventListener('visibilitychange', reset);
    document.removeEventListener('keydown', key);
    window.removeEventListener('blur', reset);
    window.removeEventListener('resize', reset);
    preference.removeEventListener('change', reset);
  };
}
