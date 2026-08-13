/* Unspeakable Vice — shared behavior */
(function () {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => matchMedia('(min-width: 821px)').matches;

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  if (reduceMotion) return; // everything below is motion

  /* ---------- Animate-in on scroll ---------- */
  document.querySelectorAll('.display, .hook').forEach(el => el.classList.add('anim-h'));
  document
    .querySelectorAll('main p, main li, main dt, main dd, .statement .btn-outline')
    .forEach(el => el.classList.add('anim-b'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.anim-h, .anim-b').forEach(el => io.observe(el));

  /* ---------- Parallax ---------- */
  const plx = [...document.querySelectorAll(
    '.full-photo img, .hero-photo img, .photo-band img, .photo-strip img'
  )];
  plx.forEach(img => img.classList.add('plx'));
  let ticking = false;
  function parallax() {
    const vh = innerHeight;
    const amp = isDesktop() ? -18 : -6;      // gentler on mobile
    const zoom = isDesktop() ? 1.3 : 1.1;
    plx.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const progress = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = `translateY(${progress * amp}%) scale(${zoom})`;
    });
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
  }, { passive: true });
  parallax();

  /* ---------- Hide/reveal header ---------- */
  const header = document.querySelector('.site-header');
  const headerH = () => header.offsetHeight;
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    const d = y - lastY;
    if (Math.abs(d) < 12) return;            // hysteresis: ignore micro-scrolls
    if (y <= headerH()) {                    // near the top: full header, no toggling
      header.classList.remove('hdr-hide', 'hdr-mini');
    } else if (d > 0) {
      header.classList.add('hdr-hide');
    } else {
      header.classList.remove('hdr-hide');
      if (isDesktop()) header.classList.add('hdr-mini');
    }
    lastY = y;
  }, { passive: true });
})();
