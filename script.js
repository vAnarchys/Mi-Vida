/* ══════════════════════════════════════════
   LOVE PAGE — script.js
══════════════════════════════════════════ */

'use strict';

// ── Lista completa de palabras ─────────────
const WORDS = [
  'Mi todo','Mi razón','Mi luz','Mi sol','Mi luna','Mi cielo','Mi mundo',
  'Mi calma','Mi refugio','Mi hogar','Mi paz','Mi aire','Mi aliento',
  'Mi latido','Mi vida','Mi alma','Mi esencia','Mi destino','Mi suerte',
  'Mi premio','Mi tesoro','Mi joya','Mi perla','Mi capricho','Mi dulzura',
  'Mi miel','Mi canela','Mi caramelo','Mi chocolate',
  'Mi café (porque me despiertas)','Mi flor','Mi primavera','Mi amanecer',
  'Mi atardecer','Mi estrella','Mi cometa','Mi constelación','Mi universo',
  'Mi infinito','Mi eternidad','Mi presente','Mi futuro','Mi hoy','Mi siempre',
  'Mi todavía (porque siempre te elijo)','Mi única','Mi dueña (de mi corazón)',
  'Mi reina','Mi diosa','Mi hechizo','Mi obsesión (bonita)','Mi fantasía',
  'Mi pecado (dulce)','Mi tentación','Mi fuego','Mi delirio',
  'Mi adicción (saludable)','Mi reset (porque me reinicias)',
  'Mi wifi (sin ti no conecto)','Mi playlist favorita','Mi buena decisión',
  'Mi mejor error (que no fue error)','Mi lugar favorito','Mi abrigo',
  'Mi ternura','Mi osita','Mi cielito','Mi chiquita hermosa','Mi bella',
  'Mi divina','Mi preciosa','Mi hermosa','Mi radiante','Mi deslumbrante',
  'Mi celestial','Mi magnética','Mi etérea','Mi exquisita','Mi sublime',
  'Mi majestuosa','Mi irreal','Mi perfecta','Mi encanto',
  'Mi hechizo (otra vez, porque sí)','Mi sueño (hecho realidad)',
  'Mi deseo','Mi anhelo','Mi poesía','Mi musa','Mi inspiración',
  'Mi melodía','Mi canción favorita','Mi silencio bonito',
  'Mi compañía favorita','Mi media naranja (pero más bonita)',
  'Mi otra mitad','Mi complemento','Mi equilibrio','Mi centro',
  'Mi norte','Mi rumbo','Mi puerto seguro','Mi orilla','Mi oasis',
  'Mi paraíso','Mi pedacito de cielo',
  // originales
  'Te amo','Hermosa','Divina','Te quiero','Mi amor','Eres todo',
];

const HEART_EMOJIS = ['❤️','💕','💗','💖','💝','💞','🩷','💓'];
const ROSE_EMOJI   = '🌹';
const TOTAL_ROSES  = 38;

// ── Tema ───────────────────────────────────
function setTheme(theme) {
  document.getElementById('app').classList.remove('theme-rose','theme-ocean');
  document.getElementById('app').classList.add(`theme-${theme}`);
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`btn-${theme}`).classList.add('active');
  rebuildParticles();
}

// ── Corazón paramétrico ────────────────────
function heartPoint(t) {
  const x =  16 * Math.pow(Math.sin(t), 3);
  const y = -(13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t));
  return { x, y };
}

function buildHeart() {
  const canvas = document.getElementById('heartCanvas');
  canvas.innerHTML = '';
  const W  = canvas.offsetWidth  || 380;
  const CX = W / 2;
  const CY = (canvas.offsetHeight || 380) / 2;
  const SC = W / 44;
  const roses = [];

  for (let i = 0; i < TOTAL_ROSES; i++) {
    const t = (i / TOTAL_ROSES) * 2 * Math.PI;
    const { x, y } = heartPoint(t);
    const el = document.createElement('span');
    el.classList.add('rose-petal');
    el.textContent = ROSE_EMOJI;
    el.style.left = `${CX + x*SC}px`;
    el.style.top  = `${CY + y*SC}px`;
    el.style.transform = 'translate(-50%,-50%)';
    canvas.appendChild(el);
    roses.push({ el, angle: t, cx: CX, cy: CY });
  }
  return roses;
}

// ── Animación orbital ──────────────────────
let roses = [], animFrame = null, startTime = null;

function animateRoses(ts) {
  if (!startTime) startTime = ts;
  const elapsed = (ts - startTime) / 1000;
  const canvas  = document.getElementById('heartCanvas');
  const SC      = (canvas.offsetWidth || 380) / 44;

  roses.forEach((r, i) => {
    const a = r.angle + elapsed * 0.15;
    const { x, y } = heartPoint(a);
    const w = Math.sin(elapsed * 0.7 + i * 0.4) * 3.5;
    const rot = (elapsed * 28 + i * (360/TOTAL_ROSES)) % 360;
    r.el.style.left = `${r.cx + x*SC + w*0.4}px`;
    r.el.style.top  = `${r.cy + y*SC + w}px`;
    r.el.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
  });
  animFrame = requestAnimationFrame(animateRoses);
}

function initRoses() {
  if (animFrame) cancelAnimationFrame(animFrame);
  startTime = null;
  const canvas = document.getElementById('heartCanvas');
  const CX = canvas.offsetWidth / 2;
  const CY = canvas.offsetHeight / 2;
  roses = buildHeart().map(r => ({ ...r, cx: CX, cy: CY }));
  animFrame = requestAnimationFrame(animateRoses);
}

// ── Palabras rotativas (una a la vez, sin parpadeo) ──
let wordIndex = 0;
let wordTimer = null;
let hwEls     = [];

function buildWords() {
  const container = document.getElementById('heartWords');
  container.innerHTML = '';
  hwEls = [];

  WORDS.forEach(text => {
    const el = document.createElement('span');
    el.classList.add('hw');
    el.textContent = text;
    container.appendChild(el);
    hwEls.push(el);
  });
}

// ── Fisher-Yates shuffle ──────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let shuffledWords = [];
let shufflePos    = 0;

function nextRandomWord() {
  // Cuando agotamos el mazo, rebarajamos (evitando que la última y primera sean iguales)
  if (shufflePos >= shuffledWords.length) {
    const last = shuffledWords[shuffledWords.length - 1];
    shuffledWords = shuffle(WORDS);
    if (shuffledWords[0] === last && shuffledWords.length > 1) {
      // intercambiar la primera con la segunda para evitar repetir
      [shuffledWords[0], shuffledWords[1]] = [shuffledWords[1], shuffledWords[0]];
    }
    shufflePos = 0;
  }
  return shuffledWords[shufflePos++];
}

function buildWords() {
  const container = document.getElementById('heartWords');
  container.innerHTML = '';
  // Solo necesitamos un único <span> que va cambiando de texto
  const el = document.createElement('span');
  el.classList.add('hw');
  el.id = 'hwSingle';
  container.appendChild(el);
  hwEls = [el];
}

function showNextWord() {
  const el = document.getElementById('hwSingle');
  if (!el) return;

  // Fade out
  el.classList.remove('visible');

  setTimeout(() => {
    el.textContent = nextRandomWord();
    // Fade in
    el.classList.add('visible');
  }, 1200); // esperar el fade-out de 1.2 s antes de cambiar texto

  wordTimer = setTimeout(showNextWord, 3200);
}

function initWords() {
  shuffledWords = shuffle(WORDS);
  shufflePos    = 0;
  buildWords();
  clearTimeout(wordTimer);

  const el = document.getElementById('hwSingle');
  if (el) {
    el.textContent = nextRandomWord();
    el.classList.add('visible');
  }
  wordTimer = setTimeout(showNextWord, 3200);
}

// ── Un corazón por clic, dura 2 s ─────────
let lastClick = 0;

document.addEventListener('click', (e) => {
  const now = Date.now();
  if (now - lastClick < 150) return;
  lastClick = now;

  const el = document.createElement('span');
  el.classList.add('click-heart');
  el.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
  const dx = (Math.random() - 0.5) * 70;
  el.style.setProperty('--dx', `${dx}px`);
  el.style.left = `${e.clientX}px`;
  el.style.top  = `${e.clientY}px`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
});

// ── Música ─────────────────────────────────
let musicPlaying = false;

function toggleMusic() {
  const btn    = document.getElementById('musicBtn');
  const iframe = document.getElementById('ytPlayer');
  const label  = document.getElementById('musicLabel');
  const icon   = document.getElementById('musicIcon');

  if (!musicPlaying) {
    // Nuevo ID: S8TvXhLtLa0 — mute=0 para audio, enablejsapi para control
    iframe.style.display = 'block';
    iframe.src = 'https://www.youtube.com/embed/S8TvXhLtLa0?autoplay=1&loop=1&playlist=S8TvXhLtLa0&rel=0&modestbranding=1';
    btn.classList.add('playing');
    label.textContent = '⏸ Pausar música';
    icon.textContent  = '🎶';
    musicPlaying = true;
  } else {
    iframe.src = '';
    iframe.style.display = 'none';
    btn.classList.remove('playing');
    label.textContent = '▶ Reproducir Golden Hour';
    icon.textContent  = '🎵';
    musicPlaying = false;
  }
}

// ── Partículas de fondo ────────────────────
function rebuildParticles() {
  document.querySelectorAll('.bg-particle').forEach(p => p.remove());
  const syms = ['✦','·','⋆','✧','˚','°'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('span');
    el.classList.add('bg-particle');
    el.textContent = syms[Math.floor(Math.random() * syms.length)];
    el.style.left  = `${Math.random()*100}vw`;
    el.style.fontSize = `${0.4 + Math.random()*0.6}rem`;
    el.style.animationDuration = `${15 + Math.random()*20}s`;
    el.style.animationDelay   = `-${Math.random()*20}s`;
    document.body.appendChild(el);
  }
}

// ── Scroll reveal estrofas ─────────────────
function observeStanzas() {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.stanza').forEach((s, i) => {
    s.style.animationDelay     = `${i * 0.05}s`;
    s.style.animationPlayState = 'paused';
    io.observe(s);
  });
}

// ── Init ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initRoses();
  initWords();
  rebuildParticles();
  observeStanzas();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initRoses, 300);
  });
});
