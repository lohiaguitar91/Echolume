// Math + small helpers shared across modules.

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
// Frame-rate independent smoothing: returns interpolation factor for this dt.
export const damp = (rate, dt) => 1 - Math.exp(-rate * dt);

export const dist2 = (ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay;
  return dx * dx + dy * dy;
};
export const dist = (ax, ay, bx, by) => Math.sqrt(dist2(ax, ay, bx, by));

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Closest point on segment AB to point P. Returns {x, y, t}.
export function closestOnSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax, aby = by - ay;
  const len2 = abx * abx + aby * aby;
  let t = len2 === 0 ? 0 : ((px - ax) * abx + (py - ay) * aby) / len2;
  t = clamp(t, 0, 1);
  return { x: ax + abx * t, y: ay + aby * t, t };
}

// One round of Chaikin corner cutting for organic polylines.
export function chaikin(points, iterations = 1) {
  let pts = points;
  for (let it = 0; it < iterations; it++) {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      out.push({ x: lerp(a.x, b.x, 0.25), y: lerp(a.y, b.y, 0.25) });
      out.push({ x: lerp(a.x, b.x, 0.75), y: lerp(a.y, b.y, 0.75) });
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}

// Resample a polyline of {x,y} to roughly even spacing.
export function resample(points, spacing) {
  if (points.length < 2) return points.slice();
  const out = [{ ...points[0] }];
  let prev = points[0];
  let carry = 0;
  for (let i = 1; i < points.length; i++) {
    let cur = points[i];
    let segLen = dist(prev.x, prev.y, cur.x, cur.y);
    while (carry + segLen >= spacing) {
      const need = spacing - carry;
      const t = need / segLen;
      const nx = prev.x + (cur.x - prev.x) * t;
      const ny = prev.y + (cur.y - prev.y) * t;
      out.push({ x: nx, y: ny });
      prev = { x: nx, y: ny };
      segLen = dist(prev.x, prev.y, cur.x, cur.y);
      carry = 0;
    }
    carry += segLen;
    prev = cur;
  }
  const last = points[points.length - 1];
  const tail = out[out.length - 1];
  if (dist(tail.x, tail.y, last.x, last.y) > spacing * 0.4) out.push({ ...last });
  return out;
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
