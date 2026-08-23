/* Holocron core — Q&A: intent parsing + graph retrieval + templated synthesis, with citations.
   answer(question) → { text, chips: [entityIds], cites: [source strings], followups: [questions], via }
   Pure logic; Node-safe. */
(function () {
  'use strict';
  const H = window.HOLO;
  const S = H.store;

  const fmtY = S.fmtYear;
  const name = id => { const n = S.get(id); return n ? n.name : id; };

  function citesOf(ids) {
    const out = [];
    ids.forEach(id => {
      const n = S.get(id);
      (n && n.sources || []).forEach(s => { if (!out.includes(s)) out.push(s); });
    });
    return out.slice(0, 5);
  }

  function link(q) {
    // strip question scaffolding so linking sees the entity words
    return S.linkEntities(q, 4);
  }

  function lifespanText(c) {
    if (c.born == null && c.died == null) return null;
    if (c.born != null && c.died != null) return fmtY(c.born, c.approx) + ' – ' + fmtY(c.died, c.approx);
    if (c.died != null) return 'died ' + fmtY(c.died, c.approx);
    return 'born ' + fmtY(c.born, c.approx);
  }

  /* ── Intent answers ── */

  function whoTrained(id) {
    const c = S.get(id);
    const masters = S.related(id, 'trained', 'in');
    if (!masters.length) return { text: 'The record lists no master for ' + c.name + '.', chips: [id], cites: citesOf([id]) };
    const parts = masters.map(m => name(m.other) + (m.note ? ' (' + m.note + ')' : ''));
    return {
      text: c.name + ' was trained by ' + joinAnd(parts) + '.',
      chips: [id, ...masters.map(m => m.other)],
      cites: citesOf([id, ...masters.map(m => m.other)])
    };
  }

  function whomDidTrain(id) {
    const c = S.get(id);
    const apps = S.related(id, 'trained', 'out');
    if (!apps.length) return { text: 'The record lists no apprentices or students of ' + c.name + '.', chips: [id], cites: citesOf([id]) };
    const parts = apps.map(a => name(a.other) + (a.note ? ' (' + a.note + ')' : ''));
    return {
      text: c.name + ' trained ' + joinAnd(parts) + '.',
      chips: [id, ...apps.map(a => a.other)],
      cites: citesOf([id, ...apps.map(a => a.other)])
    };
  }

  function whoKilled(id) {
    const c = S.get(id);
    const killers = S.related(id, 'killed', 'in');
    let text;
    const chips = [id];
    if (killers.length) {
      text = c.name + ' was killed by ' + joinAnd(killers.map(k => name(k.other) + (k.note ? ' — ' + k.note : ''))) + (c.died != null ? ' (' + fmtY(c.died, c.approx) + ')' : '') + '.';
      killers.forEach(k => chips.push(k.other));
      if (c.deathNote) text += ' ' + c.deathNote;
    } else if (c.deathNote) {
      text = c.deathNote;
    } else if (c.died != null) {
      text = c.name + ' died in ' + fmtY(c.died, c.approx) + '; the record names no killer.';
    } else {
      text = 'The record does not describe the death of ' + c.name + '.';
    }
    return { text, chips, cites: citesOf(chips) };
  }

  function howDied(id) {
    const c = S.get(id);
    if (c.deathNote) {
      const chips = [id, ...S.related(id, 'killed', 'in').map(k => k.other)];
      if (c.diedAt) chips.push(c.diedAt);
      return { text: c.deathNote, chips, cites: citesOf([id]) };
    }
    return whoKilled(id);
  }

  function whereDied(id) {
    const c = S.get(id);
    if (c.diedAt) {
      const loc = S.get(c.diedAt);
      let text = c.name + ' died on ' + loc.name + (c.died != null ? ' in ' + fmtY(c.died, c.approx) : '') + '.';
      if (c.deathNote) text += ' ' + c.deathNote;
      return { text, chips: [id, c.diedAt], cites: citesOf([id, c.diedAt]) };
    }
    if (c.deathNote) return { text: c.deathNote, chips: [id], cites: citesOf([id]) };
    return { text: 'The record does not say where ' + c.name + ' died.', chips: [id], cites: citesOf([id]) };
  }

  function whenIs(id, q) {
    const n = S.get(id);
    const chips = [id];
    if (n.type === 'event') {
      const span = n.endYear != null ? fmtY(n.year, n.approx) + ' to ' + fmtY(n.endYear, n.approx) : fmtY(n.year, n.approx);
      return { text: n.name + (n.endYear != null ? ' ran from ' : ' occurred in ') + span + '. ' + n.blurb, chips, cites: citesOf(chips) };
    }
    if (n.type === 'character') {
      if (/\b(born|birth)\b/.test(q) && n.born != null)
        return { text: n.name + ' was born in ' + fmtY(n.born, n.approx) + '.', chips, cites: citesOf(chips) };
      if (/\b(die|died|death)\b/.test(q) && n.died != null)
        return { text: n.name + ' died in ' + fmtY(n.died, n.approx) + '.' + (n.deathNote ? ' ' + n.deathNote : ''), chips, cites: citesOf(chips) };
      const ls = lifespanText(n);
      return { text: n.name + (ls ? ': ' + ls + '.' : ': the record preserves no dates.') + ' ' + n.blurb, chips, cites: citesOf(chips) };
    }
    if (n.from != null || n.to != null) {
      return { text: n.name + ': ' + S.fmtSpan(n.from, n.to, n.approx) + '. ' + n.blurb, chips, cites: citesOf(chips) };
    }
    return whatIs(id);
  }

  function whereIs(id, q) {
    const n = S.get(id);
    const chips = [id];
    if (n.type === 'location') {
      return { text: n.name + ' lies in the ' + n.region + '. ' + n.blurb, chips, cites: citesOf(chips) };
    }
    if (n.type === 'artifact' && n.loc) {
      const loc = S.get(n.loc);
      return { text: 'The record ties ' + n.name + ' to ' + loc.name + '. ' + n.blurb, chips: [id, n.loc], cites: citesOf([id, n.loc]) };
    }
    if (n.type === 'event') {
      const at = S.related(id, 'occurred-at', 'out');
      if (at.length) {
        const loc = S.get(at[0].other);
        return { text: n.name + ' took place at ' + loc.name + ' (' + fmtY(n.year, n.approx) + '). ' + n.blurb, chips: [id, loc.id], cites: citesOf([id, loc.id]) };
      }
    }
    if (n.type === 'character') {
      if (/\b(die|died|death|buried|tomb)\b/.test(q)) return whereDied(id);
      // Where did X fight / appear: list event locations
      const evs = S.related(id, 'took-part', 'out').map(e => S.get(e.other)).filter(Boolean)
        .sort((a, b) => a.year - b.year);
      const locs = [];
      evs.forEach(ev => {
        const at = S.related(ev.id, 'occurred-at', 'out')[0];
        if (at && !locs.includes(at.other)) locs.push(at.other);
      });
      if (locs.length) {
        return {
          text: n.name + '’s recorded history runs through ' + joinAnd(locs.slice(0, 6).map(name)) + '.',
          chips: [id, ...locs.slice(0, 6)], cites: citesOf([id])
        };
      }
    }
    return whatIs(id);
  }

  function whoLed(id, verb) {
    const n = S.get(id);
    const rels = ['founded', 'led'];
    const found = [];
    rels.forEach(r => S.related(id, r, 'in').forEach(e => found.push({ e, r })));
    if (n.type === 'artifact' || n.type === 'concept') {
      S.related(id, 'created', 'in').forEach(e => found.push({ e, r: 'created' }));
      S.related(id, 'authored', 'in').forEach(e => found.push({ e, r: 'authored' }));
    }
    if (!found.length) return whatIs(id);
    const founders = found.filter(f => f.r === 'founded' || f.r === 'created' || f.r === 'authored');
    const leaders = found.filter(f => f.r === 'led');
    let text = '';
    if (founders.length) text += n.name + ' was ' + (n.type === 'concept' ? 'authored' : founders[0].r === 'created' ? 'created' : 'founded') + ' by ' + joinAnd(founders.map(f => name(f.e.other) + (f.e.note ? ' (' + f.e.note + ')' : ''))) + '. ';
    if (leaders.length) text += 'Its recorded leaders include ' + joinAnd(leaders.map(f => name(f.e.other) + (f.e.note ? ' (' + f.e.note + ')' : ''))) + '.';
    if (!text) text = n.blurb;
    const chips = [id, ...found.map(f => f.e.other)];
    return { text: text.trim(), chips, cites: citesOf(chips) };
  }

  function whatIs(id) {
    const n = S.get(id);
    const chips = [id];
    let text = n.name + ' — ' + n.blurb;
    const body = n.detail || n.bio;
    if (body) text += ' ' + body;
    return { text, chips, cites: citesOf(chips) };
  }

  function lineageOf(id) {
    const c = S.get(id);
    const chips = [id];
    const parts = [];
    // masters (up-chain)
    const seen = new Set([id]);
    let chain = [];
    let cur = id;
    for (let i = 0; i < 6; i++) {
      const m = S.related(cur, 'trained', 'in').filter(x => !seen.has(x.other))[0];
      if (!m) break;
      chain.unshift(m.other); seen.add(m.other); cur = m.other;
    }
    if (chain.length) {
      parts.push('Line of masters: ' + chain.map(name).join(' → ') + ' → ' + c.name + '.');
      chain.forEach(x => chips.push(x));
    }
    const apps = S.related(id, 'trained', 'out');
    if (apps.length) {
      parts.push('Students: ' + joinAnd(apps.map(a => name(a.other))) + '.');
      apps.forEach(a => chips.push(a.other));
    }
    const desc = S.related(id, 'descendant', 'in');
    if (desc.length) {
      parts.push('Recorded descendants: ' + joinAnd(desc.map(d => name(d.other) + (d.note ? ' (' + d.note + ')' : ''))) + '.');
      desc.forEach(d => chips.push(d.other));
    }
    const anc = S.related(id, 'descendant', 'out');
    if (anc.length) {
      parts.push(c.name + ' descends from ' + joinAnd(anc.map(d => name(d.other))) + '.');
      anc.forEach(d => chips.push(d.other));
    }
    (S.lineages || []).forEach(l => {
      if (l.members.includes(id)) parts.push('Appears in the lineage “' + l.name + '”: ' + l.members.map(name).join(' → ') + '. ' + (l.note || ''));
    });
    if (!parts.length) return whatIs(id);
    return { text: parts.join(' '), chips: [...new Set(chips)], cites: citesOf([id]) };
  }

  /* Academy questions — periods live in S.academies. */
  function academyAnswer(q, linked) {
    const acads = S.academies || [];
    // pick academy: linked location, or name fragment, else Korriban
    let target = null, assumed = false;
    const locLink = linked.map(l => S.get(l.id)).find(n => n && n.type === 'location');
    if (locLink) target = acads.find(a => a.loc === locLink.id);
    if (!target) {
      target = acads.find(a => S.norm(a.name).split(' ').some(w => w.length > 4 && q.includes(w)));
    }
    if (!target && /\bjedi\b/.test(q)) target = acads.find(a => a.id === 'ac-coruscant');
    if (!target) { target = acads.find(a => a.id === 'ac-korriban'); assumed = true; }
    if (!target) return null;

    const loc = S.get(target.loc);
    const chips = [target.loc];
    const periodLine = p => S.fmtYear(p.from, p.approx) + ' – ' + (p.to == null ? 'fate unrecorded' : S.fmtYear(p.to, p.approxEnd)) + ' under ' + p.by + (p.note ? ': ' + p.note : '');

    // “reopen after X” → first period beginning after X’s death/era
    const reopen = /\bre-?open|\breopen|\brestor|\breturn|\brebuil|\bre-?establish|\bre-?found/.test(q);
    const afterMatch = q.match(/after\s+(?:the\s+)?(.+?)(?:\?|$)/);
    if (reopen && afterMatch) {
      const afterLinks = S.linkEntities(afterMatch[1], 2);
      let pivotYear = null, pivotName = null;
      for (const al of afterLinks) {
        const n = S.get(al.id);
        if (!n) continue;
        pivotName = n.name;
        if (n.type === 'character' && n.died != null) { pivotYear = n.died; break; }
        if (n.type === 'event') { pivotYear = n.endYear != null ? n.endYear : n.year; break; }
        if (n.to != null) { pivotYear = n.to; break; }
        if (al.id) chips.push(al.id);
      }
      if (pivotYear != null) {
        const next = (target.periods || []).find(p => p.from > pivotYear);
        const during = (target.periods || []).filter(p => p.from <= pivotYear && (p.to == null || p.to >= pivotYear));
        let text;
        if (next) {
          text = 'After ' + pivotName + (pivotYear != null ? ' (' + fmtY(pivotYear) + ')' : '') + ', the ' + target.name +
            ' next reopened in ' + fmtY(next.from, next.approx) + ' under the ' + next.by + '.' + (next.note ? ' ' + next.note : '');
          if (during.length) text += ' (In ' + pivotName + '’s own time it operated ' + S.fmtSpan(during[0].from, during[0].to) + ' under the ' + during[0].by + '.)';
        } else {
          text = 'The record shows no reopening of the ' + target.name + ' after ' + pivotName + '.';
        }
        if (assumed) text += ' — Reading “the Sith academy” as Korriban’s; ask about another world to switch.';
        return { text, chips, cites: (target.sources || []).slice(0, 4) };
      }
    }

    // full history
    const lines = (target.periods || []).map(periodLine);
    let text = 'The ' + target.name + (loc ? ' on ' + loc.name : '') + ' — ' + (target.blurb || '') + ' Its recorded cycles: ' + lines.join(' · ') + '.';
    if (assumed) text += ' — Reading “the academy” as Korriban’s; name another world (Trayus/Malachor, Dantooine, Ossus, Tython, Yavin 4, Coruscant, Dromund Kaas, Telos) to switch.';
    return { text, chips, cites: (target.sources || []).slice(0, 4) };
  }

  function yearLookup(yearNum, isABY) {
    const y = isABY ? yearNum : -yearNum;
    const evs = [...S.nodes.values()].filter(n => n.type === 'event')
      .map(e => ({ e, d: Math.min(Math.abs(e.year - y), e.endYear != null ? Math.abs(e.endYear - y) : Infinity, (e.endYear != null && y >= e.year && y <= e.endYear) ? 0 : Infinity) }))
      .filter(x => x.d <= 30)
      .sort((a, b) => a.d - b.d).slice(0, 5);
    if (!evs.length) return { text: 'The record holds nothing within thirty years of ' + fmtY(y) + '.', chips: [], cites: [] };
    const text = 'Around ' + fmtY(y) + ': ' + evs.map(x => x.e.name + ' (' + fmtY(x.e.year, x.e.approx) + (x.e.endYear != null ? '–' + fmtY(x.e.endYear).replace(' BBY', '').replace(' ABY', '') : '') + ')').join(' · ') + '.';
    return { text, chips: evs.map(x => x.e.id), cites: citesOf(evs.map(x => x.e.id)).slice(0, 4) };
  }

  function joinAnd(arr) {
    if (arr.length <= 1) return arr.join('');
    if (arr.length === 2) return arr[0] + ' and ' + arr[1];
    return arr.slice(0, -1).join(', ') + ', and ' + arr[arr.length - 1];
  }

  function firstOfType(linked, types) {
    for (const l of linked) {
      const n = S.get(l.id);
      if (n && types.includes(n.type)) return l.id;
    }
    return null;
  }

  /* ── Main entry ── */
  function answer(question) {
    const q = ' ' + S.norm(question) + ' ';
    const linked = link(question);
    const firstChar = firstOfType(linked, ['character']);
    const firstAny = linked.length ? linked[0].id : null;
    let res = null, via = null;

    const m = (re) => { const r = q.match(re); return r; };

    // academies get first crack — “academy” questions are this tool’s signature
    if (/\bacadem/.test(q)) {
      res = academyAnswer(q, linked); via = 'academy-cycles';
    }

    let mm;
    if (!res && (mm = m(/who (?:trained|taught|mentored|instructed) /))) {
      if (firstChar) { res = whoTrained(firstChar); via = 'who-trained'; }
    }
    if (!res && (mm = m(/who (?:was|were) (?:the )?(?:master|masters|teacher|teachers|mentor)s? of /))) {
      if (firstChar) { res = whoTrained(firstChar); via = 'who-trained'; }
    }
    if (!res && /(?:'s|s') (?:master|teacher|mentor)/.test(q) && firstChar) { res = whoTrained(firstChar); via = 'who-trained'; }
    if (!res && (m(/who did .+ train/) || m(/whom did .+ train/) || /(?:'s|s') (?:apprentice|apprentices|students?)/.test(q) || m(/who (?:was|were) (?:the )?apprentices? of /))) {
      if (firstChar) { res = whomDidTrain(firstChar); via = 'apprentices'; }
    }
    if (!res && m(/who (?:killed|slew|murdered|assassinated|struck down) /)) {
      if (firstChar) { res = whoKilled(firstChar); via = 'who-killed'; }
    }
    if (!res && m(/who (?:defeated|beat|bested) /)) {
      if (firstAny) {
        const killers = S.related(firstAny, 'defeated', 'in');
        if (killers.length) {
          res = {
            text: name(firstAny) + ' was defeated by ' + joinAnd(killers.map(k => name(k.other) + (k.note ? ' — ' + k.note : ''))) + '.',
            chips: [firstAny, ...killers.map(k => k.other)], cites: citesOf([firstAny])
          };
        } else if (firstChar) res = whoKilled(firstChar);
        via = 'who-defeated';
      }
    }
    if (!res && m(/how did .+ (?:die|fall|end|perish)/) && firstChar) { res = howDied(firstChar); via = 'how-died'; }
    if (!res && m(/where (?:did|was|is|does) /)) {
      if (firstAny) { res = whereIs(firstAny, q); via = 'where'; }
    }
    if (!res && m(/when /)) {
      const yr = q.match(/\b(\d{1,4})\s*(bby|aby)\b/);
      if (yr) { res = yearLookup(parseInt(yr[1], 10), yr[2] === 'aby'); via = 'year'; }
      else if (firstAny) { res = whenIs(firstAny, q); via = 'when'; }
    }
    if (!res && (m(/who (?:led|leads|ruled|rules|founded|commanded|created|built|made|wrote|authored) /))) {
      const target = firstOfType(linked, ['faction', 'artifact', 'concept']) || firstAny;
      if (target) { res = whoLed(target); via = 'who-led'; }
    }
    if (!res && (m(/ lineage/) || m(/line of /) || m(/succession/) || m(/descend/) || m(/bloodline/))) {
      if (firstChar) { res = lineageOf(firstChar); via = 'lineage'; }
      else {
        const lin = (S.lineages || []).find(l => S.norm(l.name).split(' ').some(w => w.length > 4 && q.includes(w)));
        if (lin) {
          res = { text: lin.name + ': ' + lin.members.map(name).join(' → ') + '. ' + (lin.note || ''), chips: lin.members.slice(), cites: [] };
          via = 'lineage';
        }
      }
    }
    if (!res) {
      const yr = q.match(/\b(?:what happened|events?|history)\b.*?\b(\d{1,4})\s*(bby|aby)\b/) || q.match(/\b(\d{1,4})\s*(bby|aby)\b/);
      if (yr && /what|happen|event/.test(q)) { res = yearLookup(parseInt(yr[1], 10), yr[2] === 'aby'); via = 'year'; }
    }
    if (!res && m(/(?:what is|what's|whats|what was|what are|define|explain|tell me about|who is|who was|who were) /)) {
      if (firstAny) { res = whatIs(firstAny); via = 'what-is'; }
    }
    if (!res && firstAny && linked.length === 1) {
      // bare entity mention (“revan?”, “the thought bomb”) — describe it
      const bare = S.norm(question).trim();
      if (bare.split(' ').length <= 4) { res = whatIs(firstAny); via = 'what-is'; }
    }

    /* Fallback: search. */
    if (!res) {
      const hits = H.search.search(question, { limit: 5 });
      if (hits.length) {
        const top = hits[0];
        const topNode = top.node;
        let text = 'No direct answer in the record — closest entries: ' +
          joinAnd(hits.slice(0, 3).map(h => (h.node ? h.node.name : h.academy.name)));
        if (topNode) text += '. ' + topNode.name + ': ' + topNode.blurb;
        res = { text, chips: hits.filter(h => h.node).map(h => h.id).slice(0, 4), cites: citesOf(hits.filter(h => h.node).map(h => h.id)).slice(0, 4) };
        via = 'search-fallback';
      } else {
        res = { text: 'The holocron holds nothing on that — try naming a character, world, war, or doctrine of the Old Republic era.', chips: [], cites: [] };
        via = 'empty';
      }
    }

    res.via = via;
    res.followups = suggestFollowups(res.chips, question);
    return res;
  }

  function suggestFollowups(chips, question) {
    const out = [];
    const asked = S.norm(question || '');
    const c0 = chips && chips.length ? S.get(chips[0]) : null;
    if (c0 && c0.type === 'character') {
      if (S.related(c0.id, 'trained', 'out').length) out.push('Who did ' + c0.name + ' train?');
      if (S.related(c0.id, 'killed', 'in').length) out.push('Who killed ' + c0.name + '?');
      if (c0.died != null) out.push('How did ' + c0.name + ' die?');
    }
    if (c0 && c0.type === 'location') out.push('What is ' + c0.name + '?');
    if (out.length < 3) out.push('When did the Sith academy reopen after Bane?');
    if (out.length < 3) out.push('Who founded the Brotherhood of Darkness?');
    return out.filter(q => S.norm(q) !== asked).slice(0, 3);
  }

  H.qa = { answer };
})();
