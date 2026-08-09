// Level geometry: corridors built from authored centerlines, wall segments with
// per-segment reveal energy, spatial hash for collision + proximity queries.

import { chaikin, resample, mulberry32, dist, clamp, lerp } from './util.js';
import { TUNING } from './config.js';

const SAMPLE_SPACING = 26;
const CELL = 64;

// ---- Segment store (structure-of-arrays for the hot loops) ----
export class SegmentStore {
  constructor(capacity = 4096) {
    this.cap = capacity;
    this.n = 0;
    this.x1 = new Float32Array(capacity);
    this.y1 = new Float32Array(capacity);
    this.x2 = new Float32Array(capacity);
    this.y2 = new Float32Array(capacity);
    this.mx = new Float32Array(capacity);
    this.my = new Float32Array(capacity);
    this.energy = new Float32Array(capacity);
  }
  add(x1, y1, x2, y2) {
    if (this.n >= this.cap) return -1;
    const i = this.n++;
    this.x1[i] = x1; this.y1[i] = y1; this.x2[i] = x2; this.y2[i] = y2;
    this.mx[i] = (x1 + x2) / 2; this.my[i] = (y1 + y2) / 2;
    this.energy[i] = 0;
    return i;
  }
  clear() { this.n = 0; }
}

export class SpatialHash {
  constructor() { this.map = new Map(); }
  key(cx, cy) { return cx * 73856093 ^ cy * 19349663; }
  insertSegment(store, i) {
    const minX = Math.floor(Math.min(store.x1[i], store.x2[i]) / CELL);
    const maxX = Math.floor(Math.max(store.x1[i], store.x2[i]) / CELL);
    const minY = Math.floor(Math.min(store.y1[i], store.y2[i]) / CELL);
    const maxY = Math.floor(Math.max(store.y1[i], store.y2[i]) / CELL);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const k = this.key(cx, cy);
        let arr = this.map.get(k);
        if (!arr) { arr = []; this.map.set(k, arr); }
        arr.push(i);
      }
    }
  }
  query(x, y, r, out) {
    out.length = 0;
    const minX = Math.floor((x - r) / CELL), maxX = Math.floor((x + r) / CELL);
    const minY = Math.floor((y - r) / CELL), maxY = Math.floor((y + r) / CELL);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const arr = this.map.get(this.key(cx, cy));
        if (arr) for (const i of arr) out.push(i);
      }
    }
    return out;
  }
  clear() { this.map.clear(); }
}

// ---- Corridor construction ----
// A corridor: centerline samples with per-sample half-width. Walls are offset
// polylines; segments inside ANY corridor interior are carved away (openings).

function buildCenterline(waypoints, widths, seed) {
  const rng = mulberry32(seed);
  const pts = waypoints.map(([x, y]) => ({ x, y }));
  const smooth = chaikin(pts, 2);
  const samples = resample(smooth, SAMPLE_SPACING);
  const n = samples.length;
  // Per-sample half width: interpolate authored widths (array maps evenly over path).
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    const fi = t * (widths.length - 1);
    const i0 = Math.floor(fi), i1 = Math.min(widths.length - 1, i0 + 1);
    w[i] = lerp(widths[i0], widths[i1], fi - i0);
  }
  // Organic wobble: two slow seeded sine mixtures (radians advanced per sample —
  // keep well under Nyquist or walls alias into jagged lightning).
  const phase1 = rng() * Math.PI * 2, phase2 = rng() * Math.PI * 2;
  const freq1 = 0.30 + rng() * 0.16, freq2 = 0.70 + rng() * 0.30;
  const amp = 0.15 + rng() * 0.08; // fraction of width
  return { samples, w, phase1, phase2, freq1, freq2, amp };
}

function corridorInterior(corridor, x, y, margin) {
  // Inside if within (width - margin) of any sample point. Samples are dense
  // enough (26px) that point-distance is a fine approximation.
  const { samples, w } = corridor;
  for (let i = 0; i < samples.length; i++) {
    const d = dist(x, y, samples[i].x, samples[i].y);
    if (d < w[i] - margin) return true;
  }
  return false;
}

export function buildLevelGeometry(def) {
  const corridors = [];
  const mainC = buildCenterline(def.path, def.width, def.seed);
  corridors.push(mainC);
  if (def.extraPaths) {
    for (const ep of def.extraPaths) {
      corridors.push(buildCenterline(ep.path, ep.width, def.seed + 17 * corridors.length));
    }
  }

  const store = new SegmentStore(8192);
  const hash = new SpatialHash();

  for (let ci = 0; ci < corridors.length; ci++) {
    const c = corridors[ci];
    const { samples, w, phase1, phase2, freq1, freq2, amp } = c;
    const n = samples.length;
    for (const side of [-1, 1]) {
      let px = null, py = null;
      for (let i = 0; i < n; i++) {
        // Normal from neighbors
        const a = samples[Math.max(0, i - 1)], b = samples[Math.min(n - 1, i + 1)];
        let nx = -(b.y - a.y), ny = (b.x - a.x);
        const nl = Math.hypot(nx, ny) || 1;
        nx /= nl; ny /= nl;
        // Taper wobble to zero at path ends so endcap arcs meet the walls cleanly.
        const edge = Math.min(i, n - 1 - i);
        const taper = Math.min(1, edge / 4);
        const wob = 1 + amp * taper * (Math.sin(i * freq1 + phase1 + side) * 0.6
                             + Math.sin(i * freq2 + phase2 - side * 2) * 0.4);
        const off = w[i] * wob;
        const x = samples[i].x + nx * off * side;
        const y = samples[i].y + ny * off * side;
        if (px !== null) {
          // Carve: skip wall segments that sit inside another corridor's interior.
          const mx = (px + x) / 2, my = (py + y) / 2;
          let carved = false;
          for (let cj = 0; cj < corridors.length; cj++) {
            if (cj === ci) continue;
            if (corridorInterior(corridors[cj], mx, my, 10)) { carved = true; break; }
          }
          if (!carved) {
            const idx = store.add(px, py, x, y);
            if (idx >= 0) hash.insertSegment(store, idx);
          }
        }
        px = x; py = y;
      }
    }
    // End caps: close corridor ends with arcs (skip if another corridor swallows the end).
    for (const endIdx of [0, n - 1]) {
      const p = samples[endIdx];
      const neighbor = samples[endIdx === 0 ? 1 : n - 2];
      let dx = p.x - neighbor.x, dy = p.y - neighbor.y;
      const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl; // pointing outward
      const baseAng = Math.atan2(dy, dx);
      const r = w[endIdx];
      const STEPS = 14;
      let px2 = null, py2 = null;
      for (let s = 0; s <= STEPS; s++) {
        const ang = baseAng - Math.PI / 2 + (s / STEPS) * Math.PI;
        const x = p.x + Math.cos(ang) * r;
        const y = p.y + Math.sin(ang) * r;
        let carved = false;
        for (let cj = 0; cj < corridors.length; cj++) {
          if (cj === corridors.indexOf(corridors[ci])) continue;
          if (corridorInterior(corridors[cj], (px2 ?? x), (py2 ?? y), 10)) { carved = true; break; }
        }
        if (px2 !== null && !carved) {
          const idx = store.add(px2, py2, x, y);
          if (idx >= 0) hash.insertSegment(store, idx);
        }
        px2 = x; py2 = y;
      }
    }
  }

  return { corridors, store, hash, main: mainC };
}

// Point at fraction t (0..1) along the main corridor, offset sideways by `off`.
export function pointOnPath(geom, t, off = 0) {
  const { samples } = geom.main;
  const n = samples.length;
  const fi = clamp(t, 0, 1) * (n - 1);
  const i0 = Math.floor(fi), i1 = Math.min(n - 1, i0 + 1);
  const p0 = samples[i0], p1 = samples[i1];
  const x = lerp(p0.x, p1.x, fi - i0), y = lerp(p0.y, p1.y, fi - i0);
  if (off === 0) return { x, y };
  const a = samples[Math.max(0, i0 - 1)], b = samples[Math.min(n - 1, i1 + 1)];
  let nx = -(b.y - a.y), ny = (b.x - a.x);
  const nl = Math.hypot(nx, ny) || 1;
  return { x: x + (nx / nl) * off, y: y + (ny / nl) * off };
}

export function pathHalfWidthAt(geom, t) {
  const { w } = geom.main;
  const fi = clamp(t, 0, 1) * (w.length - 1);
  const i0 = Math.floor(fi), i1 = Math.min(w.length - 1, i0 + 1);
  return lerp(w[i0], w[i1], fi - i0);
}

// ---- Reveal system ----
export function updateReveal(store, dt, decay) {
  const e = store.energy;
  const d = decay * dt;
  for (let i = 0; i < store.n; i++) {
    if (e[i] > 0) e[i] = e[i] > d ? e[i] - d : 0;
  }
}

// Light segments as a ping ring front crosses them. prevR..curR is this frame's band.
export function pingRevealSweep(store, cx, cy, prevR, curR, strength) {
  const { mx, my, energy } = store;
  const p2 = prevR * prevR, c2 = curR * curR;
  for (let i = 0; i < store.n; i++) {
    const dx = mx[i] - cx, dy = my[i] - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 > p2 && d2 <= c2) {
      // Falloff with distance from ping origin
      const d = Math.sqrt(d2);
      const s = strength * clamp(1.15 - d / TUNING.pingMaxRadius, 0.25, 1);
      if (s > energy[i]) energy[i] = s;
    }
  }
}

// Passive aura reveal near the player (uses hash to touch few segments).
const _auraOut = [];
export function auraReveal(store, hash, x, y, radius, strength) {
  hash.query(x, y, radius, _auraOut);
  const { mx, my, energy } = store;
  for (const i of _auraOut) {
    const d = dist(mx[i], my[i], x, y);
    if (d < radius) {
      const s = strength * (1 - d / radius);
      if (s > energy[i]) energy[i] = s;
    }
  }
}
