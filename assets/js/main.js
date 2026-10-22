// Portfolio — Rayan Ouriemi
// Petites interactions : menu mobile, carte des compétences, copie de l'email,
// filtre des projets, et repli de l'animation au scroll pour les navigateurs sans `animation-timeline`.

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Menu mobile -------------------------------------------------------
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    var setOpen = function (open) {
      mnav.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    };
    burger.addEventListener('click', function () { setOpen(mnav.hidden); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  }

  // ---- Carte des compétences --------------------------------------------
  var SKILLS = {
    vue: { ref: 'VU-03', name: 'Vue / Nuxt', kind: 'Framework principal', desc: 'Mon terrain de jeu quotidien : composants réactifs, rendu serveur, routes API et SEO. Hexaconnect et mon portfolio principal tournent dessus.', used: 'Hexaconnect, rayanouriemi.fr', lvl: 90, tags: ['Composition API', 'Pinia', 'SSR', 'Nitro'], wave: 'M0 28 C25 4 50 4 75 28 S125 52 150 28 S200 4 225 28 S275 52 300 28' },
    react: { ref: 'RX-18', name: 'React / Next', kind: 'Interfaces', desc: 'Composants, hooks et rendu hybride avec Next.js. L’autre grand écosystème front que je pratique en freelance.', used: 'Projets freelance', lvl: 85, tags: ['Hooks', 'App Router', 'Server Components'], wave: 'M0 28 L40 28 L40 10 L100 10 L100 46 L160 46 L160 10 L220 10 L220 46 L280 46 L280 28 L300 28' },
    ts: { ref: 'TS-05', name: 'TypeScript', kind: 'Typage & robustesse', desc: 'Des types qui documentent le code et attrapent les erreurs avant la prod. Indispensable dès qu’un projet grandit ou se partage.', used: 'Hexaconnect, outils internes', lvl: 80, tags: ['Generics', 'Zod', 'Types stricts'], wave: 'M0 28 L50 28 L60 10 L70 46 L80 28 L150 28 L160 10 L170 46 L180 28 L250 28 L260 10 L270 46 L280 28 L300 28' },
    css: { ref: 'TW-04', name: 'Tailwind / CSS', kind: 'Design & animations', desc: 'Intégration au pixel près, responsive et accessible. Animations CSS, SVG et GSAP pour des interfaces qui ont du caractère.', used: 'Kōji Coffee, Maison Brume, Kalm', lvl: 92, tags: ['Tailwind', 'Animations', 'SVG', 'GSAP'], wave: 'M0 46 L60 46 L60 10 L240 10 L240 46 L300 46' },
    node: { ref: 'ND-22', name: 'Node / API', kind: 'Back-end', desc: 'API REST, authentification, bases de données. Le côté serveur qui fait tourner les interfaces, avec Supabase, Prisma et SQL.', used: 'Hexaconnect', lvl: 70, tags: ['REST', 'Supabase', 'Prisma', 'SQL'], wave: 'M0 28 L30 28 L45 6 L60 50 L75 28 L120 28 L135 6 L150 50 L165 28 L210 28 L225 6 L240 50 L255 28 L300 28' },
    c: { ref: 'CX-23', name: 'C / C++', kind: 'Bas niveau & embarqué', desc: 'Héritage du DUT GEII : microcontrôleurs, systèmes embarqués et automatisme. Une compréhension des systèmes qui se ressent dans chaque ligne de code.', used: 'DUT GEII', lvl: 72, tags: ['Embarqué', 'Automatisme', 'Microcontrôleurs'], wave: 'M0 28 L20 28 L20 8 L35 8 L35 48 L50 48 L50 8 L65 8 L65 48 L80 48 L80 8 L95 8 L95 48 L110 48 L110 28 L300 28' },
    figma: { ref: 'FG-01', name: 'Figma', kind: 'UI / UX', desc: 'Maquettes, prototypes et design systems avant la première ligne de code. Penser l’expérience avant de l’implémenter.', used: 'Pulse, Flowstate, Atoms', lvl: 75, tags: ['Maquettes', 'Prototypes', 'Design system'], wave: 'M0 46 C40 46 40 10 80 10 C120 10 120 46 160 46 C200 46 200 10 240 10 C280 10 280 46 300 46' },
    git: { ref: 'GT-02', name: 'Git', kind: 'Versionnage', desc: 'Branches, revues de code et historique propre. Sur tous mes projets, seul comme en équipe, avec déploiement continu sur Vercel.', used: 'Tous les projets', lvl: 88, tags: ['GitHub', 'Pull requests', 'Vercel', 'CI'], wave: 'M0 28 L50 28 L60 10 L70 46 L80 28 L150 28 L160 10 L170 46 L180 28 L250 28 L260 10 L270 46 L280 28 L300 28' }
  };

  var chips = document.querySelectorAll('.chip[data-skill]');
  if (chips.length && document.getElementById('sheet')) {
    var setText = function (id, value) { document.getElementById(id).textContent = value; };
    var select = function (id) {
      var s = SKILLS[id];
      if (!s) return;
      chips.forEach(function (chip) {
        var on = chip.dataset.skill === id;
        chip.classList.toggle('chip-on', on);
        chip.setAttribute('aria-pressed', String(on));
      });
      setText('sheet-ref', s.ref);
      setText('sheet-name', s.name);
      setText('sheet-kind', s.kind);
      setText('sheet-desc', s.desc);
      setText('sheet-used', s.used);
      setText('sheet-lvl', s.lvl + '%');
      document.getElementById('sheet-bar').style.width = s.lvl + '%';
      document.getElementById('sheet-wave').setAttribute('d', s.wave);
      var tags = document.getElementById('sheet-tags');
      tags.textContent = '';
      s.tags.forEach(function (t) {
        var span = document.createElement('span');
        span.className = 'tag mono';
        span.textContent = t;
        tags.appendChild(span);
      });
    };
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { select(chip.dataset.skill); });
    });
  }

  // ---- Copier l'email -------------------------------------------------
  document.querySelectorAll('.copy[data-copy]').forEach(function (btn) {
    var label = btn.querySelector('.copy-lbl');
    btn.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(btn.dataset.copy).then(function () {
        btn.classList.add('is-done');
        label.textContent = 'Copié !';
        btn.setAttribute('aria-label', 'Adresse copiée');
        setTimeout(function () {
          btn.classList.remove('is-done');
          label.textContent = 'Copier';
          btn.setAttribute('aria-label', 'Copier l’adresse email');
        }, 2000);
      });
    });
  });

  // ---- Filtre des projets ----------------------------------------------
  var filters = document.querySelectorAll('.filter[data-filter]');
  if (filters.length) {
    var cards = document.querySelectorAll('#proj-list .proj');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.dataset.filter;
        filters.forEach(function (b) {
          b.classList.toggle('is-on', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
        var apply = function () {
          cards.forEach(function (c) { c.hidden = f !== 'all' && c.dataset.cat !== f; });
        };
        if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
        else apply();
      });
    });
  }

  // ---- Révélation au scroll (repli) -------------------------------------
  var hasScrollTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
  if (!hasScrollTimeline && !reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('io');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  }
})();
