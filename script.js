'use strict';
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (window.matchMedia('(pointer: fine)').matches) {
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

const nav       = document.getElementById('nav');
const navBurger = document.getElementById('nav-burger');
const navLinks  = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

navBurger.addEventListener('click', () => {
  navBurger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Cerrar menú móvil al hacer clic en un link
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navBurger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

const PARTICLE_COUNT  = 70;    
const CONNECTION_DIST = 130;   

const COLORS = [
  '201, 150, 58',   
  '139,  26, 42',   
  '107,  78, 122', 
];

const heroCanvas = document.getElementById('hero-canvas');
const ctx        = heroCanvas.getContext('2d');
let   particles  = [];
let   W, H;

function resizeCanvas() {
  W = heroCanvas.width  = heroCanvas.offsetWidth;
  H = heroCanvas.height = heroCanvas.offsetHeight;
}

function createParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    particles.push({
      x:      Math.random() * W,
      y:      Math.random() * H,
      vx:     (Math.random() - 0.5) * 0.4,
      vy:     (Math.random() - 0.5) * 0.4,
      r:      Math.random() * 1.8 + 0.4,
      alpha:  Math.random() * 0.5 + 0.2,
      phase:  Math.random() * Math.PI * 2,
      color,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(0, 225, 255, 0.025)';
  ctx.lineWidth   = 1;
  const GRID = 70;
  for (let x = 0; x < W; x += GRID) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += GRID) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  const now = performance.now() * 0.001;
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    const alpha = p.alpha * (0.7 + 0.3 * Math.sin(now * 1.5 + p.phase));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle    = `rgba(${p.color}, ${alpha})`;
    ctx.shadowBlur   = 10;
    ctx.shadowColor  = `rgba(${p.color}, 0.5)`;
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  ctx.lineWidth = 0.6;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a  = particles[i];
      const b  = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < CONNECTION_DIST) {
        const op = (1 - d / CONNECTION_DIST) * 0.15;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${a.color}, ${op})`;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawParticles);
}

// Iniciar canvas
window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
}, { passive: true });

resizeCanvas();
createParticles();
drawParticles();

function initScrollReveal() {
  const revealEls = document.querySelectorAll('[data-reveal]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,  
      rootMargin: '0px 0px -60px 0px',
    }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function initProgressBars() {
  const cards = document.querySelectorAll('.prog-card');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const card    = entry.target;
        const bar     = card.querySelector('.prog-bar-fill');
        const numEl   = card.querySelector('.prog-num');
        const target  = parseInt(bar?.dataset.target ?? '0', 10);

        card.classList.add('is-visible');

        if (bar) {
          setTimeout(() => {
            bar.style.width = `${target}%`;
          }, 200);
        }

        if (numEl) {
          animateCounter(numEl, target);
        }

        observer.unobserve(card);
      });
    },
    { threshold: 0.2 }
  );

  cards.forEach((c) => observer.observe(c));
}

/**
 * 
 * @param {HTMLElement} el    
 * @param {number}      target 
 */
function animateCounter(el, target) {
  const DURATION = 1600; // ms
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / DURATION, 1);
    const eased    = 1 - Math.pow(1 - progress, 4);
    const current  = Math.round(eased * target);
    el.textContent = `${current}%`;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initGlitch() {
  const glitchEls = document.querySelectorAll('.glitch-text');

  setInterval(() => {
    glitchEls.forEach((el) => {
      if (Math.random() > 0.65) {
        const skew = (Math.random() - 0.5) * 6;
        el.style.transform  = `skewX(${skew}deg)`;
        el.style.filter     = `brightness(1.3) hue-rotate(${Math.random() * 60}deg)`;

        setTimeout(() => {
          el.style.transform = '';
          el.style.filter    = '';
        }, 60 + Math.random() * 100);
      }
    });
  }, 3000);
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initNavHighlight() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach((a) => {
            const isActive = a.getAttribute('href') === `#${id}`;
            a.style.color = isActive
              ? 'var(--c-accent)'
              : '';
            a.style.textShadow = isActive
              ? 'var(--glow)'
              : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => observer.observe(s));
}

function initCardGlow() {
  const cards = document.querySelectorAll('.prog-card, .member-card, .gal-item');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = `radial-gradient(
        circle at ${x}px ${y}px,
        rgba(0, 225, 255, 0.06),
        transparent 60%
      )`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initProgressBars();
  initGlitch();
  initSmoothScroll();
  initNavHighlight();
  initCardGlow();

  document.querySelectorAll('.hero [data-reveal]').forEach((el) => {
    setTimeout(() => el.classList.add('is-visible'), 100);
  });
});
