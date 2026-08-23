# Old Republic Holocron

An interactive lore atlas of Star Wars Legends' Old Republic era — the Sith and Jedi across
six thousand years, from the Hundred-Year Darkness (7003 BBY) to the fall of Darth Krayt's
One Sith (138 ABY). Pure vanilla JS, zero dependencies, no build step required.

## Run it

- **Single file**: open `dist/index.html` directly in a browser (works from `file://`).
- **Dev**: serve this directory with any static server (`python3 -m http.server`) and open
  `index.html`. Data, engines, and views are separate files under `js/`.
- **Rebuild the single file**: `node build.js` (also emits a body-only artifact variant when
  `OUT_ARTIFACT=/path/out.html` is set).

## What's inside

On first visit the atlas opens with a skippable **opening crawl** (replayable from the
footer; a static title card under reduced motion), views change through a **hyperspace
star-streak jump**, and a depth-projected **starfield** with pointer parallax runs behind
everything — throttled, layer-isolated, and paused when hidden, so it stays at 60fps even
on software rendering.

**Mobile is a first-class target**: filter walls collapse into swipeable chip rails,
touch targets grow under coarse pointers, the timeline chart keeps vertical page scroll
(`touch-action: pan-y`) while pinch-zooming stays custom, event dots get invisible tap
pads, the drawer becomes a full-width sheet, the galaxy renders at a fixed width you swipe
with scaled-up type, and every search input is 16px so iOS never zoom-jumps on focus. A
dedicated touch-emulation test suite drives it all by tap.

Two full skins, toggled from the top bar and persisted: **Archive** (the crimson Sith-
holocron look) and **Console** — a classic Star Wars terminal/datapad mode: phosphor green
on black, mono type throughout, CRT scanlines and vignette, a blinking prompt, and the
whole data palette (alignments, eras, event kinds, canvas and SVG rendering, the holo
grid, even the starfield) remapped through a live theme engine in `js/ui/theme.js`.

| View | What it does |
|---|---|
| **Timeline** | Zoomable/pannable SVG chronology, 7000 BBY → 138 ABY, with **eased spring zooming** and **two-finger pinch**. Era ribbon (click to zoom), conflict span bars, ~100 point events in packed lanes, an **academy-cycles layer** (every opening/closing of Korriban, Trayus, Ossus, Dantooine, the Coruscant Temple, Tython, Yavin 4…), and a **lineages layer** (Dark Lord succession, the Revan line, the Banite Rule of Two chain with its deliberately unrecorded centuries, the Yoda–Skywalker line). Filter by era, event kind, and layer. Export PNG. |
| **Graph** | Canvas force-directed network of characters, factions, artifacts, concepts, worlds, and events, rendered with glow-sprite halos, gradient-lit nodes, curved edges, energy pulses flowing along a selected node's connections, animated selection rings, and label pills over a vignetted dot-grid — plus a **3D depth mode**: z-axis physics, perspective projection with depth cueing, slow auto-orbit, and drag-to-rotate. Color = alignment (Sith red / Jedi blue / gray gold / neutral), shape = type, size = degree. Filter by type, alignment, and era; click to focus a node and dim everything unconnected; drag nodes; pinch or wheel to zoom; export PNG. |
| **Atlas** | Full-text search over everything (hand-rolled inverted index: field weights, prefix matching, phrase bonus, highlighted snippets), plus an A–Z browse when the query is empty. |
| **Ask** | Natural-language Q&A answered **from the lore graph itself** — intent parsing (who trained X, who killed X, when/where/how, who founded/led, lineages, academy cycles, "what happened in YEAR") + graph retrieval + templated synthesis. Every answer links its entities and cites its sources; unparseable questions fall back to search. Try: *"When did the Sith academy reopen after Bane?"* |
| **Eras** | Nine deep-dives (Hyperspace War → Legacy), each with a period summary, battles, key figures, technological state, and the Jedi-vs-Sith balance — plus a jump to that span on the timeline. |
| **Galaxy** | A **holo-table star map**: the chart tilts in 3D perspective over a holographic grid with damped pointer parallax (toggleable; defaults flat on touch). Deep Core → Sith space → Unknown Regions, 21 worlds, the Daragon Trail and Sith-space spine drawn in. Click a world for its history, academy cycles, and artifacts; highlight any era to see where that era happened. |
| **Compare** | Any two entries side by side — characters, eras, factions, worlds — including everything the record says connects the pair (direct edges, shared events, shared connections). |

Everywhere: a shared entity drawer with bio, grouped relations, event record, sources, and
**"Related rabbit holes"** computed from graph adjacency.

## The dataset

Hand-curated, Legends continuity, in `js/data/`:

- **78 characters · 20 factions · 21 worlds · 97 events · 9 artifacts · 12 concepts**
- **~590 edges** across 24 relation types (`trained`, `killed`, `corrupted`, `founded`,
  `member`, `wielded`, `descendant`, …). Event participation and locations are declared on
  the events themselves and materialized into edges by `js/core/store.js`.
- **9 academies** with dated open/close periods and **4 succession lineages** in `js/data/world.js`.
- Years are numbers (negative = BBY, positive = ABY); `approx` flags mark contested dates.

Sources are cited per entry: Tales of the Jedi, KOTOR I/II (games, codices, and comics),
The Old Republic (game + novels *Revan* and *Deceived*), the Darth Bane trilogy,
*Darth Plagueis*, the films, Dark Empire, Legacy of the Force, Lost Tribe of the Sith, and
Star Wars: Legacy — with Wookieepedia used as a cross-check during curation. This is a
fan-made reference; not affiliated with or endorsed by Lucasfilm.

## Architecture

```
js/data/*    plain-object dataset (no logic)
js/core/     store.js   graph assembly, indexes, alias table, validation
             search.js  inverted index + snippets
             qa.js      intent parsing + retrieval + synthesis (fully offline)
js/ui/       app shell, timeline, graph, atlas, ask, eras, galaxy, compare, export
```

The Q&A engine is deliberately local — deterministic, testable, and private. If you want
LLM-polished prose on top, the seam is `HOLO.qa.answer(question)`: it already returns the
retrieved entities, the synthesized text, and the citations, which is exactly the context
block you'd hand to the Claude API (`claude-sonnet-5`, one call, ~40 lines) to rewrite the
`text` field. The retrieval stays authoritative either way, so the model can't invent lore.

## Tests

```
node test/run.js
```

Runs data-integrity checks (every edge endpoint exists, every date in range, every entity
sourced), a 13-case search battery, and a 26-question Q&A battery with expected answers.
A Playwright smoke test (drives every view headless, checks for JS errors) lives in the
session scratchpad and passed clean; re-create it against `dist/index.html` if you extend the UI.
