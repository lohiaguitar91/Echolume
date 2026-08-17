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
  // Chapter 3-4 vocabulary. The palette is crowded, so each of these is
  // separated by shape and scale first and colour only second — the chain
  // ladder taught us what happens when two things share a hex.
  //   hush  — a large dim region, drawn as absence. Nothing else is this dark.
  //   ice   — angular facets in cold steel, deliberately duller than the
  //           crystal's bright #dcefff so the two never trade places.
  //   warm  — a large rising zone. Warm hues are busy (mote, lure, heart), so
  //           this one is only ever a region, never a point you could collect.
  //   warden — bone white, and the only thing in the game that is not a glow.
  //           It reads as structure rather than creature until it opens.
  warden: '#d8d0c4',
  wardenCore: '#fffaf0',
  wardenJaw: '#ff3b5c',
  hush: '#2a3350',
  hushEdge: '#4a5a80',
  ice: '#9fb8c8',
  iceCore: '#e8f4fa',
  warm: '#ff8a3d',
  warmCore: '#ffd9b0',
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

  // ---- chapter 3: hush zones and brittle ice ----
  // A hush zone eats the song you sing inside it. `depth` is how much of the
  // reveal it swallows at the centre, so 0.85 leaves you nearly blind. Sing at
  // the edge and reach in, or carry light through on your aura.
  hushMinFactor: 0.08,      // never zero: a song always does *something*
  iceRadius: 15,            // shard body
  iceNoiseRadius: 470,      // how far the shatter carries — further than a song
  iceShatterTime: 0.8,      // fragments fly for this long

  // ---- casting (hold + release: throw your voice) ----
  // The one deliberate lie in the player's kit. Costs a full song, moves you
  // nowhere, and lands where you held — so hunters chase the empty water there
  // instead of you. Range is bounded or every fight would be solved from the
  // far end of the corridor.
  castRange: 420,

  // ---- wardens (the depth-14 boss) ----
  // Anchored, enormous, and blind even by this game's standards. It cannot
  // chase: it opens toward wherever your last song landed and strikes down that
  // line. Every other threat rewards moving away from your song; this one
  // rewards singing somewhere you are not, which is the whole lesson of the
  // shallows asked as a question.
  wardenRadius: 42,          // the body, which is solid and hurts
  // Tuned for a human, not for the autoplay bot: the bot sings exactly where it
  // swims, which is the one thing this boss punishes, so its survival rate says
  // nothing here. (It never actually died to the warden — the killer was a
  // hunter placed past the arena, since removed.)
  wardenReach: 280,          // how far the strike travels down the open line
  wardenJawWidth: 0.5,       // radians of the killing arc
  wardenWindup: 1.35,        // it telegraphs for this long before striking
  wardenStrike: 0.42,        // the strike itself
  wardenRecover: 1.5,        // and then it is harmless and open
  wardenTurnRate: 2.2,       // radians/sec it can re-aim while winding up

  // ---- chapter 4: warm vents ----
  // Rising water that carries you without a song, and glows enough to see by.
  // The light it gives is free light: it makes no sound, so nothing turns.
  warmForce: 620,
  warmPingEvery: 0.55,
};

// Mote chain ladder.
//
// Motes keep their amber identity at every tier. This game has no spare hues —
// mint is the vent, cyan the walls and your own aura, pink and magenta the
// hazards — so a ladder that walks through hues eventually lands on something
// else's identity. It did: tier 2 used to be #5effc2, the vent's exact value,
// while the tutorial taught "the green vent takes you deeper". A playtester
// read a good chain as a new kind of mote.
//
// So the chain speaks through size, pulse rate and a halo, none of which are
// spoken for, and all of which survive colour blindness. `accent` is used only
// on the player's own trail and the collect burst — feedback that never has to
// be identified as an object — and stays clear of every hazard hue.
export const CHAIN_TIERS = [
  { at: 0, accent: '#ffc45e', accentCore: '#fff2d0', scale: 1.00, pulse: 2.2, halo: 0.00, rings: 0 },
  { at: 3, accent: '#ffe08a', accentCore: '#fffaf0', scale: 1.12, pulse: 3.0, halo: 0.30, rings: 1 },
  { at: 4, accent: '#fff3cc', accentCore: '#fffdf4', scale: 1.26, pulse: 3.8, halo: 0.48, rings: 1 },
  { at: 6, accent: '#e9c8ff', accentCore: '#f8ecff', scale: 1.40, pulse: 4.8, halo: 0.66, rings: 2 },
  { at: 8, accent: '#b14fff', accentCore: '#f0dcff', scale: 1.56, pulse: 6.0, halo: 0.85, rings: 2 },
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
    accent: hexLerp(a.accent, b.accent, t),
    accentCore: hexLerp(a.accentCore, b.accentCore, t),
    scale: lerp(a.scale, b.scale, t),
    pulse: lerp(a.pulse, b.pulse, t),
    halo: lerp(a.halo, b.halo, t),
    rings: lerp(a.rings, b.rings, t),
  };
}

export const GAME_VERSION = '1.2.0';
export const SAVE_KEY = 'echolume.save.v1';
