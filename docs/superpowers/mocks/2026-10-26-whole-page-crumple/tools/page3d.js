// Offline whole-page crumple renderer (build tool only). Same model as crumple3d.js, but the sheet is gathered
// radially toward one point, so a full page balls up from every edge at once.
// A subdivided plane carries the band texture. Per frame the plane is deformed by a kinematic crumple:
//  - a crease network (sharp tent folds, fixed in the paper) grows in amplitude and pulls the paper in-plane,
//    so the outline wrinkles as well as the shading;
//  - both ends of the band are fed toward a gather point, pinching across and lifting where they enter;
//  - fed paper is folded onto a lumpy, layered ball whose radius grows with the paper it holds.
// Lighting: one key light from above (matching the page's downward drop shadows), ambient, a little sheen,
// translucency for back-lit facets, and ambient occlusion plus cast shadow from a height map of the paper.
import * as THREE from 'three';
import { createNoise2D, createNoise3D } from 'simplex-noise';

function prng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ease = x => { const t = Math.min(1, Math.max(0, x)); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

async function loadTex(url) {
  const img = new Image(); img.src = url; await img.decode();
  const t = new THREE.Texture(img);
  t.colorSpace = THREE.NoColorSpace; t.flipY = true; t.anisotropy = 8;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}

const VERT = `
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() { vUv = uv; vN = normal; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const DEPTH_FRAG = `
uniform sampler2D mapF; varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() { if (texture2D(mapF, vUv).a < 0.5) discard; gl_FragColor = vec4(vP.z, 0.0, 0.0, 1.0); }`;

const COLOR_FRAG = `
uniform sampler2D mapF; uniform sampler2D mapB; uniform sampler2D hmap;
uniform vec2 world; uniform vec3 L; uniform float amb; uniform float key;
uniform float aoR; uniform float aoK; uniform float shStep; uniform float shSoft; uniform float shK;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
float H(vec2 p) { return texture2D(hmap, p / world).r; }
float ao(vec3 p, vec3 n) {
  float occ = 0.0;
  for (int i = 0; i < 10; i++) {
    float a = (float(i) + 0.37) * 0.6283185;
    vec2 d = vec2(cos(a), sin(a));
    float m = 0.0;
    for (int j = 1; j <= 7; j++) {
      float r = aoR * float(j) / 7.0;
      float s = (H(p.xy + d * r) - p.z - 0.4) / r;
      m = max(m, s);
    }
    occ += m / sqrt(1.0 + m * m);
  }
  return 1.0 - aoK * occ / 10.0;
}
float shadow(vec3 p) {
  vec2 d = normalize(L.xy); float slope = L.z / length(L.xy);
  float s = 1.0;
  for (int j = 1; j <= 28; j++) {
    float r = shStep * float(j);
    float over = H(p.xy + d * r) - (p.z + r * slope) - 0.6;
    s = min(s, clamp(1.0 - over / (shSoft * (0.4 + 0.08 * float(j))), 0.0, 1.0));
  }
  return mix(1.0, s, shK);
}
void main() {
  vec4 tex = gl_FrontFacing ? texture2D(mapF, vUv) : texture2D(mapB, vUv);
  if (tex.a < 0.03) discard;
  vec3 n = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 alb = pow(tex.rgb, vec3(2.2));
  float sh = shadow(vP);
  float o = ao(vP, n);
  float ndl = dot(n, L);
  float lit = amb * o + key * max(ndl, 0.0) * sh;
  float trans = max(-ndl, 0.0) * 0.18 * sh;                // thin paper glows a little when lit from behind
  vec3 h = normalize(L + vec3(0.0, 0.0, 1.0));
  // matte paper, a faint sheen on facets turned toward the light; zero on the flat sheet so frame one matches the page
  float spec = max(pow(max(dot(n, h), 0.0), 10.0) - pow(h.z, 10.0), 0.0) * 0.05 * sh;
  vec3 c = alb * (lit + trans) + spec;
  gl_FragColor = vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)), tex.a);
}`;

window.renderFrames = async (P) => {
  const { texW, texH, bandW, bandH, mx, my, scale } = P;
  const W = Math.round(texW * scale), Hh = Math.round(texH * scale);
  const rand = prng(P.seed * 7919 + 13);
  const n2 = () => createNoise2D(rand);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, Hh, false);
  renderer.setClearColor(0x000000, 0);
  document.body.appendChild(renderer.domElement);
  const front = await loadTex(P.front), back = await loadTex(P.back || P.front);

  // ---------- grid ----------
  const seg = P.seg;
  const nx = Math.ceil(texW / seg), ny = Math.ceil(texH / seg);
  const NV = (nx + 1) * (ny + 1);
  const U = new Float32Array(NV), V = new Float32Array(NV);
  const pos = new Float32Array(NV * 3), uv = new Float32Array(NV * 2);
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const k = j * (nx + 1) + i;
    U[k] = (i / nx) * texW; V[k] = (j / ny) * texH; // V: 0 at the bottom of the band canvas
    uv[k * 2] = i / nx; uv[k * 2 + 1] = j / ny;
  }
  const idx = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
    if ((i + j) & 1) idx.push(a, b, d, a, d, c); else idx.push(a, b, c, b, d, c);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);

  // ---------- static fields in paper coordinates ----------
  const unit = Math.min(texW, texH);
  const cell = unit * P.cell;
  const K = Math.round((texW * texH) / (cell * cell) * P.creaseDensity);
  const F = new Float32Array(NV), CX = new Float32Array(NV), CY = new Float32Array(NV);
  for (let c = 0; c < K; c++) {
    const cx = rand() * texW, cy = rand() * texH;
    // creases in a strip tend to run across it, at a slant
    const th = rand() * Math.PI;
    const dx = Math.cos(th), dy = Math.sin(th), qx = -dy, qy = dx;
    const hl = cell * (0.7 + rand() * 2.4), s = cell * (0.28 + rand() * 0.42);
    const a = (rand() < 0.5 ? -1 : 1) * s * (0.5 + rand() * 0.6);
    const reach = hl + s;
    for (let k = 0; k < NV; k++) {
      const px = U[k] - cx, py = V[k] - cy;
      if (px > reach || px < -reach || py > reach || py < -reach) continue;
      const al = px * dx + py * dy; if (al > hl || al < -hl) continue;
      const ac = px * qx + py * qy; const aac = Math.abs(ac); if (aac > s) continue;
      const tap = 1 - (al / hl) * (al / hl);
      const tent = (1 - aac / s) * tap;
      F[k] += a * tent;
      // the paper takes up slack toward the crease: zero on the crease line and at the edge of the fold, so it never folds over
      const pull = -ac * (Math.abs(a) / s) * P.pull * tap * (1 - aac / s) * 2;
      CX[k] += qx * pull; CY[k] += qy * pull;
    }
  }
  // the ball: every point of the paper has a place on a lumpy, layered ball
  const na = n2(), nb = n2(), nc = n2(), nd = n2(), ne = n2(), nf = n2(), nr = n2(), nbend = n2(), nlift = n2();
  const n3 = createNoise3D(rand);
  const FAC = [];
  for (let i = 0; i < P.facets; i++) {
    const zz = rand() * 2 - 1, ph = rand() * Math.PI * 2, rr = Math.sqrt(1 - zz * zz);
    FAC.push(rr * Math.cos(ph), rr * Math.sin(ph), zz, P.rMin + rand() * (1 - P.rMin));
  }
  const SCR = [];
  for (let i = 0; i < P.sphereCreases; i++) {
    const r1 = () => { const zz = rand() * 2 - 1, ph = rand() * Math.PI * 2, rr = Math.sqrt(1 - zz * zz); return [rr * Math.cos(ph), rr * Math.sin(ph), zz]; };
    const m = r1(), off = (rand() - 0.5) * 0.9;
    // a point on the crease circle to centre its window on
    let c = r1(); const dc = c[0] * m[0] + c[1] * m[1] + c[2] * m[2] - off;
    c = [c[0] - m[0] * dc, c[1] - m[1] * dc, c[2] - m[2] * dc];
    const w = 0.07 + rand() * 0.16, len = 0.35 + rand() * 0.7;
    SCR.push(m[0], m[1], m[2], off, w, c[0], c[1], c[2], len);
  }
  const DX = new Float32Array(NV), DY = new Float32Array(NV), DZ = new Float32Array(NV), RF = new Float32Array(NV);
  const f1 = 1 / (unit * P.mapScale), f2 = 1 / (unit * P.mapScale2), k2 = P.mapAmp2;
  for (let k = 0; k < NV; k++) {
    const u = U[k], v = V[k];
    let x = na(u * f1, v * f1) + k2 * nd(u * f2, v * f2);
    let y = nb(u * f1, v * f1) + k2 * ne(u * f2, v * f2);
    let z = nc(u * f1, v * f1) + k2 * nf(u * f2, v * f2) + P.mapUp;
    const l = Math.hypot(x, y, z) || 1; x /= l; y /= l; z /= l;
    DX[k] = x; DY[k] = y; DZ[k] = z;
    // a crumpled ball is lumpy and faceted: the radius along each direction is the distance to a random polyhedron
    let rp = 1e9;
    for (let i = 0; i < FAC.length; i += 4) { const c = x * FAC[i] + y * FAC[i + 1] + z * FAC[i + 2]; if (c > 1e-3) rp = Math.min(rp, FAC[i + 3] / c); }
    const ridge = 1 - Math.abs(n3(x * P.ridgeF, y * P.ridgeF, z * P.ridgeF));
    // creases on the ball itself: tent ridges and valleys along short arcs, shared by every layer, so the outside
    // of the ball reads as one sheet crushed many times over
    let cr = 0;
    for (let i = 0; i < SCR.length; i += 9) {
      const pl = x * SCR[i] + y * SCR[i + 1] + z * SCR[i + 2] - SCR[i + 3];
      const ap = Math.abs(pl); if (ap > SCR[i + 4]) continue;
      const dx = x - SCR[i + 5], dy = y - SCR[i + 6], dz = z - SCR[i + 7];
      const win = 1 - (dx * dx + dy * dy + dz * dz) / (SCR[i + 8] * SCR[i + 8]); if (win <= 0) continue;
      cr += (i % 2 ? 1 : -1) * (1 - ap / SCR[i + 4]) * win * SCR[i + 4];
    }
    RF[k] = Math.min(rp, 1.25) * (1 - P.rRidge * ridge * ridge * ridge) * (1 - P.rLayer + P.rLayer * nr(u * f2, v * f2)) + P.sphereCrease * cr;
  }
  const BEND = new Float32Array(NV);
  for (let k = 0; k < NV; k++) BEND[k] = nbend(U[k] / (unit * 0.8), V[k] / (unit * 0.8));
  let Fmax = 0; for (let k = 0; k < NV; k++) Fmax = Math.max(Fmax, Math.abs(F[k]));

  // ---------- scene ----------
  const cam = new THREE.OrthographicCamera(0, texW, texH, 0, -2000, 2000);
  cam.position.set(0, 0, 1000); cam.lookAt(0, 0, 0);
  const rt = new THREE.WebGLRenderTarget(W, Hh, { type: THREE.FloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true });
  const Ldir = new THREE.Vector3(...P.light).normalize();
  const depthMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: DEPTH_FRAG, uniforms: { mapF: { value: front } }, side: THREE.DoubleSide });
  const colorMat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: COLOR_FRAG, side: THREE.DoubleSide, alphaToCoverage: true,
    uniforms: {
      mapF: { value: front }, mapB: { value: back }, hmap: { value: rt.texture }, world: { value: new THREE.Vector2(texW, texH) },
      L: { value: Ldir }, amb: { value: 1 - P.key * Ldir.z }, key: { value: P.key },
      aoR: { value: P.aoR }, aoK: { value: P.aoK }, shStep: { value: P.shStep }, shSoft: { value: P.shSoft }, shK: { value: P.shK },
    },
  });
  const mesh = new THREE.Mesh(geo, colorMat);
  const scene = new THREE.Scene(); scene.add(mesh);

  const Gx = P.gx * texW, Gy = P.gy * texH;
  // feed distance: wide sheets count horizontal distance a little shorter (no bow-tie), and a slow angular noise
  // makes some edges reach the ball before others, so the outline stays irregular
  const kx = Math.pow(texW / texH, (P.aniso ?? 0.6) / 2), ky = 1 / kx;
  const nang = n2();
  const metric = (du, dv) => {
    const d = Math.hypot(du, dv) || 1e-6;
    return Math.hypot(du / kx, dv / ky) * (1 + (P.irreg ?? 0.22) * nang(1.6 * du / d, 1.6 * dv / d));
  };
  let Lmax = 0;
  for (let k = 0; k < NV; k++) Lmax = Math.max(Lmax, metric(U[k] - Gx, V[k] - Gy));
  const lam = unit * P.lam, db = unit * P.db;
  const out = [];
  const meta = [];
  for (const t of P.ts) {
    const f = Math.pow(Math.min(1, Math.max(0, (t - P.feedStart) / (1 - P.feedStart - P.feedEnd))), P.feedPow);
    const Aw = smooth(0, P.wrinkleBy, t);
    const R = P.ballR * (P.r0 + (1 - P.r0) * Math.cbrt(Math.max(f, 0.002)));
    const Cz = R * 0.92;
    const enter = smooth(0, P.enterF ?? 0.06, f);
    const D = (Lmax + db) * f;
    for (let k = 0; k < NV; k++) {
      const u = U[k], v = V[k];
      const du = u - Gx, dv = v - Gy, d = Math.hypot(du, dv) || 1e-6;
      const ux = du / d, uy = dv / d;
      const dm = metric(du, dv), toReal = d / dm;
      const e = dm - D;
      const near = Math.exp(-Math.max(e, 0) / lam) * enter;
      const amp = Aw * P.wrinkle * (0.35 + 0.65 * Math.max(near, P.wrinkleFloor)) + near * P.wrinkleNear;
      const ip = Aw * P.wrinkle + near * P.nearPull;
      const attach = Math.min(R * 0.82, D);
      // paper outside the ball is drawn in along its own radius; near the ball it bunches up across the radius
      const rr = attach + Math.max(e, 0) * toReal;
      const bunch = 1 - P.pinch * near;
      let x = Gx + ux * rr + (-uy) * BEND[k] * near * unit * 0.05 + ip * CX[k];
      let y = Gy + uy * rr * bunch + ux * BEND[k] * near * unit * 0.05 + ip * CY[k];
      let z = R * 1.05 * near * near + Math.max(0, amp * (F[k] + Fmax * 0.35)) + f * P.lift * unit * near;
      const b = smooth(0, db, -e);
      if (b > 0) {
        const s = R * RF[k] + P.ballCrease * (R / P.ballR) * F[k];
        const bx = Gx + s * DX[k] * 1.04, by = Gy + s * DY[k] * 0.96, bz = Cz + s * DZ[k];
        x += (bx - x) * b; y += (by - y) * b; z += (bz - z) * b;
      }
      pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z;
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    mesh.material = depthMat;
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam);
    renderer.setRenderTarget(null);
    mesh.material = colorMat;
    renderer.clear(); renderer.render(scene, cam);
    out.push(renderer.domElement.toDataURL('image/png'));
    meta.push({ t, f, R, cx: Gx, cy: texH - Gy, cz: Cz });
  }
  // The roll: the finished ball turned about the page's vertical axis, so its top travels to the right under a fixed light.
  // One full turn in P.rollFrames steps; the page translates the ball and loops through these.
  const roll = [];
  if (P.rollFrames) {
    const base = Float32Array.from(pos);
    let cx = 0, cz = 0, cy = 0, n = 0;
    for (let k = 0; k < NV; k++) { cx += base[k * 3]; cy += base[k * 3 + 1]; cz += base[k * 3 + 2]; n++; }
    cx /= n; cy /= n; cz /= n;
    for (let i = 1; i < P.rollFrames; i++) {
      const th = (i / P.rollFrames) * Math.PI * 2, c = Math.cos(th), sn = Math.sin(th);
      for (let k = 0; k < NV; k++) {
        const x = base[k * 3] - cx, z = base[k * 3 + 2] - cz;
        pos[k * 3] = cx + x * c + z * sn; pos[k * 3 + 1] = base[k * 3 + 1]; pos[k * 3 + 2] = cz - x * sn + z * c;
      }
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals(); geo.computeBoundingSphere();
      mesh.material = depthMat;
      renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam);
      renderer.setRenderTarget(null);
      mesh.material = colorMat;
      renderer.clear(); renderer.render(scene, cam);
      roll.push(renderer.domElement.toDataURL('image/png'));
    }
    meta.push({ rollCenter: [cx, texH - cy, cz] });
  }
  renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
  return { frames: out, roll, meta, W, H: Hh };
};
window.ready = true;
