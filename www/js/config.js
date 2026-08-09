// Central palette + tuning. All gameplay feel lives here so it can be tuned in one place.

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

  // Hazards
  urchinHitRadius: 20,
  urchinVisualRadius: 30,
  hunterRadius: 12,
  hunterSenseRadius: 470,   // hears pings within this range
  hunterChaseSpeed: 110,    // scaled with the snappier player
  hunterWanderSpeed: 30,
  hunterCalmTime: 4.0,      // s after reaching ping site before calming
  hunterHitRadius: 16,

  // Health
  maxHearts: 3,
  invulnTime: 1.4,          // s of i-frames after damage

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

export const GAME_VERSION = '1.0.0';
export const SAVE_KEY = 'echolume.save.v1';
