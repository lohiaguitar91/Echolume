// Hand-authored level content. Coordinates are world px, y grows downward.
// Each level teaches or tests exactly one new idea; widths shrink and hazards
// compound gradually. Two stars: reach the vent (1), finish within maxPings (2).
// motePct is the light bar's "goal met" line — motes bank for gates, no star.

export const LEVELS = [
  {
    id: 1, name: 'First Light', seed: 101,
    path: [[0, 0], [60, 260], [-40, 520], [80, 800], [0, 1080], [90, 1340]],
    width: [120, 110, 105],
    moteCount: 8,
    stars: { motePct: 0.75, maxPings: 22 },
    hints: [
      { t: 0.0, text: 'Tap the water. Your song lights the dark.',
        plain: 'Tap anywhere. Light spreads from where it lands.' },
      { t: 0.22, text: 'Every song also carries you. Tap where you want to go.',
        plain: 'Each tap pushes you toward it. That is how you move.' },
      { t: 0.62, subject: 'mote',
        text: 'Gather the amber motes. Each one feeds your glow.',
        plain: 'Amber dots are motes. Each one widens your glow.' },
      { t: 0.88, subject: 'vent',
        text: 'The green vent leads deeper.',
        plain: 'The ringed green circle is the exit.' },
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
    stars: { motePct: 0.8, maxPings: 29 },
    hints: [
      { t: 0.3, text: 'Side passages hide more motes. Worth the detour?',
        plain: 'This depth has a side branch. More motes down it, but a longer swim.' },
      { t: 0.9, text: 'Stars remember how gracefully you swim.',
        plain: 'Stars count songs spent, not seconds taken. Drifting is free.' },
    ],
  },
  {
    id: 3, name: 'Thorns', seed: 303,
    path: [[0, 0], [90, 280], [-60, 560], [60, 860], [-90, 1140], [40, 1420], [-20, 1700]],
    width: [110, 95, 90],
    moteCount: 12,
    urchins: [{ t: 0.3, off: -34 }, { t: 0.46, off: 40 }, { t: 0.63, off: -44 }, { t: 0.78, off: 30 }],
    stars: { motePct: 0.75, maxPings: 29 },
    hints: [
      // `subject` marks a hint that restates a first-encounter teach card
      // (teach.js). On the one play where that card is going to fire, the hint
      // stays quiet — a playtester got the same urchin lesson twice in a row
      // here. Replays (card long since seen) still get the authored hint.
      { t: 0.2, subject: 'urchin',
        text: 'Pink thorns wound what touches them. Sing before you rush.',
        plain: 'Urchins cost a heart on contact. A song shows you where they are first.' },
    ],
  },
  {
    id: 4, name: 'Hush', seed: 404,
    path: [[0, 0], [-110, 260], [-60, 560], [-190, 840], [-60, 1120], [-160, 1420], [-80, 1720], [-140, 1980]],
    width: [105, 95, 92],
    moteCount: 12,
    hunters: [{ t: 0.5, off: 0, wanderR: 130 }],
    stars: { motePct: 0.7, maxPings: 26 },
    hints: [
      { t: 0.28, text: 'Something ahead listens for your song.',
        plain: 'There is a hunter ahead. It cannot see you at all.' },
      { t: 0.44, subject: 'hunter',
        text: 'It swims toward the last place you sang. Glide quiet. Let it lose you.',
        plain: 'It moves to wherever your last song landed. Stop singing and drift to shake it.' },
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
    stars: { motePct: 0.8, maxPings: 31 },
    hints: [{ t: 0.24, text: 'The narrow fork glitters. The wide fork forgives.',
        plain: 'Two routes. The narrow one holds more motes and more thorns.' }],
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
    stars: { motePct: 0.75, maxPings: 26 },
    hints: [{ t: 0.2, subject: 'current',
        text: 'Blue water moves on its own. Ride it, or sing against it.',
        plain: 'Blue zones push you. Going with the flow saves songs; fighting it costs them.' }],
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
    stars: { motePct: 0.7, maxPings: 29 },
    hints: [{ t: 0.12, text: 'Thread the needle. Short, soft songs steer best.',
        plain: 'Tap close to yourself for small corrections. Distant taps overshoot into thorns.' }],
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
    stars: { motePct: 0.7, maxPings: 26 },
    hints: [{ t: 0.2, text: 'Two of them now. One song can wake both.',
        plain: 'Both hunters chase the same spot: your last song. Sing wide to split them.' }],
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
    stars: { motePct: 0.8, maxPings: 34 },
    hints: [{ t: 0.3, text: 'A garden in full bloom. The thorns grew with it.',
        plain: 'A wide chamber ringed with urchins, and a hunter loose inside it.' }],
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
    stars: { motePct: 0.7, maxPings: 37 },
    hints: [{ t: 0.18, text: 'The river runs upstream here. Spend your songs wisely.',
        plain: 'A current pushes against you the whole way. Expect to spend more songs than usual.' }],
  },
  {
    id: 11, name: 'Choir', seed: 1111,
    path: [[0, 0], [-90, 280], [30, 560], [-110, 840], [40, 1140], [-90, 1440], [60, 1740], [-60, 2040], [40, 2340]],
    width: [96, 84, 80],
    moteCount: 16,
    urchins: [{ t: 0.3, off: -34 }, { t: 0.48, off: 30 }, { t: 0.62, off: -30 }, { t: 0.85, off: 26 }],
    hunters: [{ t: 0.4, off: 0, wanderR: 160 }, { t: 0.75, off: 0, wanderR: 160 }],
    stars: { motePct: 0.75, maxPings: 31 },
    hints: [{ t: 0.15, text: 'Thorns and ears together. The deep is learning your voice.',
        plain: 'Urchins and hunters share this corridor. Every song you spend dodging also calls them.' }],
  },
  {
    id: 12, name: 'Pressure', seed: 1212,
    path: [[0, 0], [80, 260], [-40, 520], [70, 800], [-50, 1080], [60, 1360], [-30, 1640], [50, 1900], [-20, 2160]],
    width: [80, 66, 60],
    auraScale: 0.55, decayScale: 1.5,
    moteCount: 12,
    urchins: [{ t: 0.35, off: -22 }, { t: 0.55, off: 24 }, { t: 0.75, off: -20 }],
    stars: { motePct: 0.7, maxPings: 34 },
    hints: [{ t: 0.1, text: 'The water thickens. Light dies faster this deep.',
        plain: 'Reveal fades faster here, so you will need to sing more often to see.' }],
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
    stars: { motePct: 0.65, maxPings: 37 },
    hints: [{ t: 0.08, text: 'The throat of the deep. Everything it knows, it sends.',
        plain: 'Thorns, a hunter and currents at once. Nothing new, all of it together.' }],
  },
  {
    id: 14, name: 'Still Water', seed: 1414,
    // The shallows' boss. A warden is anchored in the wide chamber: it cannot
    // chase, it only listens, aims at your last song, and strikes down that
    // line. Every depth so far taught "move away from your song"; this asks the
    // sharper version, "sing where you are not."
    boss: {
      name: 'The Listener',
      tell: 'It cannot move, and it cannot chase. It strikes where you last sang.',
    },
    path: [[0, 0], [100, 280], [-20, 560], [140, 840], [340, 1000], [560, 940], [700, 700], [900, 620], [1100, 720], [1180, 980], [1080, 1260], [1180, 1540], [1080, 1820], [1140, 2100]],
    width: [95, 110, 240, 300, 300, 150, 110],
    checkpoint: 0.42,
    moteCount: 18,
    // Everything hostile sits BEFORE the arena. Past the boss the swim to the
    // vent is a victory lap — a stray hunter back there just dilutes the fight
    // and was killing five runs in twelve.
    urchins: [{ t: 0.18, off: -40 }, { t: 0.26, off: 40 }, { t: 0.34, off: -38 }],
    hunters: [{ t: 0.3, off: 0, wanderR: 170 }],
    // Off the centre line on purpose: the arena is wide, and a lane past it
    // must exist for a player who has not yet worked out the misdirection.
    wardens: [{ t: 0.56, off: -70 }],
    currents: [{ t: 0.78, off: 0, r: 150, mode: 'along', strength: 0.9 }],
    stars: { motePct: 0.7, maxPings: 51 },
    hints: [
      { t: 0.05, text: 'The shallows end here, little lume.',
        plain: 'Last depth of chapter one, and the first thing that is waiting for you.' },
      { t: 0.4, text: 'The mouth of the chamber. Whatever happens past here, you wake here again.',
        plain: 'Checkpoint. Any death past this point returns you here.' },
      { t: 0.5, subject: 'warden',
        text: 'It is anchored to the floor, and it is listening.',
        plain: 'It aims at your last song and strikes along that line. Sing wide, then swim the other way.' },
      { t: 0.93, text: 'The water ahead is still. Sing it home.',
        plain: 'Nothing left between you and the vent.' },
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
    stars: { motePct: 0.7, maxPings: 26 },
    hints: [
      { t: 0.12, subject: 'lure',
        text: 'Deeper water. Not all of the amber down here is food.',
        plain: 'Some amber lights are lures, not motes. They look identical until you sing at one.' },
      { t: 0.26, subject: 'lure',
        text: 'Sing at a light before you swim to it. A false one has something behind it.',
        plain: 'A song reveals a lure’s tether. No tether showing means it is safe to take.' },
      { t: 0.62, subject: 'heartMote',
        text: 'The beating light mends what the trench takes. Save it for when you need it.',
        plain: 'The pink pulsing mote restores a heart, and only takes if you are already hurt.' },
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
    stars: { motePct: 0.75, maxPings: 29 },
    hints: [{ t: 0.16, text: 'A whole field of them. Doubt costs less than a heart.',
        plain: 'Five lures mixed into the motes. One song checks a whole cluster at once.' }],
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
    stars: { motePct: 0.75, maxPings: 23 },
    hints: [
      { t: 0.08, text: 'This dark drinks light. Your songs will not hold for long.',
        plain: 'Reveal fades very fast at this depth.' },
      { t: 0.19, subject: 'crystal',
        text: 'The pale glass answers a song with one of its own. Free, and silent.',
        plain: 'Sing near a white crystal and it blooms light for you. Costs no song and wakes nothing.' },
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
    stars: { motePct: 0.7, maxPings: 20 },
    hints: [{ t: 0.1, text: 'Let the glass carry it. Every song you keep is one it does not hear.',
        plain: 'Six crystals chain across the level. Use them instead of singing near the hunter.' }],
  },
  {
    id: 19, name: 'Baited', seed: 1919,
    path: [[0, 0], [130, 270], [40, 550], [180, 830], [70, 1110], [200, 1390], [90, 1670], [190, 1950], [100, 2220]],
    width: [98, 90, 86],
    moteCount: 14,
    lures: [{ t: 0.24, off: 44 }, { t: 0.44, off: -46 }, { t: 0.62, off: 44 }, { t: 0.82, off: -42 }],
    hunters: [{ t: 0.38, off: 0, wanderR: 170 }, { t: 0.76, off: 0, wanderR: 170 }],
    heartMotes: [{ t: 0.56, off: -64 }],
    stars: { motePct: 0.7, maxPings: 26 },
    hints: [{ t: 0.14, text: 'Take the bait here and the whole trench hears it snap.',
        plain: 'A sprung lure is loud. It pulls both hunters straight to you.' }],
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
    stars: { motePct: 0.7, maxPings: 31 },
    hints: [{ t: 0.16, text: 'The water shoves. A lure only has to wait for it to shove you close.',
        plain: 'Currents can carry you into a lure’s reach. Check lights before you let yourself drift.' }],
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
    stars: { motePct: 0.6, maxPings: 34 },
    hints: [
      { t: 0.28, subject: 'leviathan',
        text: 'Something down here is bigger than the dark.',
        plain: 'A leviathan patrols ahead. It cannot be killed, only avoided.' },
      { t: 0.47, text: 'The mouth of its lair. If it takes you, you wake here again.',
        plain: 'This is a checkpoint. Dying past it returns you here, not to the start.' },
      { t: 0.54, text: 'It has no eyes. It only listens. Sing, then be somewhere else.',
        plain: 'It hunts your last song. Sing, then move off that spot immediately.' },
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
    stars: { motePct: 0.8, maxPings: 26 },
    hints: [{ t: 0.1, text: 'Quiet water. Take the light while it is offered.',
        plain: 'Nothing hunts here. A good depth to fill your glow before the next one.' }],
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
    stars: { motePct: 0.7, maxPings: 29 },
    hints: [{ t: 0.12, text: 'A whole street of lanterns, and a current running through it.',
        plain: 'Five lures in a row, with a current pushing you through them.' }],
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
    stars: { motePct: 0.7, maxPings: 26 },
    hints: [{ t: 0.08, text: 'Your glow shrinks to nothing here. The glass is all the sight you get.',
        plain: 'Your aura barely reaches. Crystals are the only reliable light in this depth.' }],
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
    stars: { motePct: 0.65, maxPings: 27 },
    hints: [{ t: 0.1, text: 'Six lights and two ears. Choose slowly. The trench rewards patience, once.',
        plain: 'Six lures and two hunters. Sing to check each light before you approach it.' }],
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
    stars: { motePct: 0.7, maxPings: 15 },
    hints: [{ t: 0.08, text: 'A chain of glass, end to end. Sing once and let it carry.',
        plain: 'Seven crystals in sequence. One well-placed song can cascade the whole way.' }],
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
    stars: { motePct: 0.65, maxPings: 31 },
    hints: [{ t: 0.06, text: 'Everything the trench learned, in one throat.',
        plain: 'Urchins, a hunter, a current, lures and crystals in a single corridor.' }],
  },
  {
    id: 28, name: 'The Trench Mouth', seed: 2828,
    boss: {
      name: 'The Twins',
      tell: 'Two orbits, crossing. The gap is where both turn away. A thrown song can pull one wide.',
    },
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
    stars: { motePct: 0.6, maxPings: 37 },
    hints: [
      { t: 0.26, text: 'The trench narrows to a throat, and the throat is where they sleep.',
        plain: 'Two leviathans ahead, not one.' },
      { t: 0.45, text: 'The mouth. Whatever happens past here, you wake here again.',
        plain: 'Checkpoint. Any death past this point returns you here.' },
      { t: 0.52, text: 'Two of them, turning against each other. There is a gap. Wait for it.',
        plain: 'Their patrol orbits cross. Wait at the edge until both have turned away.' },
      { t: 0.93, text: 'Light ahead, little lume. Sing it home.',
        plain: 'The vent is close. Finish the swim.' },
    ],
    chapterEnd: true,
  },

  // ===========================================================================
  // Chapter 3 · The Hush (29-42)
  //
  // The trench taught you to spend songs carefully. The hush takes the song
  // itself: water that swallows what you sing, so the tool you have leaned on
  // for 28 depths stops working exactly where it matters. Brittle ice arrives
  // beside it as the opposite problem — noise you make by accident.
  //
  // Corridors run 84-108, in step with chapter 2 rather than wider. Lures hug
  // the wall at |off| near the half-width, which is what leaves a passable gap
  // on the far side: the bait radius is 50 and would otherwise wall the seam.
  // ===========================================================================
  {
    id: 29, name: 'Thin Water', seed: 2929,
    path: [[0, 0], [70, 300], [-40, 600], [50, 920], [-30, 1240], [60, 1560], [0, 1880]],
    width: [104, 98, 94],
    moteCount: 14,
    hushZones: [{ t: 0.44, off: 0, r: 175, depth: 0.62 }, { t: 0.76, off: 0, r: 160, depth: 0.58 }],
    urchins: [
      { t: 0.18, off: -30 }, { t: 0.28, off: 28 }, { t: 0.4, off: -26 }, { t: 0.5, off: 26 },
      { t: 0.62, off: -28 }, { t: 0.72, off: 26 }, { t: 0.84, off: -24 }, { t: 0.92, off: 24 },
    ],
    stars: { motePct: 0.7, maxPings: 32 },
    hints: [
      { t: 0.12, subject: 'hushZone',
        text: 'The water here is thick, and it is hungry for sound.',
        plain: 'The dim patch ahead swallows any song sung inside it.' },
      { t: 0.4, subject: 'hushZone',
        text: 'Sing at its edge and let the light lean in.',
        plain: 'Sing just outside a hush zone. A song from within barely lights anything.' },
    ],
  },
  {
    id: 30, name: 'The Swallow', seed: 3030,
    path: [[0, 0], [-80, 320], [40, 640], [-60, 960], [50, 1280], [-40, 1600], [30, 1920]],
    width: [100, 94, 90],
    moteCount: 14,
    hushZones: [
      { t: 0.26, off: 0, r: 160, depth: 0.66 },
      { t: 0.54, off: 0, r: 165, depth: 0.68 },
      { t: 0.82, off: 0, r: 155, depth: 0.64 },
    ],
    urchins: [
      { t: 0.34, off: -28 }, { t: 0.42, off: 26 }, { t: 0.48, off: -24 }, { t: 0.6, off: 26 },
      { t: 0.7, off: -26 }, { t: 0.78, off: 24 }, { t: 0.9, off: -22 },
    ],
    stars: { motePct: 0.7, maxPings: 34 },
    hints: [
      { t: 0.16, text: 'Three mouthfuls of silence, and thorns between them.',
        plain: 'Light each gap from outside before you cross into it.' },
    ],
  },
  {
    id: 31, name: 'First Ice', seed: 3131,
    path: [[0, 0], [60, 300], [-50, 620], [40, 940], [-40, 1260], [50, 1580], [-20, 1900]],
    width: [98, 92, 88],
    moteCount: 14,
    hushZones: [{ t: 0.58, off: 0, r: 165, depth: 0.64 }],
    ice: [{ t: 0.24, off: 0 }, { t: 0.36, off: -26 }, { t: 0.5, off: 24 }, { t: 0.66, off: -22 }, { t: 0.8, off: 22 }],
    urchins: [
      { t: 0.3, off: 26 }, { t: 0.44, off: -24 }, { t: 0.56, off: 22 },
      { t: 0.72, off: -22 }, { t: 0.86, off: 22 }, { t: 0.94, off: -20 },
    ],
    stars: { motePct: 0.7, maxPings: 32 },
    hints: [
      { t: 0.14, subject: 'ice',
        text: 'Pale glass, and it is not the helpful kind.',
        plain: 'Brittle ice. It costs no hearts, but breaking it is very loud.' },
      { t: 0.42, text: 'Nothing here has heard you yet. Keep it that way.',
        plain: 'A song shows you ice before you reach it. Steer around it, not through.' },
    ],
  },
  {
    id: 32, name: 'Careful', seed: 3232,
    path: [[0, 0], [-70, 320], [50, 640], [-60, 980], [40, 1320], [-30, 1660], [40, 1980]],
    width: [96, 90, 86],
    moteCount: 14,
    ice: [{ t: 0.26, off: 24 }, { t: 0.38, off: -24 }, { t: 0.52, off: 22 }, { t: 0.64, off: -22 }, { t: 0.78, off: 20 }],
    hunters: [{ t: 0.44, off: 0, wanderR: 150 }, { t: 0.8, off: 0, wanderR: 145 }],
    urchins: [{ t: 0.32, off: -22 }, { t: 0.58, off: 22 }, { t: 0.88, off: -20 }],
    stars: { motePct: 0.7, maxPings: 34 },
    hints: [
      { t: 0.18, text: 'Two things down here are already listening. Do not hand them a reason.',
        plain: 'A shatter calls both hunters straight to where it happened.' },
    ],
  },
  {
    id: 33, name: 'Muffled', seed: 3333,
    path: [[0, 0], [70, 320], [-40, 660], [60, 1000], [-50, 1340], [40, 1680], [-20, 2000]],
    width: [96, 90, 86],
    moteCount: 15,
    hushZones: [{ t: 0.4, off: 0, r: 180, depth: 0.72 }, { t: 0.74, off: 0, r: 165, depth: 0.68 }],
    ice: [{ t: 0.36, off: -24 }, { t: 0.46, off: 22 }, { t: 0.58, off: -22 }, { t: 0.7, off: 22 }, { t: 0.82, off: -20 }],
    urchins: [
      { t: 0.26, off: 24 }, { t: 0.44, off: -22 }, { t: 0.52, off: 22 },
      { t: 0.64, off: -20 }, { t: 0.78, off: 20 }, { t: 0.9, off: -20 },
    ],
    heartMotes: [{ t: 0.6, off: 40 }],
    stars: { motePct: 0.7, maxPings: 35 },
    hints: [
      { t: 0.22, text: 'Ice inside the silence. You will not hear it until you feel it.',
        plain: 'Songs barely reach in here, so light the ice from outside the hush first.' },
    ],
  },
  {
    id: 34, name: 'The Quiet Field', seed: 3434,
    path: [[0, 0], [-60, 340], [60, 680], [-50, 1020], [50, 1360], [-40, 1700], [30, 2020]],
    width: [114, 106, 100],
    moteCount: 16,
    hushZones: [{ t: 0.52, off: 0, r: 170, depth: 0.7 }, { t: 0.84, off: 0, r: 155, depth: 0.66 }],
    lures: [{ t: 0.3, off: 48 }, { t: 0.74, off: -48 }],
    hunters: [{ t: 0.62, off: 0, wanderR: 155 }],
    urchins: [{ t: 0.36, off: -40 }, { t: 0.62, off: 40 }],
    heartMotes: [{ t: 0.7, off: -44 }],
    stars: { motePct: 0.65, maxPings: 37 },
    hints: [
      { t: 0.18, text: 'False lights, in water that will not answer you.',
        plain: 'Checking a lure costs a song, and songs die in the hush. Check from outside it.' },
    ],
  },
  {
    id: 35, name: 'The Long Silence', seed: 3535,
    path: [[0, 0], [80, 340], [-50, 700], [60, 1060], [-40, 1420], [50, 1760], [0, 2100]],
    width: [100, 94, 88],
    moteCount: 16,
    hushZones: [
      { t: 0.26, off: 0, r: 180, depth: 0.75 },
      { t: 0.56, off: 0, r: 190, depth: 0.78 },
      { t: 0.84, off: 0, r: 170, depth: 0.72 },
    ],
    ice: [{ t: 0.36, off: -24 }, { t: 0.48, off: 22 }, { t: 0.66, off: -22 }, { t: 0.8, off: 22 }],
    hunters: [{ t: 0.62, off: 0, wanderR: 160 }],
    urchins: [
      { t: 0.2, off: 24 }, { t: 0.42, off: -22 }, { t: 0.52, off: 22 },
      { t: 0.7, off: -20 }, { t: 0.78, off: 20 }, { t: 0.88, off: -20 }, { t: 0.94, off: 20 },
    ],
    heartMotes: [{ t: 0.34, off: -42 }],
    stars: { motePct: 0.65, maxPings: 42 },
    hints: [
      { t: 0.1, text: 'Three silences, end to end. The trench is asking how well you remember.',
        plain: 'Long stretches where songs barely work. Light each gap before you cross it.' },
    ],
  },
  {
    id: 36, name: 'Glass and Silence', seed: 3636,
    path: [[0, 0], [-70, 340], [60, 680], [-50, 1020], [60, 1360], [-40, 1700], [40, 2040]],
    width: [112, 106, 100],
    moteCount: 15,
    hushZones: [{ t: 0.46, off: 0, r: 190, depth: 0.8 }, { t: 0.78, off: 0, r: 160, depth: 0.7 }],
    crystals: [{ t: 0.38, off: -34 }, { t: 0.58, off: 34 }, { t: 0.74, off: 0 }],
    ice: [{ t: 0.52, off: -38 }, { t: 0.78, off: 38 }],
    hunters: [{ t: 0.6, off: 0, wanderR: 150 }],
    urchins: [
      { t: 0.2, off: 38 }, { t: 0.36, off: -38 }, { t: 0.88, off: 36 },
    ],
    heartMotes: [{ t: 0.28, off: 42 }],
    stars: { motePct: 0.7, maxPings: 38 },
    hints: [
      { t: 0.2, text: 'The good glass still answers, even where your own voice will not.',
        plain: 'Crystals bloom from where they stand, so their light works inside a hush.' },
    ],
  },
  {
    id: 37, name: 'Cold Company', seed: 3737,
    path: [[0, 0], [60, 320], [-60, 660], [50, 1000], [-50, 1340], [60, 1680], [-20, 2020]],
    width: [108, 100, 94],
    moteCount: 15,
    ice: [
      { t: 0.22, off: 26 }, { t: 0.34, off: -26 }, { t: 0.46, off: 24 },
      { t: 0.6, off: -24 }, { t: 0.76, off: 24 },
    ],
    hunters: [{ t: 0.3, off: -18, wanderR: 160 }, { t: 0.66, off: 18, wanderR: 160 }],
    urchins: [{ t: 0.4, off: 22 }, { t: 0.52, off: -22 }, { t: 0.86, off: 20 }],
    heartMotes: [{ t: 0.48, off: 40 }],
    stars: { motePct: 0.65, maxPings: 38 },
    hints: [
      { t: 0.14, text: 'Three ears, and a floor made of noise.',
        plain: 'Every shard you break pulls all three. Thread between them.' },
    ],
  },
  {
    id: 38, name: 'Deaf Water', seed: 3838,
    path: [[0, 0], [-80, 340], [50, 700], [-60, 1040], [50, 1380], [-40, 1720], [30, 2060]],
    width: [100, 94, 88],
    moteCount: 15,
    hushZones: [
      { t: 0.3, off: 0, r: 190, depth: 0.84 },
      { t: 0.6, off: 0, r: 180, depth: 0.82 },
      { t: 0.86, off: 0, r: 160, depth: 0.76 },
    ],
    ice: [{ t: 0.42, off: -22 }, { t: 0.56, off: 22 }, { t: 0.76, off: -20 }],
    urchins: [
      { t: 0.24, off: 24 }, { t: 0.36, off: -22 }, { t: 0.48, off: 22 },
      { t: 0.64, off: -20 }, { t: 0.8, off: 20 }, { t: 0.92, off: -20 },
    ],
    heartMotes: [{ t: 0.56, off: 40 }],
    stars: { motePct: 0.65, maxPings: 43 },
    hints: [
      { t: 0.12, text: 'The deepest silence yet, and it is full of thorns.',
        plain: 'Almost nothing you sing inside comes back. Map it from the edges.' },
    ],
  },
  {
    id: 39, name: 'The Cracking', seed: 3939,
    path: [[0, 0], [70, 320], [-50, 660], [60, 1000], [-40, 1340], [50, 1680], [-20, 2020]],
    width: [102, 96, 90],
    moteCount: 15,
    ice: [
      { t: 0.18, off: 0 }, { t: 0.28, off: -24 }, { t: 0.38, off: 24 }, { t: 0.48, off: 0 },
      { t: 0.58, off: -22 }, { t: 0.7, off: 22 }, { t: 0.84, off: -22 },
    ],
    hunters: [{ t: 0.4, off: 0, wanderR: 175, fast: true }, { t: 0.78, off: 0, wanderR: 160 }],
    urchins: [{ t: 0.32, off: 24 }, { t: 0.52, off: -22 }, { t: 0.66, off: 22 }, { t: 0.9, off: -20 }],
    heartMotes: [{ t: 0.6, off: 38 }],
    stars: { motePct: 0.65, maxPings: 42 },
    hints: [
      { t: 0.1, text: 'A floor of glass, and fast things walking on it.',
        plain: 'Eight shards and three hunters, one of them quick. Drift, do not dash.' },
    ],
  },
  {
    id: 40, name: 'Undertow', seed: 4040,
    path: [[0, 0], [-60, 340], [60, 700], [-60, 1040], [50, 1400], [-40, 1740], [40, 2080]],
    width: [102, 94, 90],
    moteCount: 16,
    hushZones: [{ t: 0.58, off: 0, r: 175, depth: 0.76 }, { t: 0.86, off: 0, r: 150, depth: 0.68 }],
    currents: [
      { t: 0.26, off: 0, r: 160, mode: 'against', strength: 1.1 },
      { t: 0.5, off: 0, r: 155, mode: 'across', strength: 1.05 },
      { t: 0.76, off: 0, r: 150, mode: 'against', strength: 1.1 },
    ],
    lures: [{ t: 0.34, off: 44 }, { t: 0.48, off: -42 }, { t: 0.64, off: 42 }, { t: 0.78, off: -40 },
            { t: 0.9, off: 40 }],
    hunters: [{ t: 0.42, off: 0, wanderR: 165 }, { t: 0.82, off: 0, wanderR: 155 }],
    urchins: [{ t: 0.3, off: -20 }, { t: 0.7, off: 20 }],
    heartMotes: [{ t: 0.54, off: -44 }],
    stars: { motePct: 0.65, maxPings: 44 },
    hints: [
      { t: 0.16, text: 'The water pushes, the silence eats, and the lights lie.',
        plain: 'A current can shove you into a lure you had no song left to check.' },
    ],
  },
  {
    id: 41, name: 'Everything Listens', seed: 4141,
    path: [[0, 0], [80, 340], [-60, 700], [60, 1060], [-50, 1420], [60, 1780], [-20, 2120]],
    width: [110, 102, 96],
    moteCount: 16,
    hushZones: [{ t: 0.36, off: 0, r: 180, depth: 0.8 }, { t: 0.72, off: 0, r: 165, depth: 0.74 }],
    ice: [{ t: 0.28, off: -26 }, { t: 0.44, off: 26 }, { t: 0.62, off: -24 }, { t: 0.88, off: 24 }],
    lures: [{ t: 0.52, off: 48 }, { t: 0.7, off: -46 }, { t: 0.9, off: 46 }],
    hunters: [{ t: 0.42, off: 0, wanderR: 170 }, { t: 0.82, off: 0, wanderR: 160 }],
    urchins: [{ t: 0.22, off: 26 }, { t: 0.58, off: -24 }],
    heartMotes: [{ t: 0.24, off: 44 }],
    stars: { motePct: 0.6, maxPings: 46 },
    hints: [
      { t: 0.1, text: 'Everything the hush taught you, all at once.',
        plain: 'Silence, ice, lures and two hunters. Nothing new, just no room for error.' },
    ],
  },
  {
    id: 42, name: 'The Deep Hush', seed: 4242,
    // Deaf, which inverts the whole game: singing is finally free, and the only
    // thing that can betray you is the ice you blunder into.
    boss: {
      name: 'The Deaf God',
      tell: 'It cannot hear you sing. It feels the glass break.',
    },
    path: [[0, 0], [70, 320], [-50, 660], [40, 1020], [0, 1400], [60, 1780], [-30, 2120], [30, 2420]],
    width: [92, 86, 165, 285, 285, 150, 98, 88],
    checkpoint: 0.46,
    moteCount: 18,
    leviathans: [
      { t: 0.52, off: 0, patrolR: 195, speedScale: 1.2, deaf: true },
      { t: 0.58, off: 0, patrolR: 100, speedScale: 1.35, reverse: true, deaf: true },
    ],
    hushZones: [{ t: 0.54, off: 0, r: 250, depth: 0.82 }],
    crystals: [{ t: 0.34, off: 0 }, { t: 0.74, off: 0 }],
    ice: [{ t: 0.26, off: -22 }, { t: 0.36, off: 22 }, { t: 0.82, off: -20 }],
    urchins: [{ t: 0.2, off: 22 }, { t: 0.88, off: -20 }, { t: 0.94, off: 20 }],
    heartMotes: [{ t: 0.44, off: -66 }],
    stars: { motePct: 0.6, maxPings: 44 },
    hints: [
      { t: 0.22, text: 'They sleep in the quietest water in the world. Of course they do.',
        plain: 'Two leviathans inside a deep hush. Your songs will barely reach them.' },
      { t: 0.44, text: 'The mouth. Whatever happens past here, you wake here again.',
        plain: 'Checkpoint. Any death past this point returns you here.' },
      { t: 0.6, text: 'The glass is your voice down here. Let it do the singing.',
        plain: 'Crystals still work inside the hush. Use them to see where the orbits cross.' },
    ],
    chapterEnd: true,
  },

  // ===========================================================================
  // Chapter 4 · The Warm Dark (43-50)
  //
  // After the hush, relief — and the game's only bright scale. Warm vents carry
  // you where a song would have, and glow enough to see by, for free. The
  // chapter is about learning to spend nothing at all, which is why it can hold
  // more threat than anything before it without feeling unfair.
  // ===========================================================================
  {
    id: 43, name: 'Warmth', seed: 4343,
    path: [[0, 0], [60, 320], [-50, 640], [50, 960], [-40, 1280], [50, 1600], [0, 1900]],
    width: [118, 110, 104],
    moteCount: 14,
    warmVents: [{ t: 0.36, off: 0, r: 160, strength: 1.0 }, { t: 0.72, off: 0, r: 155, strength: 1.0 }],
    hushZones: [{ t: 0.56, off: 0, r: 150, depth: 0.6 }],
    ice: [{ t: 0.28, off: 37 }, { t: 0.46, off: -37 }, { t: 0.66, off: 37 }, { t: 0.82, off: -37 }],
    hunters: [{ t: 0.5, off: 0, wanderR: 155 }, { t: 0.88, off: 0, wanderR: 145 }],
    urchins: [
      { t: 0.16, off: 37 }, { t: 0.24, off: -37 }, { t: 0.38, off: 37 }, { t: 0.54, off: -37 },
      { t: 0.7, off: 37 }, { t: 0.78, off: -37 }, { t: 0.94, off: 37 },
    ],
    stars: { motePct: 0.7, maxPings: 32 },
    hints: [
      { t: 0.12, subject: 'warmVent',
        text: 'Warm water, rising. Something down here is still alive.',
        plain: 'Orange zones carry you along and light the walls for free. No song needed.' },
      { t: 0.4, text: 'Let it lift you. Save your voice.',
        plain: 'Drift into a vent and it moves you. Fewer songs means an easier star.' },
    ],
  },
  {
    id: 44, name: 'The Updraft', seed: 4444,
    path: [[0, 0], [-70, 340], [60, 680], [-50, 1020], [60, 1360], [-40, 1700], [30, 2020]],
    width: [114, 106, 100],
    moteCount: 15,
    warmVents: [{ t: 0.3, off: 0, r: 155, strength: 1.15 }, { t: 0.66, off: 0, r: 155, strength: 1.15 }],
    hushZones: [{ t: 0.5, off: 0, r: 160, depth: 0.66 }],
    ice: [{ t: 0.4, off: -36 }, { t: 0.62, off: 36 }, { t: 0.86, off: -36 }],
    hunters: [{ t: 0.46, off: 0, wanderR: 160 }],
    urchins: [{ t: 0.22, off: 36 }, { t: 0.34, off: -36 }, { t: 0.66, off: 36 },
              { t: 0.92, off: -36 }],
    heartMotes: [{ t: 0.48, off: 42 }],
    stars: { motePct: 0.7, maxPings: 34 },
    hints: [
      { t: 0.18, text: 'It gives freely, and it does not steer.',
        plain: 'A vent sets your speed, not your direction. Line up before you enter.' },
    ],
  },
  {
    id: 45, name: 'Rising', seed: 4545,
    path: [[0, 0], [70, 340], [-60, 680], [50, 1020], [-50, 1360], [60, 1700], [-20, 2040]],
    width: [106, 100, 94],
    moteCount: 15,
    warmVents: [{ t: 0.32, off: 0, r: 155, strength: 1.2 }, { t: 0.7, off: 0, r: 150, strength: 1.2 }],
    hushZones: [{ t: 0.52, off: 0, r: 160, depth: 0.7 }],
    ice: [{ t: 0.42, off: -34 }, { t: 0.6, off: 34 }, { t: 0.84, off: -34 }],
    hunters: [{ t: 0.38, off: -18, wanderR: 165 }, { t: 0.74, off: 18, wanderR: 160 }],
    urchins: [{ t: 0.24, off: 34 }, { t: 0.5, off: -34 }, { t: 0.68, off: 34 },
              { t: 0.92, off: -34 }],
    heartMotes: [{ t: 0.56, off: -40 }],
    stars: { motePct: 0.65, maxPings: 37 },
    hints: [
      { t: 0.14, text: 'Ride it past them. A song would only introduce you.',
        plain: 'Vents move you silently, so you can cross all three hunters without singing.' },
    ],
  },
  {
    id: 46, name: 'Thermals', seed: 4646,
    path: [[0, 0], [-60, 340], [60, 700], [-60, 1040], [50, 1380], [-40, 1720], [40, 2060]],
    width: [104, 98, 92],
    moteCount: 15,
    warmVents: [{ t: 0.26, off: 0, r: 150, strength: 1.25 }, { t: 0.64, off: 0, r: 155, strength: 1.25 }],
    hushZones: [{ t: 0.48, off: 0, r: 155, depth: 0.7 }],
    ice: [
      { t: 0.34, off: -33 }, { t: 0.44, off: 33 }, { t: 0.56, off: -33 },
      { t: 0.72, off: 33 }, { t: 0.88, off: -33 },
    ],
    hunters: [{ t: 0.44, off: 0, wanderR: 165 }, { t: 0.8, off: 0, wanderR: 155 }],
    urchins: [{ t: 0.2, off: 33 }, { t: 0.32, off: -33 }, { t: 0.62, off: 33 }, { t: 0.94, off: -33 }],
    heartMotes: [{ t: 0.36, off: 40 }],
    stars: { motePct: 0.65, maxPings: 38 },
    hints: [
      { t: 0.16, text: 'The warmth will carry you straight into the glass if you let it.',
        plain: 'A vent adds speed you did not ask for. Ice ahead means steering early.' },
    ],
  },
  {
    id: 47, name: 'The Chimney', seed: 4747,
    path: [[0, 0], [80, 340], [-50, 700], [60, 1060], [-40, 1420], [50, 1760], [0, 2100]],
    width: [114, 106, 100],
    moteCount: 16,
    warmVents: [{ t: 0.3, off: 0, r: 155, strength: 1.3 }, { t: 0.72, off: 0, r: 150, strength: 1.2 }],
    currents: [{ t: 0.48, off: 0, r: 160, mode: 'across', strength: 1.1 },
               { t: 0.84, off: 0, r: 150, mode: 'against', strength: 1.05 }],
    lures: [{ t: 0.38, off: 50 }, { t: 0.56, off: -48 }, { t: 0.74, off: 48 }, { t: 0.92, off: -46 }],
    hunters: [{ t: 0.42, off: 0, wanderR: 165 }, { t: 0.78, off: 0, wanderR: 160 }],
    ice: [{ t: 0.26, off: -36 }, { t: 0.62, off: 36 }, { t: 0.88, off: -36 }],
    urchins: [{ t: 0.22, off: 36 }, { t: 0.5, off: -36 }, { t: 0.68, off: 36 }, { t: 0.96, off: -36 }],
    heartMotes: [{ t: 0.56, off: 44 }],
    stars: { motePct: 0.65, maxPings: 43 },
    hints: [
      { t: 0.18, text: 'Warm going up, cold going across, and lights that want you to stop.',
        plain: 'A vent and a cross-current fight each other. Lures sit where you lose control.' },
    ],
  },
  {
    id: 48, name: 'Hot and Cold', seed: 4848,
    path: [[0, 0], [-70, 340], [60, 700], [-60, 1060], [50, 1400], [-40, 1740], [40, 2080]],
    width: [98, 92, 88],
    moteCount: 16,
    warmVents: [{ t: 0.24, off: 0, r: 155, strength: 1.25 }, { t: 0.68, off: 0, r: 150, strength: 1.25 }],
    hushZones: [{ t: 0.42, off: 0, r: 175, depth: 0.78 }, { t: 0.7, off: 0, r: 160, depth: 0.74 },
                { t: 0.92, off: 0, r: 145, depth: 0.7 }],
    ice: [
      { t: 0.3, off: -32 }, { t: 0.38, off: 32 }, { t: 0.5, off: -32 },
      { t: 0.6, off: 32 }, { t: 0.78, off: -32 }, { t: 0.88, off: 32 },
    ],
    lures: [{ t: 0.46, off: 44 }, { t: 0.74, off: -42 }],
    hunters: [{ t: 0.36, off: 0, wanderR: 165 }, { t: 0.62, off: 0, wanderR: 160 }, { t: 0.86, off: 0, wanderR: 150 }],
    urchins: [{ t: 0.2, off: 32 }, { t: 0.54, off: -32 }, { t: 0.82, off: 32 }, { t: 0.96, off: -32 }],
    heartMotes: [{ t: 0.34, off: -42 }],
    stars: { motePct: 0.65, maxPings: 44 },
    hints: [
      { t: 0.14, text: 'Warmth on both sides of a silence.',
        plain: 'The vents light the hush for free. Ride in on their glow instead of singing.' },
    ],
  },
  {
    id: 49, name: 'The Threshold', seed: 4949,
    path: [[0, 0], [70, 340], [-60, 700], [50, 1060], [-50, 1420], [60, 1780], [-20, 2120]],
    width: [112, 104, 98],
    moteCount: 17,
    warmVents: [{ t: 0.28, off: 0, r: 155, strength: 1.3 }, { t: 0.7, off: 0, r: 155, strength: 1.3 }],
    hushZones: [{ t: 0.5, off: 0, r: 175, depth: 0.78 }, { t: 0.88, off: 0, r: 150, depth: 0.72 }],
    lures: [{ t: 0.38, off: 48 }, { t: 0.56, off: -46 }, { t: 0.72, off: 46 }, { t: 0.9, off: -44 }],
    hunters: [{ t: 0.44, off: 0, wanderR: 170 }, { t: 0.8, off: 0, wanderR: 160 }],
    ice: [{ t: 0.32, off: -35 }, { t: 0.5, off: 35 }, { t: 0.64, off: -35 }, { t: 0.84, off: 35 }],
    urchins: [{ t: 0.24, off: 35 }, { t: 0.6, off: -35 }, { t: 0.76, off: 35 }, { t: 0.96, off: -35 }],
    heartMotes: [{ t: 0.34, off: -44 }],
    stars: { motePct: 0.6, maxPings: 46 },
    hints: [
      { t: 0.1, text: 'The last quiet door. Everything is on the other side of it.',
        plain: 'Vents, hush, lures, ice and three hunters together. Spend as few songs as you can.' },
    ],
  },
  {
    id: 50, name: 'The Warm Dark', seed: 5050,
    // The finale is now a gate in its own right — it used to fall between the
    // sevens, so the climax of the game arrived with no announcement at all.
    boss: {
      name: 'The Warm Dark',
      tell: 'Two of them, and water that will carry you past both if you let it.',
    },
    path: [[0, 0], [80, 340], [-50, 700], [40, 1080], [0, 1480], [70, 1860], [-30, 2220], [30, 2540]],
    width: [94, 90, 175, 300, 300, 160, 104, 92],
    checkpoint: 0.46,
    moteCount: 20,
    leviathans: [
      { t: 0.52, off: 0, patrolR: 210, speedScale: 1.25 },
      { t: 0.58, off: 0, patrolR: 115, speedScale: 1.4, reverse: true },
    ],
    warmVents: [{ t: 0.32, off: 0, r: 155, strength: 1.3 }, { t: 0.78, off: 0, r: 150, strength: 1.3 }],
    hushZones: [{ t: 0.54, off: 0, r: 235, depth: 0.74 }],
    crystals: [{ t: 0.4, off: 0 }, { t: 0.72, off: 0 }],
    ice: [{ t: 0.24, off: -32 }, { t: 0.34, off: 32 }, { t: 0.86, off: -32 }],
    urchins: [{ t: 0.2, off: 32 }, { t: 0.9, off: -32 }, { t: 0.96, off: 32 }],
    heartMotes: [{ t: 0.46, off: -68 }],
    stars: { motePct: 0.6, maxPings: 48 },
    hints: [
      { t: 0.2, text: 'Warm water, and two shapes turning in it.',
        plain: 'Two leviathans, and vents that can carry you past both without a sound.' },
      { t: 0.45, text: 'The mouth. Whatever happens past here, you wake here again.',
        plain: 'Checkpoint. Any death past this point returns you here.' },
      { t: 0.6, text: 'Let the warmth do it. You have spent enough of your voice down here.',
        plain: 'Ride the vents through the gap in their orbits. Sing only if you must.' },
      { t: 0.93, text: 'Light ahead, little lume. Sing it home.',
        plain: 'The vent is close. Finish the swim.' },
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
  { id: 3, name: 'The Hush', from: 29, to: 42, mode: 'hush' },
  { id: 4, name: 'The Warm Dark', from: 43, to: 50, mode: 'warm' },
];

export function chapterOf(levelId) {
  return CHAPTERS.find((c) => levelId >= c.from && levelId <= c.to) || CHAPTERS[0];
}

// ---- gates ----
// Every 7th depth is a gate, every second gate a full boss. The motes banked
// across the seven depths behind it decide how much margin you arrive with.
//
// The bank buys margin, never permission: every gate stays winnable at zero
// motes. The moment one needs farming to pass, this stops being motivation and
// becomes a grind wall, which is the thing we refused when we dropped gems.
export const GATE_EVERY = 7;

// Boss-ness is a property of the level, not of arithmetic.
//
// It used to be `id % 14 === 0`, which drifted out of step with the content:
// depth 14 announced a boss and contained an ordinary corridor, depth 21 was
// labelled a challenge while holding the most boss-like fight in the game, and
// the finale at 50 was not a gate at all so the climax went unannounced. A def
// that declares `boss` is a boss; nothing else can be.
export function gateKind(id) {
  const def = LEVELS.find((l) => l.id === id);
  if (def?.boss) return 'boss';
  if (id % GATE_EVERY === 0) return 'challenge';
  return null;
}

export function bossOf(id) {
  return LEVELS.find((l) => l.id === id)?.boss || null;
}

// The depths that feed a gate: the seven behind it, never the gate itself.
export function gateSpan(id) {
  return { from: Math.max(1, id - GATE_EVERY), to: id - 1 };
}

// What a depth can yield, straight from its def — no geometry needs building.
export function moteCapacity(def) {
  return (def.moteCount || 0) +
    (def.extraMotes || []).reduce((s, e) => s + (e.count || 0), 0);
}

export function gateCapacity(id) {
  const { from, to } = gateSpan(id);
  let n = 0;
  for (let i = from; i <= to; i++) {
    const d = LEVELS.find((l) => l.id === i);
    if (d) n += moteCapacity(d);
  }
  return n;
}

// What the light buys. Every effect is a lever the sim already has, and every
// one is passive — no new input, nothing to spend, nothing to learn.
export function gateBoon(id, banked, capacity) {
  const kind = gateKind(id);
  if (!kind) return null;
  const grade = capacity > 0 ? Math.min(1, banked / capacity) : 0;
  const b = {
    id, kind, grade, banked, capacity,
    aura: 0, decay: 0, silentSongs: 0, revealLures: false, orbitSecs: 0,
    hushRelief: 0, iceSteady: false,
  };
  switch (id) {
    case 7:  b.aura = grade * 0.6; b.decay = grade * 0.35; break;
    case 14: b.silentSongs = Math.floor(grade * 5); break;
    case 21: b.revealLures = grade >= 0.34; break;
    case 28: b.orbitSecs = Math.round(grade * 20); break;
    // Chapter 3 gives back the thing the chapter takes away: carried light
    // keeps a little of your voice alive inside the silence.
    case 35: b.hushRelief = grade * 0.55; break;
    case 42: b.hushRelief = grade * 0.45; b.orbitSecs = Math.round(grade * 16); break;
    // Chapter 4's gate steadies you against the ice the vents throw you at.
    case 49: b.iceSteady = grade >= 0.34; b.aura = grade * 0.35; break;
    default:
      // Anything past the authored set falls back to the 28-depth cycle, so a
      // future chapter is never boonless by accident.
      if (id % 28 === 7) { b.aura = grade * 0.6; b.decay = grade * 0.35; }
      else if (id % 28 === 14) b.silentSongs = Math.floor(grade * 5);
      else if (id % 28 === 21) b.revealLures = grade >= 0.34;
      else b.orbitSecs = Math.round(grade * 20);
  }
  return b;
}

// Carried light: the gate's gift does not die at its own door. A dimmed
// version persists through the six depths that follow — light gathered above,
// carried into the darker water below — which lands the payoff exactly where
// the next chapter's listeners make sight valuable (the full boon used to
// expire on the one depth where, e.g., wider glow had nothing to out-see).
// Full strength returns at the next gate. Floors unchanged: every depth is
// still winnable at zero light, and the bank is still never consumed.
export const BOON_CARRY = 0.3;
export function carriedBoon(b) {
  if (!b) return null;
  return {
    ...b, carried: true,
    aura: b.aura * BOON_CARRY,
    decay: b.decay * BOON_CARRY,
    hushRelief: b.hushRelief * BOON_CARRY,
    orbitSecs: Math.round(b.orbitSecs * BOON_CARRY),
    // Counted and boolean gifts carry only from a strong bank: one silent
    // song per depth at most, and true sight / steadiness above 2/3 light.
    silentSongs: Math.min(1, Math.floor(b.silentSongs * 0.34)),
    revealLures: b.revealLures && b.grade >= 0.67,
    iceSteady: b.iceSteady && b.grade >= 0.67,
  };
}

// One line telling the player exactly what they bought. States a fact and never
// implies a purchase — there is no way to buy light.
export function gateBoonLine(b) {
  if (!b) return '';
  switch (b.id) {
    case 35:
      return b.hushRelief > 0.05
        ? `Enough that ${Math.round(b.hushRelief * 100)}% of your voice survives the silence.`
        : 'Not enough to carry your voice in. The silence takes all of it.';
    case 42:
      return b.hushRelief > 0.05
        ? `Enough to be heard in the hush, and to trace its orbit for ${b.orbitSecs} seconds.`
        : 'Not enough to be heard in there at all. The glass is your only voice.';
    case 49:
      return b.iceSteady
        ? 'Enough to hold your line where the warmth would have thrown you.'
        : 'Not enough to steady yourself. The vents will steer for you.';
    default:
      if (b.id % 28 === 7) {
        // Lead with what the numbers buy, not the numbers: a playtester read
        // "reaches 50% further" and asked what the benefit even was. The
        // benefit is sight without sound.
        return b.aura > 0.05
          ? `Enough that your glow reaches ${Math.round(b.aura * 100)}% further and lit walls fade ${Math.round(b.decay * 100)}% slower. You will see hazards without spending songs on them.`
          : 'You will swim this one on your own light.';
      }
      if (b.id % 28 === 14) {
        return b.silentSongs > 0
          ? `Enough for ${b.silentSongs} silent song${b.silentSongs === 1 ? '' : 's'}. It will not hear you coming.`
          : 'Not enough for a single silent song. It hears everything.';
      }
      if (b.id % 28 === 21) {
        return b.revealLures
          ? 'Enough to see which lights are false before they spring.'
          : 'Not enough to tell a lure from a mote. Sing at everything.';
      }
      return b.orbitSecs > 0
        ? `Enough to trace their orbits for ${b.orbitSecs} seconds.`
        : 'Not enough to trace them. You will have to watch, and wait.';
  }
}

export function prevChapter(chapter) {
  const i = CHAPTERS.indexOf(chapter);
  return i > 0 ? CHAPTERS[i - 1] : null;
}

// Stars needed in the preceding chapter to open this one. Null for chapter 1.
// Two stars per level since motes stopped being graded. Keep this in step with
// STARS_PER_LEVEL in game.js or every chapter gate silently moves.
export const STARS_PER_LEVEL = 2;

export function chapterGate(chapter) {
  const prev = prevChapter(chapter);
  if (!prev) return null;
  return Math.ceil(0.6 * (prev.to - prev.from + 1) * STARS_PER_LEVEL);
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
  // Chapters 3-4, same measurement. Hush depths get a little extra on top of
  // the 9x rule: a bot follows the corridor spine and never has to see, so its
  // run time understates how long a human spends working out where to sing.
  29: 46, 30: 48, 31: 46, 32: 48, 33: 52, 34: 50, 35: 56,
  36: 50, 37: 48, 38: 54, 39: 48, 40: 52, 41: 54, 42: 94,
  43: 42, 44: 46, 45: 46, 46: 48, 47: 48, 48: 52, 49: 50, 50: 98,
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
