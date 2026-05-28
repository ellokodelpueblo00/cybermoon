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

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navBurger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Sistema de partículas del fondo Canvas
const PARTICLE_COUNT  = 50;    
const CONNECTION_DIST = 120;   
const COLORS = ['201, 150, 58', '166, 28, 46'];

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
      vx:     (Math.random() - 0.5) * 0.3,
      vy:     (Math.random() - 0.5) * 0.3,
      r:      Math.random() * 1.5 + 0.5,
      alpha:  Math.random() * 0.4 + 0.2,
      phase:  Math.random() * Math.PI * 2,
      color,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
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
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a  = particles[i];
      const b  = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < CONNECTION_DIST) {
        const op = (1 - d / CONNECTION_DIST) * 0.12;
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
    { threshold: 0.1 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

function initGlitch() {
  const glitchEls = document.querySelectorAll('.glitch-text');
  setInterval(() => {
    glitchEls.forEach((el) => {
      if (Math.random() > 0.7) {
        const skew = (Math.random() - 0.5) * 4;
        el.style.transform  = `skewX(${skew}deg)`;
        setTimeout(() => { el.style.transform = ''; }, 80);
      }
    });
  }, 2500);
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
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach((a) => {
            const isActive = a.getAttribute('href') === `#${id}`;
            a.style.color = isActive ? 'var(--c-gold)' : '';
            a.style.textShadow = isActive ? 'var(--glow)' : '';
          });
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((s) => observer.observe(s));
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initGlitch();
  initSmoothScroll();
  initNavHighlight();

  document.querySelectorAll('.hero [data-reveal]').forEach((el) => {
    setTimeout(() => el.classList.add('is-visible'), 100);
  });
});