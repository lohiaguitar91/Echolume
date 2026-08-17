// First-encounter teaching.
//
// The game had two ways of explaining itself and neither worked. A prose banner
// listed the level's goals in a sentence nobody parsed, and the authored hints
// fired on a timer whether or not the thing they described was on screen. So a
// player could finish a depth without ever learning what a crystal was.
//
// This teaches the way the better mobile games do: nothing up front, then one
// short card the first time you actually see a thing, with a glyph that matches
// its shape on screen so you can find it. Once per element, ever — the seen set
// lives in the save. It never says "tap here"; it names the thing and what it
// does, and lets the player draw the conclusion.

const g = (body) => `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

// Glyphs deliberately echo how each thing is drawn in-world: motes are filled
// dots, crystals are faceted, ice is angular, the vent is a ringed portal.
export const TEACH = {
  mote: {
    glyph: g(`<circle cx="16" cy="16" r="5" fill="#ffc45e"/><circle cx="16" cy="16" r="10" stroke="#ffc45e" stroke-opacity=".4"/>`),
    lead: 'Amber motes',
    plain: 'Every one you take is banked, and carried into the next gate.',
  },
  vent: {
    glyph: g(`<circle cx="16" cy="16" r="11" stroke="#5effc2" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#5effc2" fill-opacity=".5"/><path d="M11 14l5 6 5-6" stroke="#5effc2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`),
    lead: 'The vent',
    plain: 'The way down. Reaching it ends the depth.',
  },
  urchin: {
    glyph: g(`<circle cx="16" cy="16" r="5" fill="#ff4f9a"/><g stroke="#ff4f9a" stroke-width="2" stroke-linecap="round"><path d="M16 4v4M16 24v4M4 16h4M24 16h4M8 8l3 3M21 21l3 3M24 8l-3 3M11 21l-3 3"/></g>`),
    lead: 'Thorns',
    plain: 'They cost a heart on contact. A song shows them before you arrive.',
  },
  hunter: {
    glyph: g(`<circle cx="21" cy="11" r="5" fill="#b14fff"/><path d="M17 15q-5 3-8 7" stroke="#b14fff" stroke-width="2" stroke-linecap="round"/><path d="M12 19l-3 3 4 2" stroke="#b14fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`),
    lead: 'It hears you',
    plain: 'It swims to where your last song landed. Stop singing and drift to lose it.',
  },
  // Taught right after the hunter: the moment you know things chase your song
  // is the moment throwing it somewhere else becomes an idea worth having.
  cast: {
    glyph: g(`<circle cx="8" cy="22" r="4" fill="#eafcff"/><path d="M12 20q6-6 12-9" stroke="#8ef4ff" stroke-width="1.6" stroke-dasharray="2 4" stroke-linecap="round"/><circle cx="26" cy="9" r="5" stroke="#8ef4ff" stroke-width="1.8"/>`),
    lead: 'Throw your voice',
    plain: 'Hold, then let go. The song lands where you held — and so does everything listening.',
  },
  current: {
    glyph: g(`<g stroke="#3f6fff" stroke-width="2" stroke-linecap="round"><path d="M5 11q6-4 11 0t11 0M5 20q6-4 11 0t11 0"/></g>`),
    lead: 'Moving water',
    plain: 'It pushes you. Going with it saves songs; fighting it spends them.',
  },
  lure: {
    glyph: g(`<circle cx="16" cy="11" r="4" fill="#ffc45e"/><path d="M16 15v6" stroke="#ff5fb0" stroke-width="2"/><path d="M11 21h10l-2 6h-6z" fill="#ff5fb0" fill-opacity=".6"/>`),
    lead: 'Not all light is food',
    plain: 'Some amber is bait. Sing at a light first — a false one shows its tether.',
  },
  crystal: {
    glyph: g(`<path d="M16 5l7 6-3 10h-8l-3-10z" stroke="#dcefff" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="14" r="3" fill="#dcefff" fill-opacity=".7"/>`),
    lead: 'Bloom crystal',
    plain: 'Sing near it and it answers with light of its own. Free, and silent.',
  },
  heartMote: {
    glyph: g(`<path d="M16 25s-9-5.5-9-12a5 5 0 019-3 5 5 0 019 3c0 6.5-9 12-9 12z" fill="#ff6f91" fill-opacity=".75"/>`),
    lead: 'The beating light',
    plain: 'It mends a heart, and only takes if you are already hurt.',
  },
  hushZone: {
    glyph: g(`<circle cx="16" cy="16" r="12" fill="#2a3350"/><circle cx="16" cy="16" r="12" stroke="#4a5a80"/><path d="M9 16h14" stroke="#4a5a80" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 4"/>`),
    lead: 'Thick water',
    plain: 'It swallows any song sung inside it. Sing from the edge and reach in.',
  },
  ice: {
    glyph: g(`<g stroke="#9fb8c8" stroke-width="2" stroke-linecap="round"><path d="M16 6v20M7 11l18 10M25 11L7 21"/></g>`),
    lead: 'Brittle ice',
    plain: 'It costs no hearts. It breaks loudly, and everything turns toward the sound.',
  },
  warmVent: {
    glyph: g(`<g stroke="#ff8a3d" stroke-width="2" stroke-linecap="round"><path d="M11 24q2-5 0-9t2-9M21 24q2-5 0-9t2-9"/></g><circle cx="16" cy="16" r="13" stroke="#ff8a3d" stroke-opacity=".35"/>`),
    lead: 'Warm water, rising',
    plain: 'It carries you, and lights the way, without costing a song.',
  },
  leviathan: {
    glyph: g(`<circle cx="16" cy="16" r="12" stroke="#9d7bff" stroke-opacity=".5" stroke-dasharray="3 4"/><circle cx="16" cy="4" r="4" fill="#9d7bff"/>`),
    lead: 'Something larger',
    plain: 'It cannot be killed, only avoided. Learn the loop it swims.',
  },
  warden: {
    glyph: g(`<circle cx="16" cy="16" r="5" fill="#d8d0c4"/><g stroke="#d8d0c4" stroke-width="2" stroke-linecap="round"><path d="M16 6V3M6 16H3M16 26v3M26 16h3"/></g><path d="M22 10l7-4-2 8z" fill="#ff3b5c" fill-opacity=".65"/>`),
    lead: 'It cannot chase',
    plain: 'It strikes where you last sang. So sing somewhere you are not.',
  },
};

// Which teaches a level can possibly fire, derived from what it actually holds,
// so nothing is ever explained before the player can see it.
const SOURCES = [
  ['mote', (e) => e.motes.length],
  ['vent', () => 1],
  ['urchin', (e) => e.urchins.length],
  ['hunter', (e) => e.hunters.length],
  ['cast', (e) => e.hunters.length],   // the counter arrives with the threat
  ['current', (e) => e.currents.length],
  ['lure', (e) => e.lures.length],
  ['crystal', (e) => e.crystals.length],
  ['heartMote', (e) => e.heartMotes.length],
  ['hushZone', (e) => (e.hushZones || []).length],
  ['ice', (e) => (e.ice || []).length],
  ['warmVent', (e) => (e.warmVents || []).length],
  ['leviathan', (e) => e.leviathans.length],
  ['warden', (e) => (e.wardens || []).length],
];

export class Teacher {
  constructor(save, ui) {
    this.save = save;
    this.ui = ui;
    this.pending = [];
  }

  // Called on level start: queue only what this depth contains and the player
  // has never met. Nothing fires yet — they fire as each thing comes into view.
  arm(ents) {
    const seen = this.save.data.teachSeen || (this.save.data.teachSeen = []);
    this.pending = SOURCES
      .filter(([key, count]) => count(ents) > 0 && !seen.includes(key) && TEACH[key])
      .map(([key]) => key);
  }

  // Fire the first pending teach whose subject is actually on screen. One per
  // call, so two never stack, and only while the player is playing.
  update(ents, inView) {
    if (!this.pending.length) return null;
    for (let i = 0; i < this.pending.length; i++) {
      const key = this.pending[i];
      if (!this._visible(key, ents, inView)) continue;
      this.pending.splice(i, 1);
      const seen = this.save.data.teachSeen;
      if (!seen.includes(key)) { seen.push(key); this.save.persist(); }
      const t = TEACH[key];
      this.ui.teach(t.glyph, t.lead, t.plain);
      return key;
    }
    return null;
  }

  _visible(key, e, inView) {
    const any = (arr, r = 40) => (arr || []).some((o) => !o.taken && !o.broken && inView(o.x, o.y, r));
    switch (key) {
      case 'mote': return any(e.motes);
      case 'vent': return inView(e.vent.x, e.vent.y, 40);
      case 'urchin': return any(e.urchins);
      case 'hunter': return any(e.hunters, 60);
      case 'cast': return any(e.hunters, 60);
      case 'current': return (e.currents || []).some((c) => inView(c.x, c.y, c.r));
      case 'lure': return any(e.lures, 50);
      case 'crystal': return any(e.crystals);
      case 'heartMote': return any(e.heartMotes);
      case 'hushZone': return (e.hushZones || []).some((h) => inView(h.x, h.y, h.r));
      case 'ice': return any(e.ice);
      case 'warmVent': return (e.warmVents || []).some((w) => inView(w.x, w.y, w.r));
      case 'leviathan': return any(e.leviathans, 90);
      case 'warden': return any(e.wardens, 90);
      default: return false;
    }
  }
}
