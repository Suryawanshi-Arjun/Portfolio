/* ════════════════════════════════════════════════
   SCRIPT.JS — Full Stack Dev Portfolio
   3D Animations + Interactions · Alex Chen
════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════
   1. PRELOADER
══════════════════════════════════ */
(function initPreloader() {
  const loader  = document.getElementById('preloader');
  const counter = document.getElementById('preCounter');
  let count = 0;
  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 12) + 3;
    if (count >= 100) { count = 100; clearInterval(interval); }
    counter.textContent = count;
    if (count === 100) {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        initAll();
      }, 400);
    }
  }, 60);
  document.body.style.overflow = 'hidden';
})();

/* ══════════════════════════════════
   2. MASTER INIT — runs after preloader
══════════════════════════════════ */
function initAll() {
  initCursor();
  initNavbar();
  initHeroCanvas();
  initTyped();
  initCounters();
  initReveal();
  initSkillBars();
  initSkillTabs();
  initProjectCanvases();
  initProjectFilter();
  initContactCanvas();
  initContactForm();
  initHamburger();
  initCubeMouseParallax();
  initTiltCards();
}

/* ══════════════════════════════════
   3. CUSTOM CURSOR
══════════════════════════════════ */
function initCursor() {
  const dot     = document.getElementById('cursor-dot');
  const outline = document.getElementById('cursor-outline');
  let ox = 0, oy = 0, dx = 0, dy = 0;

  document.addEventListener('mousemove', e => { dx = e.clientX; dy = e.clientY; });

  (function animCursor() {
    dot.style.left = dx + 'px';
    dot.style.top  = dy + 'px';
    ox += (dx - ox) * 0.1;
    oy += (dy - oy) * 0.1;
    outline.style.left = ox + 'px';
    outline.style.top  = oy + 'px';
    requestAnimationFrame(animCursor);
  })();

  // Hover state
  document.querySelectorAll('a, button, .sk-card, .proj-card, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ══════════════════════════════════
   4. NAVBAR
══════════════════════════════════ */
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ══════════════════════════════════
   5. HERO CANVAS — 3D Particle Web
══════════════════════════════════ */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); buildParticles(); });

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  function Particle() {
    this.reset = function() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.z  = Math.random() * 600 + 100;
      this.vx = (Math.random() - .5) * .5;
      this.vy = (Math.random() - .5) * .5;
      this.vz = -.5 - Math.random() * .5;
      this.baseSize = Math.random() * 2.5 + .5;
    };
    this.reset();
  }

  function buildParticles() {
    const count = Math.floor(W * H / 8000);
    particles = Array.from({ length: Math.min(count, 200) }, () => new Particle());
  }
  buildParticles();

  const fov = 600;
  function project(p) {
    const scale = fov / (fov + p.z);
    return {
      sx:    W / 2 + (p.x - W / 2) * scale,
      sy:    H / 2 + (p.y - H / 2) * scale,
      scale: scale
    };
  }

  let time = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    time += .004;

    particles.forEach(p => {
      // Mouse influence
      const proj = project(p);
      const dx   = proj.sx - mouse.x;
      const dy   = proj.sy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150 * .8;
        p.vx += (dx / dist) * force * .1;
        p.vy += (dy / dist) * force * .1;
      }

      p.vx *= .98; p.vy *= .98;
      p.x += p.vx; p.y += p.vy; p.z += p.vz;

      if (p.z < 1 || p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) p.reset();

      const { sx, sy, scale } = project(p);
      const alpha = Math.min(.8, scale * 1.2);
      const size  = p.baseSize * scale;

      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(size, .3), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,255,${alpha * .7})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      const pi   = particles[i];
      const prj1 = project(pi);
      for (let j = i + 1; j < particles.length; j++) {
        const pj   = particles[j];
        const prj2 = project(pj);
        const dx   = prj1.sx - prj2.sx;
        const dy   = prj1.sy - prj2.sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const alpha = (1 - dist / 100) * .15;
          ctx.beginPath();
          ctx.moveTo(prj1.sx, prj1.sy);
          ctx.lineTo(prj2.sx, prj2.sy);
          ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
          ctx.lineWidth   = .5;
          ctx.stroke();
        }
      }
    }

    // Floating grid overlay
    ctx.strokeStyle = 'rgba(0,229,255,.025)';
    ctx.lineWidth   = 1;
    const gridSpacing = 80;
    const offsetX  = (time * 10) % gridSpacing;
    const offsetY  = (time * 6) % gridSpacing;
    for (let x = -gridSpacing + offsetX; x < W + gridSpacing; x += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = -gridSpacing + offsetY; y < H + gridSpacing; y += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════
   6. TYPED TEXT EFFECT
══════════════════════════════════ */
function initTyped() {
  const words  = ['Developer', 'Engineer', 'Problem Solver', 'Creator', 'Builder'];
  const target = document.querySelector('.typed-wrap');
  if (!target) return;

  const cursor = target.querySelector('.typed-cursor');
  let wi = 0, ci = 0, deleting = false, text = '';

  function type() {
    const word    = words[wi];
    const timeout = deleting ? 60 : 110;

    if (!deleting) {
      text = word.slice(0, ++ci);
    } else {
      text = word.slice(0, --ci);
    }

    // Update text node (before cursor)
    target.childNodes[0]?.nodeType === 3
      ? (target.childNodes[0].textContent = text)
      : target.insertBefore(document.createTextNode(text), cursor);

    if (!deleting && ci === word.length) {
      setTimeout(() => { deleting = true; type(); }, 2000);
      return;
    }
    if (deleting && ci === 0) {
      deleting = false;
      wi = (wi + 1) % words.length;
    }
    setTimeout(type, timeout);
  }

  setTimeout(type, 1800);
}

/* ══════════════════════════════════
   7. COUNT-UP METRICS
══════════════════════════════════ */
function initCounters() {
  const nums = document.querySelectorAll('.metric-n');
  const io   = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target);
      const dur    = 1600;
      const start  = performance.now();
      function step(now) {
        const t   = Math.min((now - start) / dur, 1);
        const val = Math.round(easeOutExpo(t) * target);
        el.textContent = val;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: .5 });
  nums.forEach(n => io.observe(n));
}
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/* ══════════════════════════════════
   8. SCROLL REVEAL
══════════════════════════════════ */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ══════════════════════════════════
   9. SKILL BARS — animate on scroll
══════════════════════════════════ */
function initSkillBars() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const card = e.target;
        const pct  = card.dataset.pct + '%';
        card.querySelector('.sk-bar').style.setProperty('--pct', pct);
        card.classList.add('bar-animated');
        io.unobserve(card);
      }
    });
  }, { threshold: .3 });
  document.querySelectorAll('.sk-card').forEach(c => io.observe(c));
}

/* ══════════════════════════════════
   10. SKILL TABS
══════════════════════════════════ */
function initSkillTabs() {
  const tabs   = document.querySelectorAll('.stab');
  const panels = document.querySelectorAll('.skill-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.skill-panel[data-cat="${tab.dataset.cat}"]`)?.classList.add('active');
      // Re-trigger bar animations for newly visible cards
      document.querySelectorAll('.skill-panel.active .sk-card').forEach(c => {
        c.classList.remove('bar-animated');
        setTimeout(() => {
          const pct = c.dataset.pct + '%';
          c.querySelector('.sk-bar').style.setProperty('--pct', pct);
          c.classList.add('bar-animated');
        }, 80);
      });
    });
  });
}

/* ══════════════════════════════════
   11. PROJECT CANVAS THUMBNAILS
══════════════════════════════════ */
function initProjectCanvases() {
  document.querySelectorAll('.proj-canvas').forEach(canvas => {
    const c1 = canvas.dataset.c1 || '#00e5ff';
    const c2 = canvas.dataset.c2 || '#7c3aed';

    canvas.width  = canvas.offsetWidth  || 340;
    canvas.height = canvas.offsetHeight || 190;
    const ctx  = canvas.getContext('2d');
    const W    = canvas.width;
    const H    = canvas.height;
    let   t    = Math.random() * 100;

    // Generate persistent blobs
    const blobs = Array.from({ length: 7 }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 35 + 15,
      vx:    (Math.random() - .5) * .4,
      vy:    (Math.random() - .5) * .4,
      phase: Math.random() * Math.PI * 2
    }));

    // Hex grid
    function drawHexGrid() {
      const size = 20, w = size * 2, h = Math.sqrt(3) * size;
      ctx.strokeStyle = 'rgba(255,255,255,.04)';
      ctx.lineWidth   = .5;
      for (let row = -1; row < H / h + 1; row++) {
        for (let col = -1; col < W / w + 1; col++) {
          const cx = col * w * .75;
          const cy = row * h + (col % 2 === 0 ? 0 : h / 2);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = cx + size * Math.cos(angle);
            const hy = cy + size * Math.sin(angle);
            i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
          }
          ctx.closePath(); ctx.stroke();
        }
      }
    }

    function frame() {
      t += .018;
      ctx.clearRect(0, 0, W, H);

      // Dark bg
      ctx.fillStyle = '#101829';
      ctx.fillRect(0, 0, W, H);

      // Hex grid
      drawHexGrid();

      // Blobs
      blobs.forEach((b, i) => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < -b.r || b.x > W + b.r) b.vx *= -1;
        if (b.y < -b.r || b.y > H + b.r) b.vy *= -1;

        const alpha = .12 + .05 * Math.sin(t + b.phase);
        const grd   = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2.5);
        grd.addColorStop(0, hexToRgba(i % 2 === 0 ? c1 : c2, alpha));
        grd.addColorStop(1, hexToRgba(c1, 0));
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
      });

      // Animated wave line
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = H / 2 + Math.sin(x * .025 + t) * 22 + Math.sin(x * .06 - t * 1.5) * 11;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = hexToRgba(c1, .6);
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // Second wave
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = H * .6 + Math.sin(x * .02 - t * .8) * 15 + Math.cos(x * .04 + t) * 8;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = hexToRgba(c2, .35);
      ctx.lineWidth   = 1;
      ctx.stroke();

      requestAnimationFrame(frame);
    }
    frame();
  });
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ══════════════════════════════════
   12. PROJECT FILTER
══════════════════════════════════ */
function initProjectFilter() {
  const btns  = document.querySelectorAll('.pf-btn');
  const cards = document.querySelectorAll('.proj-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.style.transition = 'opacity .3s, transform .3s';
        if (match) {
          card.style.opacity   = '0';
          card.style.transform = 'scale(.92)';
          card.classList.remove('hidden');
          requestAnimationFrame(() => requestAnimationFrame(() => {
            card.style.opacity   = '1';
            card.style.transform = '';
          }));
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'scale(.92)';
          setTimeout(() => card.classList.add('hidden'), 300);
        }
      });
    });
  });
}

/* ══════════════════════════════════
   13. CONTACT CANVAS — Flowing Mesh
══════════════════════════════════ */
function initContactCanvas() {
  const canvas = document.getElementById('contactCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const pts = Array.from({ length: 60 }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4
  }));

  let t = 0;
  function draw() {
    t += .005;
    ctx.clearRect(0, 0, W, H);

    // Slow-moving gradient blob
    const gx  = W * (.5 + .3 * Math.sin(t * .5));
    const gy  = H * (.5 + .25 * Math.cos(t * .4));
    const grd = ctx.createRadialGradient(gx, gy, 0, gx, gy, W * .5);
    grd.addColorStop(0, 'rgba(0,229,255,.04)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    // Moving points + connections
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx   = pts[i].x - pts[j].x;
        const dy   = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${(1 - dist / 130) * .12})`;
          ctx.lineWidth   = .8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════
   14. CONTACT FORM
══════════════════════════════════ */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('cfSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn.querySelector('.btn-text').textContent;
    btn.querySelector('.btn-text').textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      btn.querySelector('.btn-text').textContent = origText;
      btn.disabled = false;
      form.reset();
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 1800);
  });
}

/* ══════════════════════════════════
   15. HAMBURGER MENU
══════════════════════════════════ */
function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });
}
function closeMobile() {
  document.getElementById('hamburger')?.classList.remove('open');
  document.getElementById('mobileMenu')?.classList.remove('open');
}

/* ══════════════════════════════════
   16. CUBE MOUSE PARALLAX
══════════════════════════════════ */
function initCubeMouseParallax() {
  const cube = document.querySelector('.av-cube');
  if (!cube) return;
  let baseRX = 15, baseRY = 0;

  document.addEventListener('mousemove', e => {
    const xFrac = (e.clientX / window.innerWidth  - .5) * 2;
    const yFrac = (e.clientY / window.innerHeight - .5) * 2;
    const rx    = baseRX + yFrac * 12;
    const ry    = baseRY + xFrac * 20;
    cube.style.animation = 'none';
    cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  document.addEventListener('mouseleave', () => {
    cube.style.animation = '';
    cube.style.transform = '';
  });
}

/* ══════════════════════════════════
   17. 3D TILT ON CARDS
══════════════════════════════════ */
function initTiltCards() {
  document.querySelectorAll('.proj-card, .sk-card, .info-card, .tl-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(800px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ══════════════════════════════════
   18. SKILLS BACKGROUND ANIMATION
══════════════════════════════════ */
(function initSkillsBg() {
  const wrapper = document.getElementById('skillsBg');
  if (!wrapper) return;
  for (let i = 0; i < 16; i++) {
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position:    'absolute',
      width:       Math.random() * 6 + 2 + 'px',
      height:      Math.random() * 6 + 2 + 'px',
      borderRadius: '50%',
      background:   `rgba(0,229,255,${Math.random() * .15 + .03})`,
      top:          Math.random() * 100 + '%',
      left:         Math.random() * 100 + '%',
      animation:    `floatDot ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 4}s infinite`
    });
    wrapper.appendChild(dot);
  }
  if (!document.getElementById('floatDotKf')) {
    const style = document.createElement('style');
    style.id    = 'floatDotKf';
    style.textContent = `
      @keyframes floatDot {
        0%,100%{ transform: translate(0,0) scale(1); opacity:.4; }
        50%    { transform: translate(${Math.random()*40-20}px,${Math.random()*40-20}px) scale(1.3); opacity:1; }
      }
    `;
    document.head.appendChild(style);
  }
})();

/* ══════════════════════════════════
   19. SMOOTH ACTIVE NAV HIGHLIGHT
══════════════════════════════════ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
    });
    links.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--cyan)' : '';
    });
  }, { passive: true });
})();

/* ══════════════════════════════════
   20. SECTION ENTRANCE PARALLAX
══════════════════════════════════ */
(function initParallaxSections() {
  const heroContent = document.querySelector('.hero-content');
  const hero3d      = document.querySelector('.hero-3d-wrap');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (heroContent) heroContent.style.transform = `translateY(${y * .25}px)`;
    if (hero3d)      hero3d.style.transform      = `translateY(${y * .15}px)`;
  }, { passive: true });
})();