// À propos : la « carte mère » des compétences en 3D.
// Les boutons .chip restent la source de vérité (clavier, lecteurs d'écran, fiche technique) :
// la scène suit leur sélection, et un clic sur une puce 3D clique le bouton correspondant.
import * as THREE from 'three';
import { animate, stagger } from 'animejs';
import { ACC, createRenderer, studioEnv, fontsReady, makeChip, makeTrace, makeGlow, makeGrid, pulseAt } from './chip3d.js';

const W = 120, D = 84, H = 12, LANE = 7;
const PIN = new THREE.Color('#9a9aa3');
const BASE = new THREE.Color('#24262a');
const BASE_ON = new THREE.Color('#5a2a17');
const TILT = 0.62; // angle de la caméra depuis la verticale

function fitFont(g, text, weight, size, max, u) {
  let s = size;
  do g.font = `${weight} ${s * u}px "Geist", sans-serif`;
  while (g.measureText(text).width > max * u && (s -= 0.5) > 6);
}

function drawLabel(g, Wpx, { ref, name, kind }, on) {
  const u = Wpx / W;
  g.font = `500 ${9 * u}px "Geist Mono", monospace`;
  g.letterSpacing = `${0.5 * u}px`;
  g.fillStyle = on ? '#ff5b1f' : '#8b8b94';
  g.fillText(ref, 11 * u, 19 * u);
  g.letterSpacing = '0px';
  g.beginPath();
  g.arc(Wpx - 14 * u, 15 * u, 3.6 * u, 0, Math.PI * 2);
  if (on) { g.fillStyle = '#ff5b1f'; g.fill(); } else { g.strokeStyle = '#4a4a52'; g.lineWidth = 1.2 * u; g.stroke(); }
  fitFont(g, name, 600, 15, 98, u);
  g.fillStyle = '#f4f4f5';
  g.fillText(name, 11 * u, 58 * u);
  fitFont(g, kind, 400, 9.5, 98, u);
  g.fillStyle = '#a1a1aa';
  g.fillText(kind, 11 * u, 72 * u);
}

export default async function board3d(board, reduce) {
  const buttons = [...board.querySelectorAll('.chip[data-skill]')];
  const canvas = document.createElement('canvas');
  canvas.className = 'board-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = createRenderer(canvas, '#0b0d0c'); } catch { return; }
  await fontsReady();

  const scene = new THREE.Scene();
  scene.environment = studioEnv(renderer);
  scene.environmentIntensity = 0.32;
  const camera = new THREE.PerspectiveCamera(32, 1, 10, 5000);
  const key = new THREE.DirectionalLight('#ffffff', 1.3);
  key.position.set(-300, 700, 400);
  scene.add(key, makeGrid(3200, 20, 1300, true));

  let active = Math.max(0, buttons.findIndex(b => b.classList.contains('chip-on')));
  const chips = buttons.map((btn, i) => {
    const data = {
      ref: btn.querySelector('.chip-ref').textContent,
      name: btn.querySelector('.chip-name').textContent,
      kind: btn.querySelector('.chip-kind').textContent
    };
    const c = makeChip({ w: W, d: D, h: H, quad: false, size: 512, draw: (g, Wpx, on = i === active) => drawLabel(g, Wpx, data, on) });
    const glow = makeGlow(W * 2.2);
    glow.scale.z = D / W;
    const holder = new THREE.Group();
    holder.add(glow, c.group);
    scene.add(holder);
    const on = i === active ? 1 : 0;
    return { ...c, holder, glow, st: { on, hover: 0, drop: reduce ? 0 : 90, scale: reduce ? 1 : 0.001 }, trace: null };
  });

  // ---- Disposition : deux rangées de quatre (large) ou deux colonnes (étroit).
  // On travaille en (u, v) : u le long du bus, v en travers ; le connecteur de bord est à u négatif.
  let mode = '', bus = null, revealed = reduce, focused = false;
  const view = { tx: 0, tz: 0, dist: 1000, px: 0 };
  let overview = { ...view };
  const focusOn = i => {
    const p = chips[i].holder.position;
    return { tx: overview.tx + (p.x - overview.tx) * 0.8, tz: overview.tz + (p.z - overview.tz) * 0.8, dist: overview.dist * 0.58 };
  };

  const layout = aspect => {
    const m = aspect >= 1.15 ? 'row' : 'col';
    const pitch = m === 'row' ? 165 : 150;
    const v0 = (m === 'row' ? D : W) / 2 + 58;
    const toXZ = m === 'row' ? (u, v) => [u, v] : (u, v) => [v, u];
    const uEnd = -1.5 * pitch - 110;

    if (m !== mode) {
      mode = m;
      if (bus) { bus.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); }); bus.removeFromParent(); }
      bus = new THREE.Group();
      scene.add(bus);
      const fingers = new THREE.InstancedMesh(
        new THREE.BoxGeometry(14, 1.2, 4.4),
        new THREE.MeshStandardMaterial({ color: '#c9a35a', metalness: 1, roughness: 0.3 }), chips.length
      );
      const o = new THREE.Object3D();
      chips.forEach((c, i) => {
        const line = m === 'row' ? Math.floor(i / 4) : i % 2;
        const slot = m === 'row' ? i % 4 : Math.floor(i / 2);
        const u = (slot - 1.5) * pitch, v = (line ? 1 : -1) * v0;
        const [x, z] = toXZ(u, v);
        c.holder.position.set(x, 0, z);
        // Voies ordonnées pour qu'aucune piste n'en croise une autre
        const lv = ((line ? 7 - slot : slot) - 3.5) * LANE;
        const edge = v + (line ? -1 : 1) * (m === 'row' ? D / 2 + 9 : W / 2 - 2);
        const pts = [[uEnd, lv], [u - 8, lv], [u, lv + (line ? 8 : -8)], [u, edge]].map(p => toXZ(...p));
        c.trace = makeTrace(pts, { width: 2.4, base: '#24262a' });
        c.trace.u.uReveal.value = revealed ? c.trace.length + 10 : 0;
        bus.add(c.trace.group);
        const [fx, fz] = toXZ(uEnd - 6, lv);
        o.position.set(fx, 0.8, fz);
        o.rotation.y = m === 'row' ? 0 : Math.PI / 2;
        o.updateMatrix();
        fingers.setMatrixAt(i, o.matrix);
      });
      bus.add(fingers);
    }

    const uMin = uEnd - 14, uMax = 1.5 * pitch + (m === 'row' ? W / 2 : D / 2 + 11);
    const vMax = v0 + (m === 'row' ? D / 2 + 11 : W / 2);
    const [cx, cz] = toXZ((uMin + uMax) / 2, 0);
    const [sx, sz] = m === 'row' ? [uMax - uMin, 2 * vMax] : [2 * vMax, uMax - uMin];
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(sx / 2 / (tan * aspect), sz * Math.cos(TILT) / 2 / tan) * 1.12;
    overview = { tx: cx, tz: cz + sz * 0.04, dist };
    Object.assign(view, focused ? focusOn(active) : overview);
  };

  // ---- Boucle
  const clock = new THREE.Clock();
  const frame = () => {
    const t = clock.getElapsedTime();
    chips.forEach((c, i) => {
      const { st, trace } = c;
      c.group.position.y = st.drop + st.on * 7 + st.hover * 3;
      c.group.scale.setScalar(st.scale);
      c.glow.material.opacity = st.on * 0.5 + st.hover * 0.12;
      c.pinMat.color.lerpColors(PIN, ACC, st.on);
      trace.u.uBase.value.lerpColors(BASE, BASE_ON, st.on);
      trace.u.uGain.value = 0.28 + 0.72 * st.on;
      if (!reduce) pulseAt(trace, t, i === active ? 1.6 : 4.5, i * 0.55);
    });
    camera.position.set(
      view.tx + view.px * 24,
      Math.cos(TILT) * view.dist,
      view.tz + Math.sin(TILT) * view.dist
    );
    camera.lookAt(view.tx, 0, view.tz);
    renderer.render(scene, camera);
  };
  const kick = () => { if (reduce) frame(); };

  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    layout(camera.aspect);
    frame();
  };

  // ---- Sélection : on suit les boutons
  const tween = (target, props, duration) => reduce ? Object.assign(target, props) : animate(target, { ...props, duration, ease: 'outExpo' });
  board.addEventListener('click', e => {
    const b = e.target.closest('.chip[data-skill]');
    if (!b) return;
    const i = buttons.indexOf(b);
    focused = !(focused && i === active);
    if (i !== active) {
      chips[active].redraw(false);
      tween(chips[active].st, { on: 0 }, 700);
      chips[i].redraw(true);
      tween(chips[i].st, { on: 1 }, 700);
      active = i;
    }
    const to = focused ? focusOn(i) : overview;
    if (reduce) Object.assign(view, to);
    else animate(view, { ...to, duration: 1300, ease: 'inOutQuart' });
    kick();
  });

  // ---- Survol et clic dans la scène
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let hover = -1;
  const pick = e => {
    const r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(chips.map(c => c.body))[0];
    return hit ? chips.findIndex(c => c.body === hit.object) : -1;
  };
  const setHover = i => {
    if (i === hover) return;
    if (hover >= 0) tween(chips[hover].st, { hover: 0 }, 400);
    if (i >= 0) tween(chips[i].st, { hover: 1 }, 400);
    hover = i;
    canvas.style.cursor = i >= 0 ? 'pointer' : '';
    kick();
  };
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') { setHover(pick(e)); view.px = ndc.x; }
  });
  canvas.addEventListener('pointerleave', () => { view.px = 0; setHover(-1); });
  canvas.addEventListener('click', e => {
    const i = pick(e);
    if (i >= 0) buttons[i].click();
  });

  // ---- Mise en route
  board.classList.add('board-3d');
  board.querySelector('.chips').before(canvas);
  new ResizeObserver(resize).observe(canvas);
  resize();
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !revealed) {
      revealed = true;
      animate(chips.map(c => c.st), { drop: 0, scale: 1, duration: 1100, delay: stagger(70), ease: 'outExpo' });
      animate(chips.map(c => c.trace.u.uReveal), { value: (_, i) => chips[i].trace.length + 10, duration: 1000, delay: stagger(60, { start: 400 }), ease: 'inOutQuart' });
    }
    if (!reduce) renderer.setAnimationLoop(e.isIntersecting ? frame : null);
  }, { threshold: 0.2 }).observe(canvas);
}
