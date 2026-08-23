#!/usr/bin/env node
/* Holocron test harness: loads the data + core modules in a sandbox and runs
   integrity checks, a search battery, and a Q&A battery. Exit 0 = all green. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const FILES = [
  'js/data/eras.js', 'js/data/locations.js', 'js/data/factions.js', 'js/data/characters.js',
  'js/data/events.js', 'js/data/artifacts.js', 'js/data/world.js', 'js/data/edges.js',
  'js/core/store.js', 'js/core/search.js', 'js/core/qa.js'
];

const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of FILES) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  try {
    vm.runInContext(src, sandbox, { filename: f });
  } catch (e) {
    console.error('LOAD FAIL ' + f + ': ' + e.message);
    process.exit(1);
  }
}

const H = sandbox.window.HOLO;
const S = H.store;
let failures = 0;
const ok = (cond, label, extra) => {
  if (cond) { console.log('  ok  ' + label); }
  else { failures++; console.error('FAIL  ' + label + (extra ? '\n      ' + extra : '')); }
};

/* ── 1. Integrity ── */
console.log('\n== integrity ==');
const problems = S.validate();
ok(problems.length === 0, 'data integrity (' + S.nodes.size + ' nodes, ' + S.edges.length + ' edges)',
  problems.slice(0, 20).join('\n      '));

const counts = {};
S.nodes.forEach(n => { counts[n.type] = (counts[n.type] || 0) + 1; });
console.log('  counts: ' + JSON.stringify(counts));
ok((counts.character || 0) >= 50 && (counts.character || 0) <= 110, 'character count in MVP range (50–110)');
ok((counts.event || 0) >= 80, 'event count ≥ 80');
ok(S.deepDives.length >= 5, 'era deep-dives ≥ 5 (' + S.deepDives.length + ')');

/* Timeline span sanity */
const years = [...S.nodes.values()].filter(n => n.type === 'event').map(e => e.year);
ok(Math.min(...years) <= -6900 && Math.max(...years) >= 130, 'timeline spans ~7000 BBY → 130+ ABY');

/* ── 2. Search battery ── */
console.log('\n== search ==');
function topIds(q, n) { return H.search.search(q, { limit: n || 5 }).map(r => r.id); }
const searchCases = [
  ['revan', ids => ids[0] === 'revan'],
  ['korriban academy history', ids => ids.slice(0, 3).some(id => id === 'korriban' || id === 'ac-korriban')],
  ['rule of two origins', ids => ids.slice(0, 3).includes('rule-of-two')],
  ['thought bomb', ids => ids.slice(0, 3).includes('thought-bomb')],
  ['star forge', ids => ids.slice(0, 3).includes('star-forge')],
  ['mandalorian wars', ids => ids.slice(0, 3).includes('ev-mw')],
  ['battle meditation', ids => ids.slice(0, 3).includes('battle-meditation')],
  ['wound in the force', ids => ids.slice(0, 3).includes('wound-in-the-force')],
  ['darth bane', ids => ids[0] === 'darth-bane'],
  ['lord of hunger', ids => ids.slice(0, 3).includes('darth-nihilus')],
  ['treaty coruscant', ids => ids.slice(0, 3).includes('ev-treaty')],
  ['rakghoul plague', ids => ids.slice(0, 4).includes('muur-talisman') || ids.slice(0, 4).includes('karness-muur') || ids.slice(0, 4).includes('taris')]
];
searchCases.forEach(([q, check]) => {
  const ids = topIds(q, 5);
  ok(check(ids), 'search: "' + q + '"', 'got ' + ids.join(', '));
});
/* snippet highlighting present (query terms that occur in body text get marked) */
const sn = H.search.search('wall of light', { limit: 3 }).find(r => r.snippet.includes('⟪'));
ok(!!sn, 'search snippets carry highlight marks');

/* ── 3. Q&A battery ── */
console.log('\n== q&a ==');
function ask(q) { return H.qa.answer(q); }
const qaCases = [
  ['Who trained Darth Nihilus?', ['kreia']],
  ['When did the Sith academy reopen after Bane?', ['30 aby', 'one sith']],
  ['Who trained Darth Bane?', ['qordis', "kas'im", 'revan']],
  ['Who killed Darth Malak?', ['revan']],
  ['When was the Treaty of Coruscant?', ['3653 bby']],
  ['How did Darth Bane die?', ['zannah', 'ambria']],
  ["Who was Revan's master?", ['kreia']],
  ['What is the Rule of Two?', ['bane', 'apprentice']],
  ['Who founded the Brotherhood of Darkness?', ['kaan']],
  ['Who led the Army of Light?', ['hoth']],
  ['Where did Darth Bane die?', ['ambria']],
  ['Who did Darth Sidious train?', ['maul', 'vader']],
  ['What happened in 3996 BBY?', ['great sith war']],
  ['Tell me about Malachor V', ['trayus']],
  ["Revan's lineage", ['kreia', 'malak', 'satele']],
  ['Who trained Darth Krayt?', ['bane', 'holocron']],
  ['Where is the Star Forge?', ['lehon']],
  ['Who killed Meetra Surik?', ['scourge']],
  ['History of the Korriban academy', ['brotherhood', 'one sith']],
  ['When did the Mandalorian Wars end?', ['3960 bby']],
  ['Who killed Qui-Gon?', ['maul']],
  ['Who trained Obi-Wan Kenobi?', ['qui-gon']],
  ['What is the thought bomb?', ['ruusan', 'kaan']],
  ['when was darth bane born?', ['1026 bby']],
  ['Who founded the One Sith?', ['krayt']],
  ['how did exar kun die?', ['yavin', 'spirit']]
];
qaCases.forEach(([q, subs]) => {
  const a = ask(q);
  const low = (a.text || '').toLowerCase().replace(/[’‘]/g, "'");
  const missing = subs.filter(s => !low.includes(s));
  ok(missing.length === 0, 'qa: "' + q + '"', 'missing ' + JSON.stringify(missing) + '\n      got: ' + a.text);
});
/* citations present on a typical answer */
const cited = ask('Who trained Darth Nihilus?');
ok(cited.cites && cited.cites.length > 0, 'qa answers carry citations', JSON.stringify(cited.cites));
const fu = ask('Who killed Darth Malak?');
ok(fu.followups && fu.followups.length > 0, 'qa answers carry follow-up suggestions');

/* ── 4. Graph shape ── */
console.log('\n== graph ==');
/* Events always live on the timeline; every non-event node must be graph-connected,
   and events should overwhelmingly be connected too. */
const orphanCore = [...S.nodes.values()].filter(n => n.type !== 'event' && (S.neighbors(n.id) || []).length === 0);
ok(orphanCore.length === 0, 'no orphan non-event nodes',
  orphanCore.map(n => n.id).join(', '));
const orphanEvents = [...S.nodes.values()].filter(n => n.type === 'event' && (S.neighbors(n.id) || []).length === 0);
ok(orphanEvents.length <= 4, 'unconnected events ≤ 4 (' + orphanEvents.map(n => n.id).join(', ') + ')');
const deg = id => (S.neighbors(id) || []).length;
ok(deg('revan') >= 15, 'revan is a proper hub (degree ' + deg('revan') + ')');
ok(S.rabbitHoles('revan', 6).length === 6, 'rabbit holes generated');

console.log('\n' + (failures ? failures + ' FAILURES' : 'ALL GREEN'));
process.exit(failures ? 1 : 0);
