// Couche « effets » : anime.js pour le titre, les chiffres et la fiche technique ;
// Three.js chargé à la demande pour la puce du héro et la carte des compétences.
// Si ce module ne charge pas (CDN, vieux navigateur), le site reste entier : rien n'est masqué avant lui.
import { animate, stagger } from 'animejs';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Titre du héro, lettre par lettre -----------------------------------
const h1 = document.querySelector('.hero .h1');
if (h1 && !reduce) {
  const lines = [[]];
  h1.childNodes.forEach(n => {
    if (n.nodeName === 'BR') lines.push([]);
    else for (const ch of n.textContent) lines.at(-1).push([ch, n.nodeType === 1 ? n.className : '']);
  });
  h1.setAttribute('aria-label', h1.innerText.replace(/\s+/g, ' ').trim());
  h1.textContent = '';
  for (const line of lines) {
    const l = document.createElement('span');
    l.className = 'h1-line';
    l.setAttribute('aria-hidden', 'true');
    for (const [ch, cls] of line) {
      const c = document.createElement('span');
      c.className = `h1-ch ${cls}`;
      c.textContent = ch;
      l.append(c);
    }
    h1.append(l);
  }
  h1.classList.remove('in');
  animate(h1.querySelectorAll('.h1-ch'), {
    translateY: ['105%', '0%'], rotate: [6, 0],
    duration: 1300, delay: stagger(38, { start: 150 }), ease: 'outExpo'
  });
}

// ---- Compteurs ----------------------------------------------------------
const nums = [...document.querySelectorAll('.stat-num, .ps-num')]
  .map(el => {
    const node = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.nodeValue));
    const m = node?.nodeValue.match(/^(\D*)(\d+)(.*)$/s);
    return m && { el, node, pre: m[1], n: +m[2], post: m[3] };
  })
  .filter(Boolean);
if (nums.length && !reduce && 'IntersectionObserver' in window) {
  nums.forEach(c => { c.node.nodeValue = c.pre + '0' + c.post; });
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const c = nums.find(x => x.el === e.target), o = { v: 0 };
    animate(o, {
      v: c.n, duration: 1400 + c.n * 25, ease: 'outExpo',
      onUpdate: () => { c.node.nodeValue = c.pre + Math.round(o.v) + c.post; }
    });
  }), { threshold: 0.6 });
  nums.forEach(c => io.observe(c.el));
}

// ---- Fiche technique (main.js met le contenu à jour, on anime l'arrivée) ----
const sheet = document.getElementById('sheet');
const chipsBox = document.querySelector('.chips');
if (sheet && chipsBox && !reduce) {
  const lvlEl = document.getElementById('sheet-lvl');
  const wave = document.getElementById('sheet-wave');
  let lvl = parseInt(lvlEl.textContent, 10) || 0;
  chipsBox.addEventListener('click', e => {
    if (!e.target.closest('.chip[data-skill]')) return;
    animate(sheet.querySelectorAll('#sheet-name, #sheet-kind, #sheet-desc, #sheet-used'), {
      opacity: [0, 1], translateY: [12, 0], filter: ['blur(4px)', 'blur(0px)'],
      duration: 700, delay: stagger(45), ease: 'outExpo'
    });
    animate(sheet.querySelectorAll('#sheet-tags .tag'), {
      opacity: [0, 1], scale: [0.85, 1], duration: 500, delay: stagger(40, { start: 140 }), ease: 'outBack'
    });
    const len = wave.getTotalLength();
    wave.style.strokeDasharray = len;
    animate(wave, { strokeDashoffset: [len, 0], duration: 900, ease: 'inOutQuart' });
    const o = { v: lvl };
    lvl = parseInt(lvlEl.textContent, 10) || 0;
    animate(o, { v: lvl, duration: 700, ease: 'outExpo', onUpdate: () => { lvlEl.textContent = Math.round(o.v) + '%'; } });
  });
}

// ---- 3D, seulement si le WebGL2 est là et sans mode économie de données ----
const webgl = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
if (webgl && !navigator.connection?.saveData) {
  const visual = document.querySelector('.hero .visual');
  if (visual) import('./hero3d.js').then(m => m.default(visual, reduce)).catch(e => console.warn("[fx]", e));

  const board = document.querySelector('.board');
  if (board) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      import('./board3d.js').then(m => m.default(board, reduce)).catch(e => console.warn("[fx]", e));
    }, { rootMargin: '400px 0px' });
    io.observe(board);
  }
}
