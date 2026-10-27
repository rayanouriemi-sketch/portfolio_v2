// Briques 3D partagées par le héro et la carte des compétences :
// puces (boîtier, broches, étiquette dessinée au canvas), pistes à impulsions, halos et sol quadrillé.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const ACC = new THREE.Color('#ff5b1f');

export function createRenderer(canvas, clear) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: clear == null, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  if (clear != null) renderer.setClearColor(clear, 1);
  return renderer;
}

export function studioEnv(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return env;
}

// Les étiquettes sont dessinées au canvas : il faut les vraies polices avant le premier tracé.
export const fontsReady = () => Promise.all(
  ['400 16px Geist', '600 16px Geist', '500 16px "Geist Mono"', '600 16px "Geist Mono"'].map(f => document.fonts.load(f))
).catch(() => {});

// ---- Puce -------------------------------------------------------------
export function makeChip({ w, d, h, quad, size, draw }) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(w, h, d, 4, Math.min(w, d) * 0.06),
    new THREE.MeshPhysicalMaterial({ color: '#17171c', roughness: 0.45, metalness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.35 })
  );
  body.position.y = h / 2 + 1.5;

  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = Math.round(size * d / w);
  const map = new THREE.CanvasTexture(cv);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const top = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false }));
  top.position.y = h + 1.6;
  const redraw = (...args) => {
    const g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, cv.height);
    draw(g, cv.width, ...args);
    map.needsUpdate = true;
  };
  redraw();

  const step = 13, spots = [];
  const along = len => {
    const n = Math.floor(len * 0.78 / step);
    return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * step);
  };
  for (const s of [-1, 1]) {
    for (const a of along(w)) spots.push([a, s * (d / 2 + 5), 0]);
    if (quad) for (const a of along(d)) spots.push([s * (w / 2 + 5), a, Math.PI / 2]);
  }
  const pinMat = new THREE.MeshStandardMaterial({ color: '#9a9aa3', metalness: 1, roughness: 0.3 });
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(4, 2.4, 12), pinMat, spots.length);
  const o = new THREE.Object3D();
  spots.forEach(([x, z, r], i) => {
    o.position.set(x, 1.4, z);
    o.rotation.y = r;
    o.updateMatrix();
    pins.setMatrixAt(i, o.matrix);
  });

  group.add(body, top, pins);
  return { group, body, pinMat, redraw };
}

// ---- Pistes -----------------------------------------------------------
// Ruban plat le long d'une polyligne (plan XZ), avec la distance parcourue en attribut.
function ribbon(pts, width, y) {
  const pos = [], dist = [], side = [], idx = [];
  const e = width / 2;
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax0, az0] = pts[i], [bx0, bz0] = pts[i + 1];
    const len = Math.hypot(bx0 - ax0, bz0 - az0);
    const ux = (bx0 - ax0) / len, uz = (bz0 - az0) / len, nx = -uz * e, nz = ux * e;
    const ax = ax0 - ux * e, az = az0 - uz * e, bx = bx0 + ux * e, bz = bz0 + uz * e;
    const v = pos.length / 3;
    pos.push(ax + nx, y, az + nz, ax - nx, y, az - nz, bx + nx, y, bz + nz, bx - nx, y, bz - nz);
    dist.push(acc - e, acc - e, acc + len + e, acc + len + e);
    side.push(1, -1, 1, -1);
    idx.push(v, v + 2, v + 1, v + 1, v + 2, v + 3);
    acc += len;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aDist', new THREE.Float32BufferAttribute(dist, 1));
  geo.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 1));
  geo.setIndex(idx);
  return { geo, length: acc };
}

const traceVert = /* glsl */`
attribute float aDist; attribute float aSide;
varying float vDist; varying float vSide;
void main() { vDist = aDist; vSide = aSide; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;

const traceFrag = /* glsl */`
uniform vec3 uBase; uniform vec3 uAcc;
uniform float uHead; uniform float uTail; uniform float uReveal; uniform float uGain; uniform float uHalo;
varying float vDist; varying float vSide;
void main() {
  if (vDist > uReveal) discard;
  float d = uHead - vDist;
  float p = (d >= 0. && d < uTail) ? pow(1. - d / uTail, 2.) * uGain : 0.;
  float edge = 1. - abs(vSide);
  gl_FragColor = uHalo > .5 ? vec4(uAcc, p * edge * edge * .6) : vec4(mix(uBase, uAcc * 1.5, p), 1.);
  #include <colorspace_fragment>
}`;

export function makeTrace(pts, { width = 2.6, base = '#2a2a31' } = {}) {
  const { geo, length } = ribbon(pts, width, 0.6);
  const halo = ribbon(pts, width * 5, 0.4).geo;
  const u = {
    uBase: { value: new THREE.Color(base) }, uAcc: { value: ACC }, uHead: { value: -1e4 },
    uTail: { value: 70 }, uReveal: { value: 0 }, uGain: { value: 1 }
  };
  const mat = h => new THREE.ShaderMaterial({
    uniforms: { ...u, uHalo: { value: h } }, vertexShader: traceVert, fragmentShader: traceFrag, side: THREE.DoubleSide,
    ...(h && { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  });
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geo, mat(0)), new THREE.Mesh(halo, mat(1)));
  const dispose = () => group.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
  return { group, u, length, dispose };
}

// Avance l'impulsion d'une piste (boucle easée, avec un temps mort en fin de cycle).
// Renvoie la distance de la tête au-delà du bout de piste : >= 0 quand l'impulsion arrive.
export function pulseAt(trace, time, period, offset = 0) {
  let p = ((time - offset) / period) % 1;
  if (p < 0) p += 1;
  p = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(2 - 2 * p, 3) / 2;
  trace.u.uHead.value = p * (trace.length + trace.u.uTail.value) * 1.15;
  return trace.u.uHead.value - trace.length;
}

// ---- Halo et sol ------------------------------------------------------
let glowMap;
export function makeGlow(size) {
  if (!glowMap) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, '#fff');
    r.addColorStop(0.35, 'rgba(255,255,255,.35)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    glowMap = new THREE.CanvasTexture(c);
  }
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: glowMap, color: ACC, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  );
  m.position.y = 0.3;
  return m;
}

// Quadrillage (ou trame de points) qui s'estompe en cercle autour de l'origine.
export function makeGrid(size, step, fade, dots = false) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      defines: dots ? { DOTS: 1 } : {},
      uniforms: { uStep: { value: step }, uFade: { value: fade } },
      vertexShader: 'varying vec2 vP; void main() { vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: /* glsl */`
        uniform float uStep; uniform float uFade; varying vec2 vP;
        void main() {
          vec2 q = vP / uStep;
          #ifdef DOTS
            float r = length(fract(q) - .5);
            float m = 1. - smoothstep(.05, .05 + fwidth(q.x) * 1.5, r);
            float a = .11;
          #else
            vec2 g = abs(fract(q - .5) - .5) / fwidth(q);
            float m = 1. - min(min(g.x, g.y), 1.);
            float a = .07;
          #endif
          float f = 1. - smoothstep(uFade * .35, uFade, length(vP));
          gl_FragColor = vec4(1., 1., 1., m * f * a);
        }`
    })
  );
}
