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

  // ---- Terminal des projets ---------------------------------------------
  // Arborescence ~/<catégorie>/<projet>/README.md construite depuis les cartes de la page.
  var term = document.getElementById('term');
  if (term) {
    var GITHUB = 'https://github.com/rayanouriemi-sketch';
    var DIRS = { pro: 'saas', marque: 'marques', uxui: 'ux-ui' };
    var out = document.getElementById('term-out');
    var input = document.getElementById('term-in');
    var cwdEl = document.getElementById('term-cwd');
    var slug = function (s) {
      return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    };
    var fs = {};
    Object.keys(DIRS).forEach(function (k) { fs[DIRS[k]] = {}; });
    document.querySelectorAll('#proj-list .proj').forEach(function (card) {
      var q = function (sel) { return card.querySelector(sel); };
      var title = q('.proj-title').textContent;
      fs[DIRS[card.dataset.cat]][slug(title)] = {
        title: title,
        meta: q('.proj-meta').textContent.replace(/(\D)(\d{4})$/, '$1 · $2'),
        desc: q('.proj-desc').textContent,
        tags: Array.prototype.map.call(card.querySelectorAll('.tag'), function (t) { return t.textContent; }).join(', '),
        site: q('.proj-link') && q('.proj-link').href,
        git: q('.code-link') && q('.code-link').href
      };
    });

    var cwd = [];
    var history = [];
    var hIdx = 0;

    var line = function (parts, cls) {
      var div = document.createElement('div');
      if (cls) div.className = cls;
      [].concat(parts).forEach(function (p) {
        if (typeof p === 'string') { div.appendChild(document.createTextNode(p)); return; }
        var el = document.createElement(p.href ? 'a' : 'span');
        el.textContent = p.text;
        if (p.cls) el.className = p.cls;
        if (p.href) { el.href = p.href; el.target = '_blank'; el.rel = 'noopener'; }
        div.appendChild(el);
      });
      out.appendChild(div);
    };
    var link = function (href) { return { text: href.replace(/^https?:\/\//, '').replace(/\/$/, '') + ' ↗', href: href }; };

    // Résout un chemin en tableau de segments, ou null s'il n'existe pas.
    var resolve = function (path) {
      var segs = !path ? cwd.slice() : /^[~/]/.test(path) ? [] : cwd.slice();
      (path || '').split('/').forEach(function (s) {
        if (!segs || !s || s === '.' || s === '~') return;
        if (s === '..') segs.pop();
        else segs.push(s);
      });
      if (segs.length > 3 || (segs.length === 3 && segs[2] !== 'README.md')) return null;
      if (segs[0] && !fs[segs[0]]) return null;
      if (segs[1] && !fs[segs[0]][segs[1]]) return null;
      return segs;
    };
    var node = function (segs) { return segs.length >= 2 ? fs[segs[0]][segs[1]] : null; };
    // Projet par chemin, ou par nom seul depuis n'importe quel dossier.
    var find = function (path) {
      var segs = resolve(path);
      if (segs) return node(segs);
      var name = (path || '').replace(/\/(README\.md)?$/, '');
      for (var d in fs) if (fs[d][name]) return fs[d][name];
      return null;
    };
    var pwd = function () { return '~' + cwd.map(function (s) { return '/' + s; }).join(''); };
    var isFile = function (segs) { return segs.length === 3; };

    var readme = function (p) {
      line({ text: '# ' + p.title, cls: 't-cmd' });
      line(p.meta);
      line(p.desc);
      line('stack : ' + p.tags);
      if (p.site) line(['site  : ', link(p.site)]);
      line(['git   : ', link(p.git || GITHUB)]);
    };

    var CMDS = {
      help: function () {
        line([
          'ls [chemin]        lister un dossier\n',
          'cd <chemin>        changer de dossier (.., ~)\n',
          'pwd                dossier courant\n',
          'tree               toute l’arborescence\n',
          'cat <projet>       fiche du projet (README.md)\n',
          'open <projet>      ouvrir le site\n',
          'git                lien du dépôt\n',
          'whoami · clear · help'
        ].join(''));
      },
      pwd: function () { line('/home/rayan' + pwd().slice(1)); },
      whoami: function () { line('rayan — développeur web, élève ingénieur à l’ESIEA'); },
      clear: function () { out.textContent = ''; },
      ls: function (a) {
        var segs = resolve(a[0]);
        if (!segs) return line('ls: ' + a[0] + ': aucun fichier ou dossier', 't-err');
        if (isFile(segs)) return line('README.md');
        var items = segs.length ? (segs.length === 1 ? Object.keys(fs[segs[0]]) : null) : Object.keys(fs);
        if (!items) return line('README.md');
        line(items.map(function (k, i) { return { text: k + '/' + (i < items.length - 1 ? '  ' : ''), cls: 't-dir' }; }));
      },
      cd: function (a) {
        var segs = resolve(a[0] || '~');
        if (!segs || isFile(segs)) return line('cd: ' + a[0] + ': aucun dossier de ce type', 't-err');
        cwd = segs;
        cwdEl.textContent = pwd();
      },
      tree: function () {
        var keys = Object.keys(fs);
        line('~');
        keys.forEach(function (d, i) {
          var last = i === keys.length - 1;
          line([last ? '└── ' : '├── ', { text: d + '/', cls: 't-dir' }]);
          var ps = Object.keys(fs[d]);
          ps.forEach(function (p, j) { line((last ? '    ' : '│   ') + (j === ps.length - 1 ? '└── ' : '├── ') + p); });
        });
        line(['\n', link(GITHUB)]);
      },
      cat: function (a) {
        var p = find(a[0]);
        if (!p) return line('cat: ' + (a[0] || '') + ': aucun projet de ce nom (essayez ls)', 't-err');
        readme(p);
      },
      open: function (a) {
        var p = find(a[0]);
        if (!p || !p.site) return line('open: ' + (a[0] || '.') + ': aucun site à ouvrir', 't-err');
        window.open(p.site, '_blank', 'noopener');
        line(['ouverture de ', link(p.site)]);
      },
      git: function () {
        var p = node(cwd);
        line(['origin  ', link((p && p.git) || GITHUB)]);
      }
    };

    var run = function (raw) {
      var a = raw.trim().split(/\s+/);
      var cmd = a.shift();
      line([{ text: 'rayan@portfolio', cls: 'acc' }, ':' + pwd() + '$ ', { text: raw, cls: 't-cmd' }]);
      if (!cmd) return;
      if (CMDS[cmd]) CMDS[cmd](a);
      else line(cmd + ': commande introuvable — tapez help', 't-err');
    };

    // Complétion Tab sur le dernier segment du chemin.
    var complete = function () {
      var m = input.value.match(/^(\S+\s+)(.*)$/);
      if (!m) return;
      var arg = m[2];
      var cut = arg.lastIndexOf('/') + 1;
      var base = resolve(arg.slice(0, cut) || '.');
      if (!base || isFile(base)) return;
      var pool = base.length === 2 ? ['README.md'] : Object.keys(base.length ? fs[base[0]] : fs);
      var hits = pool.filter(function (k) { return k.indexOf(arg.slice(cut)) === 0; });
      if (hits.length === 1) input.value = m[1] + arg.slice(0, cut) + hits[0] + (hits[0] === 'README.md' ? '' : '/');
      else if (hits.length > 1) line(hits.join('  '));
    };

    document.getElementById('term-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value.trim()) history.push(input.value);
      hIdx = history.length;
      run(input.value);
      input.value = '';
      out.scrollTop = out.scrollHeight;
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') { e.preventDefault(); complete(); out.scrollTop = out.scrollHeight; }
      else if (e.key === 'ArrowUp' && hIdx > 0) { e.preventDefault(); input.value = history[--hIdx]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); hIdx = Math.min(hIdx + 1, history.length); input.value = history[hIdx] || ''; }
    });
    term.addEventListener('click', function (e) { if (!e.target.closest('a') && !getSelection().toString()) input.focus(); });

    line('Bienvenue. Tapez help pour la liste des commandes, ou essayez : ls, cd saas, cat hexaconnect');
    run('ls');
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
