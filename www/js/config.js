// Central palette + tuning. All gameplay feel lives here so it can be tuned in one place.

import { clamp, lerp, hexLerp } from './util.js';

export const PALETTE = {
  bgTop: '#030711',
  bgBottom: '#071427',
  terrain: '#35e0ff',
  terrainCore: '#c8ffff',
  mote: '#ffc45e',
  moteCore: '#fff2d0',
  urchin: '#ff4f9a',
  urchinCore: '#ffd3e8',
  hunter: '#b14fff',
  hunterAlert: '#ff3b5c',
  // Chapter 2 vocabulary. Lures wear the mote's amber while baiting (that's the
  // trick) and only show these colours once they've been sung at or sprung.
  lure: '#ff5fb0',
  lureCore: '#ffd3e8',
  crystal: '#dcefff',
  crystalCore: '#ffffff',
  heart: '#ff6f91',
  heartCore: '#ffe9f0',
  leviathan: '#9d7bff',
  leviathanCore: '#e6dcff',
  player: '#eafcff',
  playerAura: '#7ef0ff',
  vent: '#5effc2',
  ventCore: '#eafff6',
  current: '#3f6fff',
  ping: '#8ef4ff',
  uiAccent: '#7ef0ff',
};

// High-contrast variant: brighter cores, stronger separation for low-vision / bright-sun play.
export const PALETTE_CONTRAST = {
  ...PALETTE,
  bgTop: '#000000',
  bgBottom: '#02060f',
  terrain: '#6ef4ff',
  mote: '#ffd98a',
  urchin: '#ff6ab0',
  hunter: '#c76bff',
  vent: '#7dffd2',
  lure: '#ff7cc2',
  crystal: '#f2f9ff',
  heart: '#ff89a6',
  leviathan: '#b79bff',
};

export const TUNING = {
  // Simulation
  fixedDt: 1 / 60,
  maxFrameDt: 1 / 12,       // clamp long frames (hidden tab, hitches)

  // Player physics (units are CSS px at zoom 1, seconds)
  // Impulse and drag rise together: each song is a punchy dart that settles
  // fast, but glide distance per tap (impulse/drag) stays ~constant so level
  // balance is unchanged.
  playerRadius: 10,
  drag: 0.70,               // exponential velocity decay per second (v *= exp(-drag*dt))
  sink: 14,                 // gentle downward drift, u/s^2
  pingImpulse: 300,         // added velocity toward tap point
  maxSpeed: 440,
  wallBounce: 0.45,         // velocity kept along normal after wall hit
  wallFriction: 0.92,       // tangential velocity kept on wall hit
  hardHitSpeed: 200,        // impact speed that counts as a "thud" (fx only)

  // Ping / reveal
  pingRingSpeed: 540,       // u/s expansion (keeps reveal ahead of faster darts)
  pingMaxRadius: 640,
  pingRevealDecay: 0.32,    // reveal energy lost per second (walls stay lit ~3s)
  auraRadius: 78,           // passive faint reveal around player
  auraStrength: 0.5,        // max reveal energy from aura
  pingCooldown: 0.12,       // s between pings (prevents spam-mash physics)

  // Motes
  moteRadius: 6,
  moteMagnetRadius: 52,
  moteMagnetPull: 340,      // u/s^2 toward player inside magnet radius
  moteCollectRadius: 17,
  moteGlowPerMote: 0.04,    // aura growth per mote eaten this run
  moteGlowCap: 0.45,

  // Hazards
  urchinHitRadius: 20,
  urchinVisualRadius: 30,
  hunterRadius: 12,
  hunterSenseRadius: 470,   // hears pings within this range
  hunterChaseSpeed: 110,    // scaled with the snappier player
  hunterWanderSpeed: 30,
  hunterCalmTime: 4.0,      // s after reaching ping site before calming
  hunterHitRadius: 16,

  // Lures — chapter 2. A false mote on a tether: it wears the amber until you
  // are close enough to swallow, then it snaps. The snap is loud.
  // Bait radius is a lure's real footprint, not its hit radius: keep it well
  // under a deep corridor's half-width or it walls the passage off entirely.
  lureBaitRadius: 50,       // player distance that springs it
  lureLungeSpeed: 320,
  lureLungeTime: 0.5,       // s of committed lunge before it hauls back
  lureHitRadius: 15,
  lureRecoverTime: 3.4,     // s dark and harmless before it re-baits
  lureNoiseRadius: 340,     // hunters and leviathans hear the snap

  // Bloom crystals — chapter 2. A song that touches one is answered by a
  // silent bloom of light from the crystal: reach without spending a song,
  // and without waking anything.
  crystalRadius: 13,
  crystalRecharge: 7.0,     // s from spent to charged

  // Leviathan — chapter boss. Blind, enormous, and patient. It cannot be
  // killed; the room is the fight.
  leviathanHeadRadius: 26,
  leviathanHitRadius: 24,
  leviathanBodyRadius: 14,  // what actually collides with rock, so it can swim
  leviathanPatrolSpeed: 52,
  leviathanHuntSpeed: 178,   // slower than a fleeing lume, faster than a hesitating one
  leviathanSenseRadius: 900,
  leviathanCalmTime: 5.5,   // s at the sound before it loses interest
  leviathanSegments: 9,
  leviathanThreatRadius: 520,

  // Health
  maxHearts: 3,
  invulnTime: 1.4,          // s of i-frames after damage
  heartMoteCollectRadius: 22,

  // Camera
  camLerp: 6.5,             // per-second smoothing factor (keeps up with darts)
  camLookahead: 0.22,       // fraction of velocity added to target
  // Adaptive zoom: world scale tracks the viewport's short edge so corridors
  // feel the same width on a small phone, a big phone, and a tablet.
  zoomRefDim: 390,          // css px short-edge that maps to zoom 1.0
  zoomMin: 0.85,
  zoomMax: 1.25,

  // Currents
  currentForce: 150,

  // Vent (exit)
  ventRadius: 34,

  // Abyss (endless)
  abyssChunkHeight: 900,
  abyssStartWidth: 260,
  abyssMinWidth: 120,
  abyssDepthPerMeter: 10,   // world units per displayed meter
};

// Mote chain ladder. Hue, radius, and pulse rate all step together so the
// chain is legible without color vision.
export const CHAIN_TIERS = [
  { at: 0, color: '#ffc45e', core: '#fff2d0', scale: 1.00, pulse: 2.2 },
  { at: 3, color: '#ffe08a', core: '#fffaf0', scale: 1.10, pulse: 3.0 },
  { at: 4, color: '#5effc2', core: '#eafff6', scale: 1.22, pulse: 3.8 },
  { at: 6, color: '#7ef0ff', core: '#eafcff', scale: 1.34, pulse: 4.8 },
  { at: 8, color: '#b14fff', core: '#f0dcff', scale: 1.48, pulse: 6.0 },
];
export const CHAIN_BLOOM_AT = 8;

export function chainTierIndex(combo) {
  let idx = 0;
  for (let i = 0; i < CHAIN_TIERS.length; i++) if (combo >= CHAIN_TIERS[i].at) idx = i;
  return idx;
}

// Interpolated style for a fractional tier position (lets the chain cool smoothly).
export function chainStyle(displayIndex) {
  const d = clamp(displayIndex, 0, CHAIN_TIERS.length - 1);
  const i0 = Math.floor(d), i1 = Math.min(CHAIN_TIERS.length - 1, i0 + 1);
  const t = d - i0;
  const a = CHAIN_TIERS[i0], b = CHAIN_TIERS[i1];
  return {
    color: hexLerp(a.color, b.color, t),
    core: hexLerp(a.core, b.core, t),
    scale: lerp(a.scale, b.scale, t),
    pulse: lerp(a.pulse, b.pulse, t),
  };
}

export const GAME_VERSION = '1.0.0';
export const SAVE_KEY = 'echolume.save.v1';
