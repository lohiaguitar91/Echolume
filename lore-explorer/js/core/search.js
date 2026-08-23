/* Holocron core — full-text search: hand-rolled inverted index with field weights,
   prefix matching, phrase bonus, and highlighted context snippets. Node-safe. */
(function () {
  'use strict';
  const H = window.HOLO;
  const S = H.store;

  const STOP = new Set(['the', 'a', 'an', 'of', 'and', 'or', 'in', 'on', 'at', 'to', 'is', 'was', 'were',
    'for', 'with', 'by', 'as', 'its', 'his', 'her', 'their', 'it', 'that', 'this', 'from', 'into']);

  const FIELDS = [
    { key: 'name', weight: 10 },
    { key: 'aka', weight: 8 },
    { key: 'tags', weight: 5 },
    { key: 'blurb', weight: 3 },
    { key: 'body', weight: 1 },      // detail || bio || deathNote
    { key: 'sources', weight: 0.5 }
  ];

  const tokenize = s => S.norm(s).split(' ').filter(t => t && t.length > 1 && !STOP.has(t));

  /* Build docs. */
  const docs = new Map();   // id → {id, fields: {key: text}, tokens: {key: [t]}}
  S.nodes.forEach(n => {
    const fields = {
      name: n.name,
      aka: (n.aka || []).join(' '),
      tags: (n.tags || []).join(' '),
      blurb: n.blurb || '',
      body: [n.detail, n.bio, n.deathNote].filter(Boolean).join(' '),
      sources: (n.sources || []).join(' ')
    };
    const tokens = {};
    FIELDS.forEach(f => { tokens[f.key] = tokenize(fields[f.key]); });
    docs.set(n.id, { id: n.id, fields, tokens });
  });
  /* Academies are searchable too (they resolve to their location). */
  (S.academies || []).forEach(a => {
    const loc = S.get(a.loc);
    const fields = {
      name: a.name, aka: '', tags: 'academy ' + a.side,
      blurb: a.blurb || '',
      body: (a.periods || []).map(p => (p.by || '') + ' ' + (p.note || '')).join(' '),
      sources: (a.sources || []).join(' ')
    };
    const tokens = {};
    FIELDS.forEach(f => { tokens[f.key] = tokenize(fields[f.key]); });
    docs.set(a.id, { id: a.id, fields, tokens, academy: a, resolvesTo: loc ? loc.id : null });
  });

  /* Inverted index: token → Map(docId → weight). */
  const index = new Map();
  docs.forEach(doc => {
    FIELDS.forEach(f => {
      doc.tokens[f.key].forEach(tok => {
        let m = index.get(tok);
        if (!m) { m = new Map(); index.set(tok, m); }
        m.set(doc.id, (m.get(doc.id) || 0) + f.weight);
      });
    });
  });
  const allTokens = [...index.keys()];

  function search(query, opts) {
    opts = opts || {};
    const qNorm = S.norm(query);
    const qTokens = tokenize(query);
    if (!qTokens.length && !qNorm) return [];
    const scores = new Map();   // docId → score
    const hitTokens = new Map(); // docId → Set(query tokens matched)

    qTokens.forEach(qt => {
      // exact
      const exact = index.get(qt);
      if (exact) exact.forEach((w, id) => {
        scores.set(id, (scores.get(id) || 0) + w);
        if (!hitTokens.has(id)) hitTokens.set(id, new Set());
        hitTokens.get(id).add(qt);
      });
      // prefix (skip very short prefixes)
      if (qt.length >= 3) {
        allTokens.forEach(tok => {
          if (tok.length > qt.length && tok.startsWith(qt)) {
            index.get(tok).forEach((w, id) => {
              scores.set(id, (scores.get(id) || 0) + w * 0.45);
              if (!hitTokens.has(id)) hitTokens.set(id, new Set());
              hitTokens.get(id).add(qt);
            });
          }
        });
      }
    });

    /* Phrase + name bonuses, coverage multiplier. */
    scores.forEach((sc, id) => {
      const doc = docs.get(id);
      const nameNorm = S.norm(doc.fields.name);
      let bonus = 0;
      if (qNorm && nameNorm === qNorm) bonus += 40;
      else if (qNorm.length >= 4 && nameNorm.includes(qNorm)) bonus += 18;
      else if (qNorm.length >= 6 && S.norm(doc.fields.blurb + ' ' + doc.fields.body).includes(qNorm)) bonus += 8;
      const cover = (hitTokens.get(id) || new Set()).size / Math.max(qTokens.length, 1);
      scores.set(id, (sc + bonus) * (0.4 + 0.6 * cover));
    });

    let results = [...scores.entries()]
      .map(([id, score]) => ({ id, score, doc: docs.get(id) }))
      .sort((a, b) => b.score - a.score);

    if (opts.types) results = results.filter(r => {
      const n = S.get(r.id);
      const t = n ? n.type : 'academy';
      return opts.types.includes(t);
    });

    return results.slice(0, opts.limit || 24).map(r => {
      const node = S.get(r.id);
      return {
        id: r.id, score: r.score,
        node: node || null,
        academy: r.doc.academy || null,
        snippet: snippet(r.doc, qTokens)
      };
    });
  }

  /* Best window of the body/blurb containing the most query tokens; ⟪⟫ mark highlights. */
  function snippet(doc, qTokens) {
    const text = (doc.fields.blurb + ' — ' + doc.fields.body).replace(/\s+/g, ' ').trim();
    if (!text) return '';
    const low = S.norm(text);
    // Position of each query token (first few occurrences).
    const hits = [];
    qTokens.forEach(qt => {
      let from = 0, n = 0;
      while (n < 4) {
        const i = low.indexOf(qt, from);
        if (i === -1) break;
        hits.push({ i, len: qt.length });
        from = i + 1; n++;
      }
    });
    let start = 0;
    if (hits.length) {
      // window of 220 chars maximizing hit count
      hits.sort((a, b) => a.i - b.i);
      let best = 0, bestCount = 0;
      for (let a = 0; a < hits.length; a++) {
        let count = 0;
        for (let b = a; b < hits.length && hits[b].i < hits[a].i + 200; b++) count++;
        if (count > bestCount) { bestCount = count; best = hits[a].i; }
      }
      start = Math.max(0, best - 40);
    }
    // align to word boundary
    if (start > 0) { const sp = text.indexOf(' ', start); if (sp !== -1 && sp - start < 20) start = sp + 1; }
    let out = text.slice(start, start + 240);
    if (start > 0) out = '… ' + out;
    if (start + 240 < text.length) out += ' …';
    // mark tokens
    qTokens.forEach(qt => {
      if (qt.length < 3) return;
      out = out.replace(new RegExp('(' + qt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-z]*)', 'ig'), '⟪$1⟫');
    });
    // collapse nested/adjacent marks
    out = out.replace(/⟪([^⟫]*)⟪/g, '⟪$1').replace(/⟫([^⟪]*)⟫/g, '$1⟫');
    return out;
  }

  H.search = { search, tokenize, docs };
})();
