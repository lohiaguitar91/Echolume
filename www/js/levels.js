// Hand-authored level content. Coordinates are world px, y grows downward.
// Each level teaches or tests exactly one new idea; widths shrink and hazards
// compound gradually. Star rules: reach vent (1), collect motePct (2), finish
// within maxPings (3).

export const LEVELS = [
  {
    id: 1, name: 'First Light', seed: 101,
    path: [[0, 0], [60, 260], [-40, 520], [80, 800], [0, 1080], [90, 1340]],
    width: [120, 110, 105],
    moteCount: 8,
    stars: { motePct: 0.75, maxPings: 26 },
    hints: [
      { t: 0.0, text: 'Tap the water. Your song lights the dark.' },
      { t: 0.22, text: 'Every song also carries you. Tap where you want to go.' },
      { t: 0.62, text: 'Gather the amber motes. Each one feeds your glow.' },
      { t: 0.88, text: 'The green vent leads deeper.' },
    ],
  },
  {
    id: 2, name: 'The Garden', seed: 202,
    path: [[0, 0], [-140, 240], [-180, 520], [-40, 760], [160, 900], [260, 1180], [140, 1460], [200, 1720]],
    width: [115, 130, 100],
    extraPaths: [
      { path: [[-40, 760], [-260, 900], [-320, 1150]], width: [85, 75] },
    ],
    moteCount: 12,
    extraMotes: [{ branch: 1, count: 4 }],
    stars: { motePct: 0.8, maxPings: 34 },
    hints: [
      { t: 0.3, text: 'Side passages hide more motes. Worth the detour?' },
      { t: 0.9, text: 'Stars remember how gracefully you swim.' },
    ],
  },
  {
    id: 3, name: 'Thorns', seed: 303,
    path: [[0, 0], [90, 280], [-60, 560], [60, 860], [-90, 1140], [40, 1420], [-20, 1700]],
    width: [110, 95, 90],
    moteCount: 12,
    urchins: [{ t: 0.3, off: -34 }, { t: 0.46, off: 40 }, { t: 0.63, off: -44 }, { t: 0.78, off: 30 }],
    stars: { motePct: 0.75, maxPings: 34 },
    hints: [
      { t: 0.2, text: 'Pink thorns wound what touches them. Sing before you rush.' },
    ],
  },
  {
    id: 4, name: 'Hush', seed: 404,
    path: [[0, 0], [-110, 260], [-60, 560], [-190, 840], [-60, 1120], [-160, 1420], [-80, 1720], [-140, 1980]],
    width: [105, 95, 92],
    moteCount: 12,
    hunters: [{ t: 0.5, off: 0, wanderR: 130 }],
    stars: { motePct: 0.7, maxPings: 30 },
    hints: [
      { t: 0.28, text: 'Something ahead listens for your song.' },
      { t: 0.44, text: 'It swims toward the last place you sang. Glide quiet. Let it lose you.' },
    ],
  },
  {
    id: 5, name: 'Split', seed: 505,
    path: [[0, 0], [120, 260], [80, 560], [210, 830], [120, 1130], [230, 1420], [120, 1700], [180, 2000]],
    width: [105, 92, 88],
    extraPaths: [
      { path: [[80, 560], [-90, 780], [-130, 1080], [-10, 1320], [120, 1420]], width: [72, 66] },
    ],
    moteCount: 10,
    extraMotes: [{ branch: 1, count: 7 }],
    urchins: [{ branch: 1, t: 0.45, off: -20 }, { branch: 1, t: 0.7, off: 24 }, { t: 0.7, off: -38 }],
    stars: { motePct: 0.8, maxPings: 36 },
    hints: [{ t: 0.24, text: 'The narrow fork glitters. The wide fork forgives.' }],
  },
  {
    id: 6, name: 'Downdraft', seed: 606,
    path: [[0, 0], [-80, 300], [40, 620], [-60, 960], [60, 1300], [-40, 1660], [30, 2000]],
    width: [100, 90, 86],
    moteCount: 12,
    currents: [
      { t: 0.3, off: 0, r: 150, mode: 'along', strength: 1.0 },
      { t: 0.55, off: 0, r: 160, mode: 'across', strength: 0.9 },
      { t: 0.8, off: 0, r: 150, mode: 'along', strength: 1.1 },
    ],
    urchins: [{ t: 0.58, off: 46 }],
    stars: { motePct: 0.75, maxPings: 30 },
    hints: [{ t: 0.2, text: 'Blue water moves on its own. Ride it, or sing against it.' }],
  },
  {
    id: 7, name: 'Needle', seed: 707,
    path: [[0, 0], [70, 260], [-50, 520], [60, 800], [-60, 1080], [50, 1360], [-40, 1640], [40, 1920]],
    width: [92, 74, 68],
    moteCount: 12,
    urchins: [
      { t: 0.22, off: 0 }, { t: 0.34, off: -30 }, { t: 0.45, off: 28 },
      { t: 0.56, off: 0 }, { t: 0.67, off: -26 }, { t: 0.78, off: 26 }, { t: 0.88, off: 0 },
    ],
    stars: { motePct: 0.7, maxPings: 34 },
    hints: [{ t: 0.12, text: 'Thread the needle. Short, soft songs steer best.' }],
  },
  {
    id: 8, name: 'Two Ears', seed: 808,
    path: [[0, 0], [-120, 280], [-40, 580], [-170, 860], [-40, 1160], [-150, 1460], [-30, 1760], [-110, 2060], [-40, 2320]],
    width: [102, 92, 88],
    moteCount: 14,
    hunters: [
      { t: 0.32, off: -20, wanderR: 150 },
      { t: 0.68, off: 20, wanderR: 150 },
    ],
    stars: { motePct: 0.7, maxPings: 30 },
    hints: [{ t: 0.2, text: 'Two of them now. One song can wake both.' }],
  },
  {
    id: 9, name: 'Bloom', seed: 909,
    path: [[0, 0], [40, 300], [-30, 620], [200, 900], [420, 980], [640, 900], [800, 640], [820, 380], [1020, 260], [1240, 380], [1300, 660]],
    width: [95, 150, 210, 150, 95],
    moteCount: 20,
    urchins: [
      { t: 0.42, off: 0 }, { t: 0.47, off: -60 }, { t: 0.47, off: 60 },
      { t: 0.52, off: -110 }, { t: 0.52, off: 110 },
    ],
    hunters: [{ t: 0.5, off: -150, wanderR: 220 }],
    stars: { motePct: 0.8, maxPings: 40 },
    hints: [{ t: 0.3, text: 'A garden in full bloom. The thorns grew with it.' }],
  },
  {
    id: 10, name: 'Serpentine', seed: 1010,
    path: [[0, 0], [180, 200], [40, 440], [220, 660], [60, 900], [240, 1120], [70, 1360], [250, 1580], [90, 1820], [260, 2040], [120, 2300]],
    width: [88, 78, 74],
    moteCount: 14,
    currents: [
      { t: 0.25, off: 0, r: 140, mode: 'against', strength: 0.85 },
      { t: 0.55, off: 0, r: 150, mode: 'against', strength: 0.95 },
      { t: 0.82, off: 0, r: 140, mode: 'against', strength: 1.0 },
    ],
    urchins: [{ t: 0.4, off: -30 }, { t: 0.68, off: 32 }],
    stars: { motePct: 0.7, maxPings: 44 },
    hints: [{ t: 0.18, text: 'The river runs upstream here. Spend your songs wisely.' }],
  },
  {
    id: 11, name: 'Choir', seed: 1111,
    path: [[0, 0], [-90, 280], [30, 560], [-110, 840], [40, 1140], [-90, 1440], [60, 1740], [-60, 2040], [40, 2340]],
    width: [96, 84, 80],
    moteCount: 16,
    urchins: [{ t: 0.3, off: -34 }, { t: 0.48, off: 30 }, { t: 0.62, off: -30 }, { t: 0.85, off: 26 }],
    hunters: [{ t: 0.4, off: 0, wanderR: 160 }, { t: 0.75, off: 0, wanderR: 160 }],
    stars: { motePct: 0.75, maxPings: 36 },
    hints: [{ t: 0.15, text: 'Thorns and ears together. The deep is learning your voice.' }],
  },
  {
    id: 12, name: 'Pressure', seed: 1212,
    path: [[0, 0], [80, 260], [-40, 520], [70, 800], [-50, 1080], [60, 1360], [-30, 1640], [50, 1900], [-20, 2160]],
    width: [80, 66, 60],
    auraScale: 0.55, decayScale: 1.5,
    moteCount: 12,
    urchins: [{ t: 0.35, off: -22 }, { t: 0.55, off: 24 }, { t: 0.75, off: -20 }],
    stars: { motePct: 0.7, maxPings: 40 },
    hints: [{ t: 0.1, text: 'The water thickens. Light dies faster this deep.' }],
  },
  {
    id: 13, name: 'The Throat', seed: 1313,
    path: [[0, 0], [-70, 260], [50, 520], [-80, 800], [60, 1080], [-70, 1360], [60, 1620], [-50, 1900], [70, 2160], [-30, 2440]],
    width: [78, 64, 58],
    moteCount: 14,
    currents: [
      { t: 0.3, off: 0, r: 130, mode: 'across', strength: 1.0 },
      { t: 0.62, off: 0, r: 130, mode: 'against', strength: 0.9 },
    ],
    urchins: [
      { t: 0.24, off: -20 }, { t: 0.4, off: 22 }, { t: 0.52, off: -18 },
      { t: 0.72, off: 20 }, { t: 0.86, off: -16 },
    ],
    hunters: [{ t: 0.55, off: 0, wanderR: 190, fast: true }],
    stars: { motePct: 0.65, maxPings: 44 },
    hints: [{ t: 0.08, text: 'The throat of the deep. Everything it knows, it sends.' }],
  },
  {
    id: 14, name: 'Still Water', seed: 1414,
    path: [[0, 0], [100, 280], [-20, 560], [140, 840], [340, 1000], [560, 940], [700, 700], [900, 620], [1100, 720], [1180, 980], [1080, 1260], [1180, 1540], [1080, 1820], [1140, 2100]],
    width: [95, 110, 130, 96, 120],
    extraPaths: [
      { path: [[340, 1000], [300, 1300], [420, 1560], [640, 1660], [900, 1580], [1080, 1260]], width: [80, 90, 80] },
    ],
    moteCount: 18,
    extraMotes: [{ branch: 1, count: 8 }],
    urchins: [{ t: 0.38, off: -40 }, { t: 0.52, off: 40 }, { branch: 1, t: 0.5, off: 0 }],
    hunters: [{ t: 0.45, off: 0, wanderR: 200 }, { branch: 1, t: 0.6, off: 0, wanderR: 160 }],
    currents: [{ t: 0.7, off: 0, r: 150, mode: 'along', strength: 0.9 }],
    stars: { motePct: 0.75, maxPings: 60 },
    hints: [
      { t: 0.05, text: 'One last dive, little lume.' },
      { t: 0.93, text: 'The water ahead is still. Sing it home.' },
    ],
    finale: true,
  },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || null;
}

// Par times in seconds for trench medals. Tuned at roughly 2.5x a clean
// autoplay run: reachable without rushing, but it rewards knowing the route.
const PAR_TIMES = {
  1: 35, 2: 50, 3: 40, 4: 45, 5: 45, 6: 40, 7: 45,
  8: 50, 9: 55, 10: 60, 11: 55, 12: 50, 13: 55, 14: 70,
};

export function parTime(id) {
  return PAR_TIMES[id] || null;
}

// One line of anticipation for the level ahead, shown on the results screen.
const TEASERS = {
  2: 'side passages, and more to gather',
  3: 'pink thorns that do not listen',
  4: 'something in it listens',
  5: 'a fork: the rich way or the safe way',
  6: 'water that moves on its own',
  7: 'the walls close in',
  8: 'two of them now',
  9: 'a garden in full bloom',
  10: 'the river runs upstream',
  11: 'thorns and ears together',
  12: 'light dies faster this deep',
  13: 'the throat of the deep',
  14: 'one last dive',
};

export function teaser(id) {
  return TEASERS[id] || null;
}
