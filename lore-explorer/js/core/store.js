/* Holocron core — store: assembles raw HOLO_DATA into one graph with indexes and helpers.
   Pure logic; safe to run in Node (no document access). */
(function () {
  'use strict';
  const D = window.HOLO_DATA;
  const H = window.HOLO = window.HOLO || {};

  /* Relation labels: [forward, reverse] as read from an entity's panel. */
  const REL = {
    'trained':    ['trained', 'trained by'],
    'killed':     ['killed', 'killed by'],
    'defeated':   ['defeated', 'defeated by'],
    'redeemed':   ['redeemed', 'redeemed by'],
    'corrupted':  ['corrupted', 'corrupted by'],
    'founded':    ['founded', 'founded by'],
    'led':        ['led', 'led by'],
    'member':     ['member of', 'counts among its ranks'],
    'served':     ['served', 'served by'],
    'rival':      ['rival of', 'rival of'],
    'ally':       ['ally of', 'ally of'],
    'bonded':     ['Force-bonded with', 'Force-bonded with'],
    'spouse':     ['married', 'married'],
    'kin':        ['kin of', 'kin of'],
    'descendant': ['descendant of', 'ancestor of'],
    'created':    ['created', 'created by'],
    'wielded':    ['wielded', 'wielded by'],
    'practiced':  ['practiced', 'practiced by'],
    'embodies':   ['embodies', 'embodied by'],
    'authored':   ['authored', 'authored by'],
    'bore':       ['bore the title', 'borne by'],
    'took-part':  ['took part in', 'involved'],
    'occurred-at':['occurred at', 'site of'],
    'located-at': ['kept at', 'holds']
  };

  const TYPE_LABEL = {
    character: 'Character', faction: 'Faction', location: 'World',
    event: 'Event', artifact: 'Artifact', concept: 'Concept'
  };

  const KIND_LABEL = {
    war: 'War', battle: 'Battle', duel: 'Duel', founding: 'Founding', political: 'Politics',
    death: 'Death', catastrophe: 'Catastrophe', academy: 'Academy', discovery: 'Discovery',
    ritual: 'Ritual', turning: 'Turning point'
  };

  const ALIGN_LABEL = { sith: 'Sith', jedi: 'Jedi', gray: 'Gray', neutral: 'Neutral' };

  function fmtYear(y, approx) {
    if (y === null || y === undefined) return 'unknown';
    const c = approx ? 'c. ' : '';
    if (y < 0) return c + (-y) + ' BBY';
    if (y === 0) return c + '0 BBY/ABY';
    return c + y + ' ABY';
  }

  function fmtSpan(a, b, approx) {
    if (a == null && b == null) return 'dates unknown';
    if (a != null && b == null) return fmtYear(a, approx) + ' — ';
    if (a == null) return '… — ' + fmtYear(b, approx);
    if (a === b) return fmtYear(a, approx);
    return fmtYear(a, approx) + ' – ' + fmtYear(b, approx);
  }

  /* ── Assemble nodes ── */
  const nodes = new Map();
  function add(list, type) {
    (list || []).forEach(raw => {
      if (nodes.has(raw.id)) throw new Error('duplicate id: ' + raw.id);
      nodes.set(raw.id, Object.assign({ type }, raw));
    });
  }
  add(D.characters, 'character');
  add(D.factions, 'faction');
  add(D.locations, 'location');
  add(D.events, 'event');
  add(D.artifacts, 'artifact');
  add(D.concepts, 'concept');

  /* ── Assemble edges (explicit + derived) ── */
  const edges = [];
  (D.edges || []).forEach(e => edges.push({ f: e.f, t: e.t, r: e.r, n: e.n || null, derived: false }));
  (D.events || []).forEach(ev => {
    if (ev.loc) edges.push({ f: ev.id, t: ev.loc, r: 'occurred-at', n: null, derived: true });
    (ev.who || []).forEach(w => edges.push({ f: w, t: ev.id, r: 'took-part', n: null, derived: true }));
  });
  (D.artifacts || []).forEach(a => {
    if (a.loc) edges.push({ f: a.id, t: a.loc, r: 'located-at', n: null, derived: true });
  });

  /* Adjacency: id → [{other, rel, dir, note, derived}] */
  const adj = new Map();
  function push(id, entry) {
    if (!adj.has(id)) adj.set(id, []);
    adj.get(id).push(entry);
  }
  edges.forEach(e => {
    push(e.f, { other: e.t, rel: e.r, dir: 'out', note: e.n, derived: e.derived });
    push(e.t, { other: e.f, rel: e.r, dir: 'in', note: e.n, derived: e.derived });
  });

  function neighbors(id) { return adj.get(id) || []; }
  function relLabel(rel, dir) {
    const pair = REL[rel] || [rel, rel];
    return dir === 'out' ? pair[0] : pair[1];
  }

  /* Relations of one kind for an entity: rel + direction. */
  function related(id, rel, dir) {
    return neighbors(id).filter(n => n.rel === rel && (!dir || n.dir === dir));
  }

  /* ── Era helpers ── */
  const eras = D.eras;
  const eraById = new Map(eras.map(e => [e.id, e]));
  function eraOfYear(y) {
    if (y == null) return null;
    for (const e of eras) if (y >= e.from && y <= e.to) return e;
    return null;
  }
  /* Every era an entity touches (explicit eras[], or year-derived for events). */
  function erasOf(node) {
    if (node.type === 'event') {
      const found = eraById.get(node.era);
      return found ? [found] : [];
    }
    if (node.eras) return node.eras.map(id => eraById.get(id)).filter(Boolean);
    return [];
  }

  /* ── Alias table (search boosts + Q&A entity linking) ── */
  const norm = s => (s || '').toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ').trim();

  const aliasMap = new Map();     // normalized alias → id (first claimant wins)
  const BLOCK = new Set(['the', 'darth', 'lord', 'lady', 'dark', 'master', 'count', 'grand',
    'sith', 'jedi', 'mandalore', 'first', 'wars', 'battle', 'academy']);
  function claim(alias, id) {
    alias = norm(alias);
    if (!alias || alias.length < 3 || BLOCK.has(alias)) return;
    if (!aliasMap.has(alias)) aliasMap.set(alias, id);   // keep-first: earlier (character) claims win
  }
  function claimWords(text, id) {
    let t = norm(text);
    if (t.startsWith('the ')) t = t.slice(4);
    if (t.startsWith('darth ')) t = t.slice(6);
    const words = t.split(' ').filter(Boolean);
    if (words.length < 2) return;
    const first = words[0], last = words[words.length - 1];
    if (first.length >= 4 && !BLOCK.has(first)) claim(first, id);
    if (last.length >= 4 && !BLOCK.has(last)) claim(last, id);
    if (words.length >= 3 && !BLOCK.has(first) && !BLOCK.has(words[1]))
      claim(first + ' ' + words[1], id);                 // "qui gon", "vodo siosk"
  }
  nodes.forEach(n => {
    claim(n.name, n.id);
    (n.aka || []).forEach(a => claim(a, n.id));
    const nm = norm(n.name);
    if (nm.startsWith('darth ')) claim(nm.slice(6), n.id);           // "bane" → darth-bane
    if (nm.startsWith('the ')) claim(nm.slice(4), n.id);
    (n.aka || []).forEach(a => {
      const an = norm(a);
      if (an.startsWith('darth ')) claim(an.slice(6), n.id);
      if (an.startsWith('the ')) claim(an.slice(4), n.id);
    });
    if (n.type === 'character') {                        // word-level aliases: characters only
      claimWords(n.name, n.id);
      (n.aka || []).forEach(a => claimWords(a, n.id));
    }
  });

  /* Longest-alias-first entity linking inside free text. */
  const aliasesByLength = [...aliasMap.keys()].sort((a, b) => b.length - a.length);
  function linkEntities(text, max) {
    const q = ' ' + norm(text) + ' ';
    const found = [];
    const covered = [];
    for (const alias of aliasesByLength) {
      let idx = q.indexOf(' ' + alias + ' ');
      if (idx === -1) {
        // allow possessive: "revan's"
        idx = q.indexOf(' ' + alias + "'");
        if (idx === -1) continue;
      }
      const s = idx + 1, e = s + alias.length;
      if (covered.some(([a, b]) => s < b && e > a)) continue;
      covered.push([s, e]);
      const id = aliasMap.get(alias);
      if (!found.some(f => f.id === id)) found.push({ id, alias, at: s });
      if (max && found.length >= max) break;
    }
    return found.sort((a, b) => a.at - b.at);
  }

  /* ── Validation (used by the Node test harness) ── */
  function validate() {
    const problems = [];
    const has = id => nodes.has(id);
    edges.forEach(e => {
      if (!has(e.f)) problems.push('edge from missing node: ' + e.f + ' -(' + e.r + ')-> ' + e.t);
      if (!has(e.t)) problems.push('edge to missing node: ' + e.f + ' -(' + e.r + ')-> ' + e.t);
      if (!REL[e.r]) problems.push('unknown relation "' + e.r + '" on ' + e.f + ' -> ' + e.t);
    });
    nodes.forEach(n => {
      if (!n.blurb) problems.push('no blurb: ' + n.id);
      if (!n.sources || !n.sources.length) problems.push('no sources: ' + n.id);
      (n.eras || []).forEach(id => { if (!eraById.get(id)) problems.push('bad era ' + id + ' on ' + n.id); });
      if (n.type === 'event') {
        if (typeof n.year !== 'number') problems.push('event without year: ' + n.id);
        if (n.year < -7100 || n.year > 140) problems.push('event year out of range: ' + n.id);
        if (!eraById.get(n.era)) problems.push('event with bad era: ' + n.id);
        if (!KIND_LABEL[n.kind]) problems.push('event with unknown kind "' + n.kind + '": ' + n.id);
      }
      if (n.type === 'character') {
        if (n.diedAt && !has(n.diedAt)) problems.push('bad diedAt on ' + n.id + ': ' + n.diedAt);
        if (!n.eras || !n.eras.length) problems.push('character without eras: ' + n.id);
        if (!['sith', 'jedi', 'gray', 'neutral'].includes(n.alignment)) problems.push('bad alignment: ' + n.id);
      }
      if (n.type === 'location' && (!n.coords || typeof n.coords.x !== 'number')) problems.push('location without coords: ' + n.id);
    });
    (D.deepDives || []).forEach(dd => {
      (dd.battles || []).forEach(id => { if (!has(id)) problems.push('deep-dive ' + dd.id + ' bad event: ' + id); });
      (dd.figures || []).forEach(id => { if (!has(id)) problems.push('deep-dive ' + dd.id + ' bad figure: ' + id); });
      if (!eraById.get(dd.era)) problems.push('deep-dive with bad era: ' + dd.id);
    });
    (D.academies || []).forEach(a => {
      if (!has(a.loc)) problems.push('academy ' + a.id + ' bad loc: ' + a.loc);
      (a.periods || []).forEach(p => {
        if (typeof p.from !== 'number') problems.push('academy ' + a.id + ' period without from');
        if (p.to != null && p.to < p.from) problems.push('academy ' + a.id + ' period inverted');
      });
    });
    (D.lineages || []).forEach(l => (l.members || []).forEach(id => {
      if (!has(id)) problems.push('lineage ' + l.id + ' bad member: ' + id);
    }));
    return problems;
  }

  /* Rabbit holes: strongest neighbors, prioritizing non-derived, note-bearing edges. */
  function rabbitHoles(id, count) {
    const seen = new Set([id]);
    const scored = [];
    neighbors(id).forEach(n => {
      if (seen.has(n.other)) return;
      const node = nodes.get(n.other);
      if (!node) return;
      let score = n.derived ? 1 : 3;
      if (n.note) score += 2;
      if (['trained', 'killed', 'bonded', 'spouse', 'descendant', 'rival'].includes(n.rel)) score += 2;
      score += Math.min((adj.get(n.other) || []).length, 20) / 10;
      const cur = scored.find(s => s.id === n.other);
      if (cur) cur.score += score;
      else scored.push({ id: n.other, score, via: relLabel(n.rel, n.dir) });
      seen.add(n.other);
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, count || 6);
  }

  H.store = {
    nodes, edges, adj, eras, eraById, deepDives: D.deepDives,
    academies: D.academies, lineages: D.lineages,
    get: id => nodes.get(id),
    neighbors, related, relLabel, REL, TYPE_LABEL, KIND_LABEL, ALIGN_LABEL,
    fmtYear, fmtSpan, eraOfYear, erasOf, norm, linkEntities, aliasMap, validate, rabbitHoles
  };
})();
