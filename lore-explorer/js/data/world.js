/* Holocron data — academy cycles (timeline layer + Q&A) and lineages (succession chains). */
window.HOLO_DATA = window.HOLO_DATA || {};

/* Each academy has periods: {from, to, by, note}. to:null = fate unrecorded (renders faded).
   side: 'sith' | 'jedi'. The timeline’s Academies layer draws one row per academy. */
HOLO_DATA.academies = [
  {
    id: 'ac-korriban', name: 'Korriban Academy', loc: 'korriban', side: 'sith',
    blurb: 'The Sith’s great school among the tombs — opened and closed five times across six millennia.',
    periods: [
      { from: -6900, to: -5000, by: 'Old Sith Empire', note: 'Training grounds of the old Empire, from Ajunta Pall’s exiles to Naga Sadow; abandoned in the Republic’s post-war holocaust.' },
      { from: -3959, to: -3956, by: 'Revan’s Sith Empire', note: 'Reopened at Dreshdae under Uthar Wynn to convert Jedi and officers; devoured itself in the Sith Civil War after Malak’s death.' },
      { from: -3681, to: -3630, by: 'Reconstituted Sith Empire', note: 'Retaken in the Great Galactic War’s first stroke; the Dark Council’s overseer academy for the war generation.', approxEnd: true },
      { from: -1006, to: -1000, by: 'Brotherhood of Darkness', note: 'Qordis’s academy for Kaan’s war effort — Bane, Githany, and Sirak’s cohort; emptied by Ruusan and abandoned as the Sith “went extinct.”' },
      { from: 30, to: 137, by: 'One Sith', note: 'Darth Krayt’s hidden order rebuilt the academy among the tombs — the longest quiet occupation in its history, revealed only when it took the galaxy.' }
    ],
    sources: ['Tales of the Jedi', 'Knights of the Old Republic (2003)', 'Darth Bane: Path of Destruction', 'Star Wars: Legacy']
  },
  {
    id: 'ac-trayus', name: 'Trayus Academy', loc: 'malachor', side: 'sith',
    blurb: 'The ancient redoubt on Malachor V — Revan’s hidden conversion engine, the Triumvirate’s cradle.',
    periods: [
      { from: -3963, to: -3951, by: 'Revan, then the Sith Triumvirate', note: 'An ancient Sith site Revan found mid-war and kept: Jedi captured in the Mandalorian and Civil Wars were broken here. Traya, Sion, and Nihilus all rose from it; destroyed with the planet in 3951 BBY.' }
    ],
    sources: ['Knights of the Old Republic II']
  },
  {
    id: 'ac-dromund', name: 'Dromund Kaas (Dark Temple & Prophets)', loc: 'dromund-kaas', side: 'sith',
    periods: [
      { from: -4980, to: -3630, by: 'Reconstituted Sith Empire', note: 'The hidden capital’s academies and the Emperor’s Dark Temple — 1,300 years of institutional Sith education.', approxEnd: true },
      { from: -950, to: 4, by: 'Prophets of the Dark Side', note: 'Darth Millennial’s heretic seers kept a dark seminary in the ruins, surfacing a millennium later at Palpatine’s court.', approx: true }
    ],
    blurb: 'The storm capital: imperial academies for thirteen centuries, then a heretic church in the ruins.',
    sources: ['The Old Republic', 'Darth Bane: Dynasty of Evil']
  },
  {
    id: 'ac-ossus', name: 'Great Library / Ossus Academy', loc: 'ossus', side: 'jedi',
    blurb: 'The Order’s memory palace — burned in 3996 BBY, reborn as the New Order’s academy, massacred in 130 ABY.',
    periods: [
      { from: -4996, to: -3996, by: 'Jedi Order (Odan-Urr)', note: 'The Great Jedi Library: ten millennia of records, including quarantined Sith works, until the Cron blast and Kun’s raid.' },
      { from: 25, to: 130, by: 'New Jedi Order', note: 'Luke’s Order rebuilt an academy on the healed world; Krayt’s Sith opened the Third Purge by massacring it.', approx: true }
    ],
    sources: ['Tales of the Jedi', 'Star Wars: Legacy']
  },
  {
    id: 'ac-dantooine', name: 'Dantooine Enclave', loc: 'dantooine', side: 'jedi',
    blurb: 'The pastoral second campus — Revan’s rebirth-place, razed by Malak, briefly and bitterly revived.',
    periods: [
      { from: -4400, to: -3956, by: 'Jedi Order', note: 'A training enclave for generations (Vandar, Vrook, Zhar); site of Revan’s retraining; razed by Malak in 3956 BBY.', approx: true },
      { from: -3951, to: -3900, by: 'Jedi remnant', note: 'Partially rebuilt after the Dark Wars as the Order slowly reconstituted from Surik’s circle.', approx: true, approxEnd: true }
    ],
    sources: ['Knights of the Old Republic (2003)', 'Knights of the Old Republic II']
  },
  {
    id: 'ac-coruscant', name: 'Coruscant Jedi Temple', loc: 'coruscant', side: 'jedi',
    blurb: 'Four thousand years of the Order’s heart — built over a dark shrine, razed twice, profaned once.',
    periods: [
      { from: -4019, to: -3653, by: 'Jedi Order', note: 'Founded over a sealed dark-side shrine; the Order’s seat until Malgus’s strike team leveled it in the Sacking of Coruscant.' },
      { from: -3600, to: -19, by: 'Jedi Order', note: 'Rebuilt after the Galactic War era; the Temple of the film era, until Order 66 burned it with the Order inside.', approx: true }
    ],
    sources: ['The Old Republic: Deceived', 'Revenge of the Sith']
  },
  {
    id: 'ac-tython', name: 'Tython Jedi Temple', loc: 'tython', side: 'jedi',
    blurb: 'The Order’s cradle, resettled in retreat: the Jedi’s home after the Sacking of Coruscant.',
    periods: [
      { from: -3681, to: -3600, by: 'Jedi Order', note: 'Rediscovered during the war and made the Order’s refuge-seat after 3653 BBY; the era’s padawans (and the Hero of Tython) trained here.', approxEnd: true }
    ],
    sources: ['The Old Republic']
  },
  {
    id: 'ac-yavin', name: 'Jedi Praxeum (Yavin 4)', loc: 'yavin4', side: 'jedi',
    blurb: 'Luke’s first academy, in Exar Kun’s temples — the New Jedi Order’s cradle and first battlefield.',
    periods: [
      { from: 11, to: 27, by: 'New Jedi Order', note: 'Founded with twelve students; survived Kun’s spirit (11 ABY) and the Empire; abandoned under Yuuzhan Vong assault, succeeded by Ossus.', approxEnd: true }
    ],
    sources: ['The Jedi Academy Trilogy', 'The New Jedi Order']
  },
  {
    id: 'ac-telos-polar', name: 'Telos Polar Academy (Atris)', loc: 'telos', side: 'jedi',
    blurb: 'Atris’s secret archive-academy in the ice — the last Jedi library of the Purge, corrupting its keeper.',
    periods: [
      { from: -3955, to: -3951, by: 'Atris & the Echani handmaidens', note: 'A hidden vault of Jedi records and captured Sith holocrons; dissolved after Atris’s fall and the Triumvirate’s end.', approx: true }
    ],
    sources: ['Knights of the Old Republic II']
  }
];

/* Lineages: master→apprentice succession chains for the timeline’s Lineages layer.
   members render as lifespan bars where dates exist; gapAfter draws a dashed unknown. */
HOLO_DATA.lineages = [
  {
    id: 'lin-old-lords', name: 'Dark Lords of the Old Sith', side: 'sith',
    note: 'The pre-Republic-contact succession of the Sith mantle, by inheritance, coup, and grave-robbery.',
    members: ['ajunta-pall', 'tulak-hord', 'marka-ragnos', 'naga-sadow', 'freedon-nadd', 'exar-kun'],
    gaps: { 'ajunta-pall': true, 'tulak-hord': true, 'naga-sadow': false, 'freedon-nadd': true }
  },
  {
    id: 'lin-revan', name: 'The Revan Line', side: 'sith',
    note: 'Kreia claimed Revan first; Revan made Malak; Malak made Bandon. The Trayus Academy made the rest.',
    members: ['kreia', 'revan', 'malak', 'darth-bandon']
  },
  {
    id: 'lin-banite', name: 'The Banite Line (Rule of Two)', side: 'sith',
    note: 'Two by two from Ruusan to Endor. Roughly nine centuries of masters between Cognus and Tenebrous kept no public records — by doctrine.',
    members: ['darth-bane', 'darth-zannah', 'darth-cognus', 'darth-tenebrous', 'darth-plagueis', 'darth-sidious', 'darth-vader'],
    gaps: { 'darth-cognus': true }
  },
  {
    id: 'lin-jedi', name: 'The Yoda–Skywalker Line', side: 'jedi',
    note: 'Yoda trained Dooku; Dooku, Qui-Gon; Qui-Gon shaped Obi-Wan; Obi-Wan trained Anakin and then his son. Light and dark share this lineage.',
    members: ['yoda', 'darth-tyranus', 'qui-gon', 'obi-wan', 'darth-vader', 'luke-skywalker']
  }
];
