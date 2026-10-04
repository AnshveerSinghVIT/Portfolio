export function scrollToId(id) {
  const target = id === 'top' ? 0 : document.getElementById(id);
  if (target === null) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(target, { duration: 1.6 });
    return;
  }
  if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
  else target.scrollIntoView({ behavior: 'smooth' });
}

export function lockScroll(locked) {
  if (window.__lenis) locked ? window.__lenis.stop() : window.__lenis.start();
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

export function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function revealResume() {
  const el = document.getElementById('resume');
  if (!el) return;
  const flash = () => {
    el.classList.remove('is-flash');
    void el.offsetWidth;
    el.classList.add('is-flash');
    el.focus({ preventScroll: true });
    setTimeout(() => el.classList.remove('is-flash'), 2600);
  };
  const offset = -(innerHeight / 2 - el.offsetHeight / 2);
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset, duration: 1.8, force: true, onComplete: flash });
    return;
  }
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  setTimeout(flash, prefersReducedMotion() ? 0 : 900);
}
