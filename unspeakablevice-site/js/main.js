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
    plx.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const progress = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5-ish
      img.style.transform = `translateY(${progress * -18}%) scale(1.3)`;
    });
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
  }, { passive: true });
  parallax();

  /* ---------- Hide/reveal header ---------- */
  const header = document.querySelector('.site-header');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    const down = y > lastY;
    if (y < 10) {
      header.classList.remove('hdr-hide', 'hdr-mini');
    } else if (down) {
      header.classList.add('hdr-hide');
      header.classList.remove('hdr-mini');
    } else {
      header.classList.remove('hdr-hide');
      if (isDesktop()) header.classList.add('hdr-mini');
    }
    lastY = y;
  }, { passive: true });

  /* ---------- Trans flag cursor streak (fine pointers only) ---------- */
  if (matchMedia('(pointer: fine)').matches) {
    const colors = ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA'];
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const fit = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    fit(); addEventListener('resize', fit);

    const pts = [];
    let ci = 0;
    addEventListener('pointermove', e => {
      pts.push({ x: e.clientX, y: e.clientY, life: 1, c: colors[ci++ % colors.length] });
      if (pts.length > 60) pts.shift();
    });
    (function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        p.life -= 0.03;
        if (p.life <= 0) continue;
        ctx.globalAlpha = p.life * 0.9;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5 * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    })();
  }
})();
