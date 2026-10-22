// Portfolio — Rayan Ouriemi
// Petites interactions : menu mobile, carte des compétences, démo des portes logiques,
// et repli de l'animation au scroll pour les navigateurs sans `animation-timeline`.

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
    java: { ref: 'JV-17', name: 'Java', kind: 'Langage orienté objet', desc: 'Conception orientée objet, architecture MVC, interfaces JavaFX et tests unitaires. Mon langage de référence pour structurer un logiciel proprement.', used: 'Orbit Logic, projets de cours', since: 'Depuis 2022', tags: ['POO', 'JavaFX', 'JUnit', 'Maven'], wave: 'M0 28 L40 28 L40 10 L100 10 L100 46 L160 46 L160 10 L220 10 L220 46 L280 46 L280 28 L300 28' },
    c: { ref: 'CX-23', name: 'C / C++', kind: 'Bas niveau & embarqué', desc: 'Programmation de microcontrôleurs, gestion fine de la mémoire, interruptions et contraintes temps réel. Là où le logiciel touche le matériel.', used: 'Sentinelle Air, Hashline', since: 'Depuis 2021', tags: ['ESP32', 'FreeRTOS', 'libpcap', 'Make'], wave: 'M0 28 L20 28 L20 8 L35 8 L35 48 L50 48 L50 8 L65 8 L65 48 L80 48 L80 8 L95 8 L95 48 L110 48 L110 28 L300 28' },
    js: { ref: 'JS-ES', name: 'JavaScript', kind: 'Web & temps réel', desc: 'Applications web interactives, API REST et communication temps réel. Côté client avec React, côté serveur avec Node.js.', used: 'Campus Flow', since: 'Depuis 2022', tags: ['React', 'Node.js', 'TypeScript', 'WebSocket'], wave: 'M0 28 C25 4 50 4 75 28 S125 52 150 28 S200 4 225 28 S275 52 300 28' },
    web: { ref: 'HC-05', name: 'HTML / CSS', kind: 'Interfaces', desc: 'Intégration soignée, responsive et accessible. Une interface doit être aussi rigoureuse que le code qu’elle expose.', used: 'Campus Flow, ce portfolio', since: 'Depuis 2020', tags: ['Sémantique', 'Responsive', 'Accessibilité', 'Animations'], wave: 'M0 46 L60 46 L60 10 L240 10 L240 46 L300 46' },
    git: { ref: 'GT-02', name: 'Git', kind: 'Versionnage', desc: 'Branches, revues de code et historique propre. Utilisé sur tous mes projets, seul comme en équipe.', used: 'Tous les projets', since: 'Depuis 2021', tags: ['Branches', 'Pull requests', 'CI', 'Conventional commits'], wave: 'M0 28 L50 28 L60 10 L70 46 L80 28 L150 28 L160 10 L170 46 L180 28 L250 28 L260 10 L270 46 L280 28 L300 28' },
    linux: { ref: 'LX-64', name: 'Linux', kind: 'Systèmes & réseau', desc: 'Administration de base, scripts Bash, services réseau et environnements de test isolés pour l’analyse de sécurité.', used: 'Hashline, lab de VM', since: 'Depuis 2022', tags: ['Bash', 'SSH', 'systemd', 'iptables'], wave: 'M0 28 L30 28 L45 6 L60 50 L75 28 L120 28 L135 6 L150 50 L165 28 L210 28 L225 6 L240 50 L255 28 L300 28' },
    elec: { ref: 'EL-PCB', name: 'Électronique', kind: 'Matériel', desc: 'Schématique et routage de PCB, choix de composants, mesures à l’oscilloscope et soudure CMS. Du prototype à la carte fonctionnelle.', used: 'Sentinelle Air', since: 'Depuis 2021', tags: ['KiCad', 'Oscilloscope', 'Capteurs', 'Soudure CMS'], wave: 'M0 46 C40 46 40 10 80 10 C120 10 120 46 160 46 C200 46 200 10 240 10 C280 10 280 46 300 46' }
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
      setText('sheet-since', s.since);
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

  // ---- Démo des portes logiques (Orbit Logic) ---------------------------
  var inputs = { a: true, b: false };
  var switches = document.querySelectorAll('.sw[data-input]');
  if (switches.length) {
    var gates = {
      and: function (a, b) { return a && b; },
      or: function (a, b) { return a || b; },
      xor: function (a, b) { return a !== b; }
    };
    var render = function () {
      switches.forEach(function (sw) {
        var on = inputs[sw.dataset.input];
        sw.classList.toggle('sw-on', on);
        sw.setAttribute('aria-pressed', String(on));
        sw.querySelector('[data-val]').textContent = on ? '1' : '0';
      });
      document.querySelectorAll('.gate[data-gate]').forEach(function (g) {
        var out = gates[g.dataset.gate](inputs.a, inputs.b);
        g.classList.toggle('gate-on', out);
        g.querySelector('[data-out]').textContent = out ? '1' : '0';
      });
    };
    switches.forEach(function (sw) {
      sw.addEventListener('click', function () {
        inputs[sw.dataset.input] = !inputs[sw.dataset.input];
        render();
      });
    });
    render();
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
