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
      { t: 0.05, text: 'The shallows end here, little lume.' },
      { t: 0.93, text: 'The water ahead is still. Sing it home.' },
    ],
    chapterEnd: true,
  },

  // ---- Chapter 2 · The Trench (15–28) ----
  // Opens at roughly 60% of chapter 1's peak and climbs back past it: the new
  // vocabulary carries the difficulty, the level count carries the ramp.
  // Lures teach doubt, crystals teach timing and thrift, and two leviathans
  // close the halves.
  {
    id: 15, name: 'False Light', seed: 1515,
    path: [[0, 0], [110, 280], [30, 560], [150, 840], [60, 1120], [170, 1400], [80, 1680]],
    width: [112, 104, 98],
    moteCount: 12,
    lures: [{ t: 0.32, off: 46 }, { t: 0.55, off: 48 }, { t: 0.78, off: -50 }],
    heartMotes: [{ t: 0.66, off: -70 }],
    stars: { motePct: 0.7, maxPings: 34 },
    hints: [
      { t: 0.12, text: 'Deeper water. Not all of the amber down here is food.' },
      { t: 0.26, text: 'Sing at a light before you swim to it. A false one has something behind it.' },
      { t: 0.62, text: 'The beating light mends what the trench takes. Save it for when you need it.' },
    ],
  },
  {
    id: 16, name: 'Two Kinds of Star', seed: 1616,
    path: [[0, 0], [-120, 260], [-40, 540], [-170, 820], [-60, 1100], [-180, 1380], [-70, 1660], [-150, 1940]],
    width: [106, 96, 90],
    moteCount: 14,
    lures: [
      { t: 0.22, off: -44 }, { t: 0.4, off: 46 }, { t: 0.58, off: -44 },
      { t: 0.76, off: 42 }, { t: 0.9, off: 40 },
    ],
    urchins: [{ t: 0.34, off: 34 }, { t: 0.66, off: -32 }],
    heartMotes: [{ t: 0.5, off: 62 }],
    stars: { motePct: 0.75, maxPings: 38 },
    hints: [{ t: 0.16, text: 'A whole field of them. Doubt costs less than a heart.' }],
  },
  {
    id: 17, name: 'Bloomlight', seed: 1717,
    path: [[0, 0], [90, 300], [-30, 600], [120, 900], [-20, 1200], [130, 1500], [10, 1800], [120, 2080]],
    width: [100, 92, 88],
    decayScale: 1.35,
    moteCount: 14,
    crystals: [{ t: 0.2, off: 0 }, { t: 0.42, off: -40 }, { t: 0.64, off: 38 }, { t: 0.85, off: 0 }],
    urchins: [{ t: 0.5, off: -30 }, { t: 0.72, off: 28 }],
    heartMotes: [{ t: 0.32, off: -66 }],
    stars: { motePct: 0.75, maxPings: 30 },
    hints: [
      { t: 0.08, text: 'This dark drinks light. Your songs will not hold for long.' },
      { t: 0.19, text: 'The pale glass answers a song with one of its own — free, and silent.' },
    ],
  },
  {
    id: 18, name: 'The Relay', seed: 1818,
    path: [[0, 0], [-100, 300], [20, 620], [-120, 940], [10, 1260], [-110, 1580], [20, 1900], [-90, 2200]],
    width: [96, 88, 84],
    decayScale: 1.25,
    moteCount: 14,
    crystals: [
      { t: 0.14, off: 0 }, { t: 0.3, off: 34 }, { t: 0.46, off: -34 },
      { t: 0.62, off: 32 }, { t: 0.78, off: -30 }, { t: 0.92, off: 0 },
    ],
    hunters: [{ t: 0.55, off: 0, wanderR: 150 }],
    urchins: [{ t: 0.38, off: -28 }, { t: 0.7, off: 26 }],
    heartMotes: [{ t: 0.86, off: 60 }],
    stars: { motePct: 0.7, maxPings: 26 },
    hints: [{ t: 0.1, text: 'Let the glass carry it. Every song you keep is one it does not hear.' }],
  },
  {
    id: 19, name: 'Baited', seed: 1919,
    path: [[0, 0], [130, 270], [40, 550], [180, 830], [70, 1110], [200, 1390], [90, 1670], [190, 1950], [100, 2220]],
    width: [98, 90, 86],
    moteCount: 14,
    lures: [{ t: 0.24, off: 44 }, { t: 0.44, off: -46 }, { t: 0.62, off: 44 }, { t: 0.82, off: -42 }],
    hunters: [{ t: 0.38, off: 0, wanderR: 170 }, { t: 0.76, off: 0, wanderR: 170 }],
    heartMotes: [{ t: 0.56, off: -64 }],
    stars: { motePct: 0.7, maxPings: 34 },
    hints: [{ t: 0.14, text: 'Take the bait here and the whole trench hears it snap.' }],
  },
  {
    id: 20, name: 'Slack Water', seed: 2020,
    path: [[0, 0], [-90, 300], [50, 620], [-80, 940], [60, 1260], [-70, 1580], [50, 1900], [-60, 2200]],
    width: [94, 86, 82],
    moteCount: 14,
    currents: [
      { t: 0.26, off: 0, r: 150, mode: 'across', strength: 0.95 },
      { t: 0.54, off: 0, r: 150, mode: 'against', strength: 0.9 },
      { t: 0.8, off: 0, r: 150, mode: 'across', strength: 1.0 },
    ],
    lures: [{ t: 0.34, off: -42 }, { t: 0.6, off: 40 }, { t: 0.86, off: -38 }],
    urchins: [{ t: 0.44, off: 26 }, { t: 0.7, off: -24 }],
    heartMotes: [{ t: 0.18, off: 58 }],
    stars: { motePct: 0.7, maxPings: 40 },
    hints: [{ t: 0.16, text: 'The water shoves. A lure only has to wait for it to shove you close.' }],
  },
  {
    id: 21, name: 'The Sleeper', seed: 2121,
    path: [[0, 0], [80, 300], [-20, 620], [40, 960], [0, 1320], [60, 1680], [-20, 2000]],
    width: [96, 92, 170, 260, 260, 140, 92],
    checkpoint: 0.46,
    moteCount: 16,
    leviathans: [{ t: 0.583, off: 0, patrolR: 160 }],
    crystals: [{ t: 0.3, off: 0 }, { t: 0.74, off: 0 }],
    urchins: [{ t: 0.24, off: -30 }, { t: 0.86, off: 28 }],
    lures: [{ t: 0.36, off: 48 }],
    heartMotes: [{ t: 0.44, off: -84 }],
    stars: { motePct: 0.6, maxPings: 44 },
    hints: [
      { t: 0.28, text: 'Something down here is bigger than the dark.' },
      { t: 0.47, text: 'The mouth of its lair. If it takes you, you wake here again.' },
      { t: 0.54, text: 'It has no eyes. It only listens. Sing, then be somewhere else.' },
    ],
  },
  {
    id: 22, name: 'Afterglow', seed: 2222,
    path: [[0, 0], [140, 280], [300, 520], [200, 820], [40, 1040], [160, 1320], [300, 1560], [220, 1860]],
    width: [120, 130, 110],
    moteCount: 18,
    crystals: [{ t: 0.3, off: 0 }, { t: 0.6, off: 0 }],
    urchins: [{ t: 0.45, off: -40 }],
    heartMotes: [{ t: 0.72, off: 80 }],
    stars: { motePct: 0.8, maxPings: 34 },
    hints: [{ t: 0.1, text: 'Quiet water. Take the light while it is offered.' }],
  },
  {
    id: 23, name: 'Cold Lanterns', seed: 2323,
    path: [[0, 0], [-130, 280], [-30, 560], [-160, 840], [-40, 1120], [-170, 1400], [-50, 1680], [-150, 1960], [-40, 2240]],
    width: [92, 84, 80],
    moteCount: 16,
    lures: [
      { t: 0.2, off: -40 }, { t: 0.36, off: 40 }, { t: 0.52, off: -38 },
      { t: 0.68, off: 38 }, { t: 0.84, off: -36 },
    ],
    currents: [
      { t: 0.42, off: 0, r: 150, mode: 'along', strength: 1.05 },
      { t: 0.74, off: 0, r: 150, mode: 'against', strength: 0.95 },
    ],
    crystals: [{ t: 0.28, off: 0 }, { t: 0.62, off: 0 }],
    heartMotes: [{ t: 0.9, off: 56 }],
    stars: { motePct: 0.7, maxPings: 38 },
    hints: [{ t: 0.12, text: 'A whole street of lanterns, and a current running through it.' }],
  },
  {
    id: 24, name: 'Deepglass', seed: 2424,
    path: [[0, 0], [100, 270], [-20, 540], [110, 810], [-10, 1080], [120, 1350], [0, 1620], [110, 1890], [10, 2160]],
    width: [86, 76, 72],
    auraScale: 0.6, decayScale: 1.5,
    moteCount: 14,
    crystals: [
      { t: 0.16, off: 0 }, { t: 0.34, off: 26 }, { t: 0.52, off: -26 },
      { t: 0.7, off: 24 }, { t: 0.88, off: 0 },
    ],
    urchins: [{ t: 0.26, off: -22 }, { t: 0.44, off: 22 }, { t: 0.62, off: -20 }, { t: 0.8, off: 20 }],
    heartMotes: [{ t: 0.58, off: 48 }],
    stars: { motePct: 0.7, maxPings: 34 },
    hints: [{ t: 0.08, text: 'Your glow shrinks to nothing here. The glass is all the sight you get.' }],
  },
  {
    id: 25, name: 'The Long Doubt', seed: 2525,
    path: [[0, 0], [-110, 260], [10, 520], [-120, 780], [0, 1040], [-130, 1300], [-10, 1560], [-120, 1820], [0, 2080], [-100, 2340]],
    width: [88, 78, 74],
    moteCount: 16,
    lures: [
      { t: 0.16, off: -38 }, { t: 0.3, off: 38 }, { t: 0.44, off: -36 },
      { t: 0.58, off: 36 }, { t: 0.72, off: -36 }, { t: 0.86, off: 34 },
    ],
    hunters: [{ t: 0.4, off: 0, wanderR: 170 }, { t: 0.78, off: 0, wanderR: 170, fast: true }],
    heartMotes: [{ t: 0.64, off: -50 }],
    stars: { motePct: 0.65, maxPings: 36 },
    hints: [{ t: 0.1, text: 'Six lights and two ears. Choose slowly — the trench rewards patience, once.' }],
  },
  {
    id: 26, name: 'Thrift', seed: 2626,
    path: [[0, 0], [120, 300], [10, 620], [140, 940], [20, 1260], [150, 1580], [30, 1900], [140, 2200]],
    width: [90, 82, 78],
    decayScale: 1.45,
    moteCount: 14,
    crystals: [
      { t: 0.12, off: 0 }, { t: 0.26, off: 0 }, { t: 0.4, off: 0 }, { t: 0.54, off: 0 },
      { t: 0.68, off: 0 }, { t: 0.82, off: 0 }, { t: 0.94, off: 0 },
    ],
    hunters: [{ t: 0.34, off: 0, wanderR: 180 }, { t: 0.66, off: 0, wanderR: 180 }],
    urchins: [{ t: 0.48, off: -24 }, { t: 0.76, off: 22 }],
    heartMotes: [{ t: 0.2, off: 52 }],
    stars: { motePct: 0.7, maxPings: 20 },
    hints: [{ t: 0.08, text: 'A chain of glass, end to end. Sing once and let it carry.' }],
  },
  {
    id: 27, name: 'Every Tooth', seed: 2727,
    path: [[0, 0], [-90, 270], [60, 540], [-100, 810], [50, 1080], [-110, 1350], [40, 1620], [-100, 1890], [50, 2160], [-60, 2420]],
    width: [92, 80, 76],
    decayScale: 1.2,
    moteCount: 16,
    lures: [{ t: 0.2, off: -40 }, { t: 0.46, off: 40 }, { t: 0.72, off: -38 }],
    // Spread deliberately: the against-current, the fast hunter and the thorns
    // each get their own stretch. Stacked, they stop being a test and start
    // being a wall.
    urchins: [
      // Thorns sit on the same side as the nearest lure, so there is always
      // one clear lane rather than a pinch between two hazards.
      { t: 0.32, off: -22 }, { t: 0.5, off: 34 }, { t: 0.74, off: -22 },
    ],
    // One fast ear, not two: this is depth 13's density plus the trench's own
    // vocabulary, which is the whole point of a chapter's last ordinary level.
    hunters: [{ t: 0.6, off: 0, wanderR: 170, fast: true }],
    currents: [{ t: 0.22, off: 0, r: 140, mode: 'against', strength: 0.9 }],
    crystals: [{ t: 0.26, off: 0 }, { t: 0.58, off: 0 }, { t: 0.86, off: 0 }],
    heartMotes: [{ t: 0.76, off: -46 }],
    stars: { motePct: 0.65, maxPings: 40 },
    hints: [{ t: 0.06, text: 'Everything the trench learned, in one throat.' }],
  },
  {
    id: 28, name: 'The Trench Mouth', seed: 2828,
    path: [[0, 0], [80, 300], [-40, 620], [30, 980], [0, 1360], [70, 1740], [-30, 2080], [40, 2380]],
    width: [92, 88, 160, 285, 285, 150, 100, 88],
    checkpoint: 0.44,
    moteCount: 18,
    leviathans: [
      { t: 0.52, off: 0, patrolR: 185, speedScale: 1.15 },
      { t: 0.57, off: 0, patrolR: 95, speedScale: 1.35, reverse: true },
    ],
    crystals: [{ t: 0.34, off: 0 }, { t: 0.72, off: 0 }],
    urchins: [{ t: 0.2, off: -26 }, { t: 0.86, off: 24 }],
    lures: [{ t: 0.28, off: 46 }],
    heartMotes: [{ t: 0.42, off: -74 }],
    stars: { motePct: 0.6, maxPings: 48 },
    hints: [
      { t: 0.26, text: 'The trench narrows to a throat, and the throat is where they sleep.' },
      { t: 0.45, text: 'The mouth. Whatever happens past here, you wake here again.' },
      { t: 0.52, text: 'Two of them, turning against each other. There is a gap. Wait for it.' },
      { t: 0.93, text: 'Light ahead, little lume. Sing it home.' },
    ],
    chapterEnd: true,
    finale: true,
  },
];

// Chapters gate on stars, not on clearing every depth: ~60% of the previous
// chapter's stars opens the next one, so a single cursed level never walls a
// player out of the rest of the game.
export const CHAPTERS = [
  { id: 1, name: 'The Shallows', from: 1, to: 14, mode: 'shallows' },
  { id: 2, name: 'The Trench', from: 15, to: 28, mode: 'trench' },
];

export function chapterOf(levelId) {
  return CHAPTERS.find((c) => levelId >= c.from && levelId <= c.to) || CHAPTERS[0];
}

export function prevChapter(chapter) {
  const i = CHAPTERS.indexOf(chapter);
  return i > 0 ? CHAPTERS[i - 1] : null;
}

// Stars needed in the preceding chapter to open this one. Null for chapter 1.
export function chapterGate(chapter) {
  const prev = prevChapter(chapter);
  if (!prev) return null;
  return Math.ceil(0.6 * (prev.to - prev.from + 1) * 3);
}

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || null;
}

// Par times in seconds for trench medals. Tuned at roughly 2.5x a clean
// autoplay run: reachable without rushing, but it rewards knowing the route.
const PAR_TIMES = {
  1: 35, 2: 50, 3: 40, 4: 45, 5: 45, 6: 40, 7: 45,
  8: 50, 9: 55, 10: 60, 11: 55, 12: 50, 13: 55, 14: 70,
  // Same ~9x-a-clean-autoplay-run rule, measured with __echo.autoplay. The two
  // lairs get far more: waiting out a leviathan's orbit is real time a bot in
  // god mode never pays.
  15: 42, 16: 48, 17: 50, 18: 54, 19: 54, 20: 54, 21: 80,
  22: 50, 23: 56, 24: 52, 25: 58, 26: 54, 27: 60, 28: 95,
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
  14: 'the shallows end',
  15: 'some of the amber lies',
  16: 'a field of false stars',
  17: 'a dark that drinks light',
  18: 'glass that carries a song',
  19: 'a bite the whole trench hears',
  20: 'the water shoves you closer',
  21: 'something enormous, and asleep',
  22: 'quiet water, freely lit',
  23: 'a street of cold lanterns',
  24: 'your glow shrinks to nothing',
  25: 'six lights and two ears',
  26: 'one song, end to end',
  27: 'everything the trench learned',
  28: 'the mouth of the trench itself',
};

export function teaser(id) {
  return TEASERS[id] || null;
}
