// Entity setup + per-entity state. Positions may be authored as absolute [x,y]
// or as {t, off, branch} fractions along a corridor centerline.

import { mulberry32, lerp, clamp } from './util.js';
import { TUNING } from './config.js';

function pointOnCorridor(corridor, t, off = 0) {
  const { samples } = corridor;
  const n = samples.length;
  const fi = clamp(t, 0, 1) * (n - 1);
  const i0 = Math.floor(fi), i1 = Math.min(n - 1, i0 + 1);
  const p0 = samples[i0], p1 = samples[i1];
  const x = lerp(p0.x, p1.x, fi - i0), y = lerp(p0.y, p1.y, fi - i0);
  const a = samples[Math.max(0, i0 - 1)], b = samples[Math.min(n - 1, i1 + 1)];
  let dx = b.x - a.x, dy = b.y - a.y;
  const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  return { x: x + -dy * off, y: y + dx * off, dirX: dx, dirY: dy };
}

function resolvePos(spec, geom) {
  if (Array.isArray(spec)) return { x: spec[0], y: spec[1], dirX: 0, dirY: 1 };
  const corridor = geom.corridors[spec.branch || 0];
  return pointOnCorridor(corridor, spec.t, spec.off || 0);
}

export function setupEntities(def, geom) {
  const rng = mulberry32(def.seed * 7 + 13);
  const main = geom.corridors[0];

  const startP = pointOnCorridor(main, 0, 0);
  const ventP = pointOnCorridor(main, 1, 0);

  const player = {
    x: startP.x, y: startP.y, vx: 0, vy: 0,
    hearts: TUNING.maxHearts, invuln: 0,
    motes: 0, pings: 0,
    breathe: rng() * 6, dead: false,
    facing: 0,
  };

  // Motes
  const motes = [];
  const placeMotes = (corridor, count, seedOffset) => {
    const r2 = mulberry32(def.seed * 31 + seedOffset);
    for (let i = 0; i < count; i++) {
      const t = 0.1 + (0.82 * (i + 0.5)) / count + (r2() - 0.5) * 0.04;
      const n = corridor.samples.length;
      const wi = Math.round(clamp(t, 0, 1) * (n - 1));
      const halfW = corridor.w[wi];
      const off = (r2() - 0.5) * 2 * Math.max(0, halfW - 30);
      const p = pointOnCorridor(corridor, t, off);
      motes.push({ x: p.x, y: p.y, taken: false, reveal: 0, phase: r2() * 6.28, driftPhase: r2() * 6.28 });
    }
  };
  placeMotes(main, def.moteCount || 0, 1);
  if (def.extraMotes) {
    for (const em of def.extraMotes) placeMotes(geom.corridors[em.branch], em.count, 2 + em.branch);
  }

  // Urchins
  const urchins = (def.urchins || []).map((spec) => {
    const p = resolvePos(spec, geom);
    const spikes = [];
    const nSpikes = 9 + Math.floor(rng() * 4);
    for (let i = 0; i < nSpikes; i++) spikes.push((i / nSpikes) * Math.PI * 2 + rng() * 0.3);
    return { x: p.x, y: p.y, reveal: 0, phase: rng() * 6.28, spikes };
  });

  // Hunters
  const hunters = (def.hunters || []).map((spec) => {
    const p = resolvePos(spec, geom);
    return {
      x: p.x, y: p.y, vx: 0, vy: 0,
      homeX: p.x, homeY: p.y,
      wanderR: spec.wanderR || 140,
      fast: !!spec.fast,
      state: 'wander', alertT: 0,
      targetX: p.x, targetY: p.y,
      retargetT: 0,
      reveal: 0, phase: rng() * 6.28,
    };
  });

  // Currents
  const currents = (def.currents || []).map((spec) => {
    const p = resolvePos(spec, geom);
    let dx = p.dirX, dy = p.dirY;
    if (spec.mode === 'against') { dx = -dx; dy = -dy; }
    else if (spec.mode === 'across') { const t = dx; dx = -dy; dy = t; }
    return {
      x: p.x, y: p.y, r: spec.r || 140,
      dirX: dx, dirY: dy,
      strength: (spec.strength || 1) * TUNING.currentForce,
      phase: rng() * 6.28, emitT: 0,
    };
  });

  // Lures: bait first, teeth second. `snapped` stays true once sprung so the
  // level remembers which lights lied to you.
  const lures = (def.lures || []).map((spec) => {
    const p = resolvePos(spec, geom);
    return {
      x: p.x, y: p.y, homeX: p.x, homeY: p.y,
      vx: 0, vy: 0,
      state: 'bait', t: 0, snapped: false,
      reveal: 0, phase: rng() * 6.28, driftPhase: rng() * 6.28,
    };
  });

  // Bloom crystals: charged and waiting for a song to answer.
  const crystals = (def.crystals || []).map((spec) => {
    const p = resolvePos(spec, geom);
    return { x: p.x, y: p.y, charge: 1, reveal: 0, phase: rng() * 6.28, spin: rng() * 6.28 };
  });

  // Heart motes: one per deep level, off the safe line, usually guarded.
  const heartMotes = (def.heartMotes || []).map((spec) => {
    const p = resolvePos(spec, geom);
    return { x: p.x, y: p.y, taken: false, reveal: 0, phase: rng() * 6.28, beat: 0 };
  });

  // Leviathan: one per boss level, orbiting its lair on a readable loop.
  const leviathans = (def.leviathans || []).map((spec) => {
    const p = resolvePos(spec, geom);
    const patrolR = spec.patrolR || 200;
    const start = { x: p.x + patrolR, y: p.y };
    return {
      x: start.x, y: start.y, vx: 0, vy: 0,
      homeX: p.x, homeY: p.y,
      patrolR,
      speedScale: spec.speedScale || 1,
      angle: 0,
      spin: spec.reverse ? -1 : 1,
      state: 'patrol', alertT: 0,
      targetX: start.x, targetY: start.y,
      reveal: 0, phase: rng() * 6.28,
      trail: Array.from({ length: TUNING.leviathanSegments }, () => ({ x: start.x, y: start.y })),
    };
  });

  const vent = { x: ventP.x, y: ventP.y, discovered: false, reveal: 0, phase: 0 };

  return { player, motes, urchins, hunters, currents, lures, crystals, heartMotes, leviathans, vent };
}
