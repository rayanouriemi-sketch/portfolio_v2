// Pied de page : paysage nocturne peint en touches (ciel, aurore ambrée, collines, arbre, tente éclairée, champ).
// Un seul shader plein cadre : la scène est décrite en 2D, puis le champ et l'arbre sont repeints en coups de pinceau.
import * as THREE from 'three';
import { createRenderer } from './chip3d.js';

const frag = /* glsl */`
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uPtr;
varying vec2 vUv;

const vec3 ACC = vec3(1., .357, .122);
const vec3 AMB = vec3(1., .70, .32);
vec2 TENT; vec2 TREE;

float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + 1.), f.x), f.y);
}
float fbm(vec2 p) { float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a * n(p); p *= 2.03; a *= .5; } return v; }

float farHill(float x) { return .41 + .045 * sin(x * 1.3 + .8) + .025 * sin(x * 3.1 + 2.) + .035 * (fbm(vec2(x * 1.5, 1.)) - .5); }
float nearHill(float x) { return .33 + .03 * sin(x * 2.2 + 1.7) + .015 * sin(x * 5.1); }
float field(float x) { return .25 + .022 * sin(x * 1.9 + .3) + .008 * sin(x * 5.3); }

float flicker() { return .88 + .12 * sin(uTime * 9.) * sin(uTime * 3.7 + 1.); }
float light(vec2 c) { return exp(-length((c - TENT - vec2(0., .03)) * vec2(.8, 1.5)) * 5.5) * flicker(); }

float canopy(vec2 p) {
  vec2 q = p - TREE;
  float d = length(q - vec2(0., .25)) - .085;
  d = min(d, length(q - vec2(-.085, .21)) - .072);
  d = min(d, length(q - vec2(.09, .22)) - .075);
  d = min(d, length(q - vec2(-.13, .14)) - .06);
  d = min(d, length(q - vec2(.14, .14)) - .064);
  d = min(d, length(q - vec2(.02, .15)) - .085);
  d = min(d, length(q - vec2(-.04, .32)) - .055);
  return d + (fbm(q * 26.) - .5) * .035;
}

vec3 sky(vec2 p) {
  float y = p.y;
  vec3 c = mix(vec3(.11, .05, .03), vec3(.03, .028, .042), smoothstep(.3, .72, y));
  c = mix(c, vec3(.016, .016, .024), smoothstep(.7, 1., y));
  float wave = y - .52 - .07 * sin(p.x * 1.1 + uTime * .05) - .05 * fbm(vec2(p.x * 2., uTime * .03));
  float band = exp(-pow(wave * 6.5, 2.));
  float curtain = pow(fbm(vec2(p.x * 9. + uTime * .04, y * 1.4)), 2.) * smoothstep(.34, .5, y);
  c += mix(ACC, AMB, fbm(vec2(p.x * 3., 1.))) * band * curtain * .6;
  vec2 g = p * 90.; vec2 id = floor(g); float r = h(id);
  if (r > .982) {
    vec2 f = fract(g) - .5 - (vec2(h(id + 3.), h(id + 7.)) - .5) * .6;
    float tw = .55 + .45 * sin(uTime * (1. + r * 3.) + r * 40.);
    c += vec3(1., .92, .85) * smoothstep(.1, 0., length(f)) * tw * smoothstep(.4, .75, y);
  }
  return c;
}

// Un trait court par cellule (et ses voisines) : renvoie le centre du trait gagnant et son aléa.
vec4 strokes(vec2 p, float s, float kind) {
  vec2 id0 = floor(p / s);
  vec4 best = vec4(0.); float bz = -1.;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = id0 + vec2(i, j);
    float r = h(id + kind * 17.);
    vec2 c = (id + .5 + (vec2(h(id + 1.3), h(id + 2.7)) - .5) * .8) * s;
    float a = kind < .5 ? 1.5708 + (r - .5) * 1.2 + sin(uTime * .8 + c.x * 6.) * .12 : r * 3.1416;
    vec2 dir = vec2(cos(a), sin(a)), q = p - c;
    float d = length(q - dir * clamp(dot(q, dir), -s * .6, s * .6));
    if (d < s * .32 && r > bz) { bz = r; best = vec4(c, r, 1.); }
  }
  return best;
}

vec3 grass(vec2 c, float r) {
  float fy = field(c.x);
  vec3 col = mix(vec3(.05, .042, .03), vec3(.16, .11, .05), r);
  col = mix(col, vec3(.08, .09, .055), step(.62, h(c * 7.)));
  if (h(c * 13.1) > .86) col = mix(ACC, AMB, h(c * 3.3)) * (.45 + .2 * r);
  col *= mix(.45, 1., 1. - smoothstep(0., fy, c.y));
  return col + AMB * light(c) * .6;
}

vec3 leaves(vec2 c, float r) {
  vec3 col = mix(vec3(.06, .045, .03), vec3(.19, .12, .05), r);
  if (h(c * 9.7) > .9) col = AMB * .5;
  col += vec3(.02, .02, .035) * smoothstep(.0, .2, c.y - TREE.y - .18);
  return col + AMB * light(c) * 1.1;
}

void main() {
  float A = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * A, vUv.y);
  TENT = vec2(A * .44, field(A * .44) - .035);
  TREE = vec2(A * .6, field(A * .6) - .005);
  vec2 par = uPtr * .012;

  vec3 col = sky(p + par * .3);
  float fh = farHill(p.x + par.x * .6);
  col = mix(col, mix(vec3(.05, .036, .05), col, .35), step(p.y, fh));
  col = mix(col, vec3(.032, .026, .034), step(p.y, nearHill(p.x + par.x * .8)));

  float fy = field(p.x);
  if (p.y < fy + .012) {
    if (p.y < fy) col = vec3(.045, .034, .024) * (1. - smoothstep(0., fy, p.y) * .5);
    vec4 s = strokes(p, .0085, 0.);
    if (s.w > 0. && s.y < fy) col = grass(s.xy, s.z);
  }

  // Arbre
  vec2 q = p - TREE;
  if (q.y > -.02 && q.y < .17 && abs(q.x + .004 * sin(q.y * 30.)) < .013 - q.y * .025) col = vec3(.03, .022, .018) + AMB * light(p) * .25;
  float cd = canopy(p);
  if (cd < .012) {
    if (cd < 0.) col = vec3(.035, .026, .02);
    vec4 s = strokes(p, .0092, 1.);
    if (s.w > 0. && canopy(s.xy) < 0.) col = leaves(s.xy, s.z);
  }

  // Tente éclairée de l'intérieur
  vec2 t = p - TENT;
  float fl = flicker();
  if (t.y > 0. && t.y < .065 && abs(t.x) < (.065 - t.y) * .85) {
    col = mix(ACC, AMB, .35 + t.y * 4.) * (.85 + .2 * fl);
    if (abs(t.x) < (.034 - t.y) * .45) col = mix(AMB, vec3(1., .93, .8), .4) * fl;
  }
  col += ACC * exp(-length((p - TENT - vec2(0., .03)) * vec2(1., 1.5)) * 13.) * .45 * fl;

  gl_FragColor = vec4(col, 1.);
}`;

export default function footer3d(scene, reduce) {
  const canvas = document.createElement('canvas');
  let renderer;
  try { renderer = createRenderer(canvas, '#060608'); } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));

  const u = { uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uPtr: { value: new THREE.Vector2() } };
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: u, fragmentShader: frag, depthTest: false,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }'
  }));
  const world = new THREE.Scene();
  world.add(quad);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const ptr = new THREE.Vector2();
  const clock = new THREE.Clock();
  let skip = false;
  const frame = () => {
    // ponytail: 30 i/s suffisent pour une scène lente ; passer à 60 si on anime plus vite
    if ((skip = !skip) && !reduce) return;
    u.uTime.value = clock.getElapsedTime() + 20;
    u.uPtr.value.lerp(ptr, 0.04);
    renderer.render(world, camera);
  };
  const resize = () => {
    const { width, height } = scene.getBoundingClientRect();
    if (!width) return;
    renderer.setSize(width, height, false);
    renderer.getDrawingBufferSize(u.uRes.value);
    skip = true;
    frame();
  };

  scene.append(canvas);
  new ResizeObserver(resize).observe(scene);
  resize();
  scene.classList.add('is-3d');
  if (reduce) return;
  addEventListener('pointermove', e => ptr.set(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
  new IntersectionObserver(([e]) => renderer.setAnimationLoop(e.isIntersecting ? frame : null)).observe(scene);
}
