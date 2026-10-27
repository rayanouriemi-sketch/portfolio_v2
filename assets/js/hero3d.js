// Héro : la puce « RO » du SVG d'origine, reconstruite en 3D.
// Pistes, textes et délais d'impulsion sont lus dans le SVG, qui reste affiché sans WebGL.
import * as THREE from 'three';
import { animate, stagger } from 'animejs';
import { ACC, createRenderer, studioEnv, fontsReady, makeChip, makeTrace, makeGlow, makeGrid, pulseAt } from './chip3d.js';

const C = 240; // centre du viewBox 480 × 480

function parsePath(d) {
  const pts = [];
  let x = 0, y = 0;
  for (const [, c, a, b] of d.matchAll(/([MVH])\s*([\d.]+)(?:\s+([\d.]+))?/g)) {
    if (c === 'M') { x = +a; y = +b; } else if (c === 'V') y = +a; else x = +a;
    pts.push([x - C, y - C]);
  }
  return pts;
}

// Même dessin que le dessus de puce du SVG (repères en unités du viewBox, puce de 140).
function drawTop(g, W, title, sub) {
  const u = W / 140;
  g.strokeStyle = '#2e2e36';
  g.lineWidth = 1.2 * u;
  g.setLineDash([3 * u, 5 * u]);
  g.beginPath();
  g.roundRect(16 * u, 16 * u, 108 * u, 108 * u, 8 * u);
  g.stroke();
  g.setLineDash([]);
  g.fillStyle = '#ff5b1f';
  g.beginPath();
  g.arc(20 * u, 20 * u, 4 * u, 0, Math.PI * 2);
  g.fill();
  g.textAlign = 'center';
  g.fillStyle = '#f4f4f5';
  g.font = `600 ${26 * u}px "Geist Mono", monospace`;
  g.letterSpacing = `${u}px`;
  g.fillText(title, 70 * u, 66 * u);
  g.fillStyle = '#8b8b94';
  g.font = `500 ${10 * u}px "Geist Mono", monospace`;
  g.letterSpacing = `${2 * u}px`;
  g.fillText(sub, 70 * u, 92 * u);
}

export default async function hero3d(visual, reduce) {
  const svg = visual.querySelector(':scope > svg');
  const canvas = document.createElement('canvas');
  canvas.className = 'visual-3d';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = createRenderer(canvas); } catch { return; }
  await fontsReady();

  const scene = new THREE.Scene();
  scene.environment = studioEnv(renderer);
  scene.environmentIntensity = 0.3;
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 4000);
  camera.position.set(0, 690, 620);
  camera.lookAt(0, -30, 0);

  const key = new THREE.DirectionalLight('#ffffff', 1.4);
  key.position.set(-320, 640, 260);
  scene.add(key);
  const rig = new THREE.Group();
  scene.add(rig);
  const ember = new THREE.PointLight(ACC, 0, 320, 0);
  ember.position.set(0, 14, 0);
  const glow = makeGlow(440);
  rig.add(ember, glow, makeGrid(620, 24, 310));

  // Pistes et pastilles
  const delays = [...svg.querySelectorAll('.pulse')].map(p => parseFloat(p.style.animationDelay) || 0);
  const padGeo = new THREE.CylinderGeometry(6.5, 6.5, 2, 24);
  const padMat = new THREE.MeshStandardMaterial({ color: '#3a3a41', metalness: 0.9, roughness: 0.35 });
  const coreGeo = new THREE.CircleGeometry(3.2, 20).rotateX(-Math.PI / 2);
  const traces = [...svg.querySelectorAll('.trace')].map((el, i) => {
    const pts = parsePath(el.getAttribute('d'));
    const tr = makeTrace(pts, { width: 2.6, base: '#2a2a31' });
    const [x, z] = pts.at(-1);
    const pad = new THREE.Group();
    pad.position.set(x, 1, z);
    const core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color: ACC, transparent: true, opacity: 0.25 }));
    core.position.y = 1.05;
    pad.add(new THREE.Mesh(padGeo, padMat), core);
    rig.add(tr.group, pad);
    return { ...tr, delay: delays[i] ?? 0, pad, core };
  });

  const [title, sub] = [...svg.querySelectorAll('text')].map(t => t.textContent);
  const chip = makeChip({ w: 140, d: 140, h: 16, quad: true, size: 560, draw: (g, W) => drawTop(g, W, title, sub) });
  rig.add(chip.group);

  // État animé (anime.js écrit dedans, la boucle le lit)
  const s = { lift: 150, spin: -0.6, live: 0, px: 0, py: 0, tx: 0, ty: 0, scroll: 0 };
  const clock = new THREE.Clock();
  const frame = () => {
    const t = clock.getElapsedTime();
    s.tx += (s.px - s.tx) * 0.05;
    s.ty += (s.py - s.ty) * 0.05;
    rig.rotation.set(s.ty * 0.2, s.tx * 0.35 + s.scroll * 0.7 + (reduce ? 0 : Math.sin(t * 0.35) * 0.06), 0);
    rig.position.y = -s.scroll * 90;
    chip.group.position.y = s.lift + (reduce ? 0 : Math.sin(t * 1.2) * 2.5);
    chip.group.rotation.y = s.spin;
    const breathe = 0.5 + 0.5 * Math.sin(t * Math.PI / 2);
    ember.intensity = s.live * (1 + breathe * 1.6);
    glow.material.opacity = s.live * (0.16 + breathe * 0.2);
    for (const tr of traces) {
      const k = s.live && !reduce ? pulseAt(tr, t, 3.4, tr.delay) : -1;
      tr.core.material.opacity = reduce ? 0.6 : 0.25 + 0.75 * (k >= 0 ? Math.max(0, 1 - k / 60) : 0);
    }
    renderer.render(scene, camera);
  };

  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (reduce) frame();
  };

  if (reduce) {
    Object.assign(s, { lift: 0, spin: 0, live: 1 });
    traces.forEach(tr => { tr.u.uReveal.value = tr.length + 10; });
  } else {
    traces.forEach(tr => tr.pad.scale.setScalar(0.001));
    animate(s, { lift: 0, spin: 0, duration: 1800, delay: 200, ease: 'outExpo' });
    animate(traces.map(tr => tr.u.uReveal), { value: (_, i) => traces[i].length + 10, duration: 900, delay: stagger(90, { start: 500 }), ease: 'inOutQuart' });
    animate(traces.map(tr => tr.pad.scale), { x: 1, y: 1, z: 1, duration: 700, delay: stagger(90, { start: 1250 }), ease: 'outBack(2.2)' });
    animate(s, { live: 1, duration: 900, delay: 1500, ease: 'outQuad' });

    const hero = visual.closest('.hero') || visual;
    addEventListener('pointermove', e => {
      s.px = e.clientX / innerWidth * 2 - 1;
      s.py = e.clientY / innerHeight * 2 - 1;
    }, { passive: true });
    const onScroll = () => {
      const r = hero.getBoundingClientRect();
      s.scroll = Math.min(1, Math.max(0, -r.top / r.height));
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  visual.prepend(canvas);
  new ResizeObserver(resize).observe(canvas);
  resize();
  frame();
  visual.classList.add('is-3d');
  if (!reduce) new IntersectionObserver(([e]) => renderer.setAnimationLoop(e.isIntersecting ? frame : null)).observe(canvas);
}
