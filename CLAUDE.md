# Echolume — project facts

**On a Mac? Read `MACOS-NEXT.md` first** — it is written for the session picking
this up there: what is done, what has never been compiled, the traps that have
already cost time, and the design rules that must not be broken.
`HANDOFF.md` is the longer history; `SHIP.md` is the ordered human checklist.

- Run: `npm run dev` → port 3852 (config also in parent code-projects/.claude/launch.json as "echolume").
- Pure vanilla JS in `www/`, no build step. Capacitor 8 wraps it (`android/`, `ios/`).
- After editing `www/` or capacitor.config.json: `npx cap sync` to update native projects.
- **`npx cap sync` on Windows corrupts `ios/App/CapApp-SPM/Package.swift`**, rewriting the
  plugin paths with backslashes (`..\..\..\node_modules\@capacitor\haptics`). Swift needs
  forward slashes and the iOS build fails without them. This has now bitten twice. After every
  sync run on Windows: `git checkout -- ios/App/CapApp-SPM/Package.swift`, or verify the file
  before committing.

## Testing
- Debug API: `window.__echo` (web dev only; gated off when `window.Capacitor` exists). Key calls:
  `startLevel(n)`, `startAbyss()`, `stats()`, `tapWorld(x,y)`, `teleport(t)`, `godMode()`,
  `winLevel()`, `grantAllStars()`, `resetSave()`, `audioState()`, `renderNow()`, `canvasShot()`.
- **Before shipping level content, run `__echo.verifyAll()`.** Per depth it reports placement
  (every authored entity actually inside the cave), reachability (`autoplay` in god mode), and
  whether a bot that dodges thorns and lures survives. `__echo.autoplay(id)` does one depth and
  returns time/songs/hearts; par times are ~9× a clean god-mode run.
- Headless pattern: drive `__echo.game.update(1/60)` in a synchronous JS loop — ignores rAF
  throttling (a hidden preview pane runs at 1–4fps). `renderNow()` + `canvasShot()` + POST to
  `/__dev/save` is how the store screenshots were captured.
- Verify real click routing with `document.elementFromPoint()`, not synthetic events dispatched
  straight at the canvas — a full-screen HUD overlay once swallowed every real tap and synthetic
  tests missed it.

## Layout
- Tuning constants: `www/js/config.js` (TUNING / PALETTE / CHAIN_TIERS). Level content and the
  `CHAPTERS` table: `www/js/levels.js`. A chapter's star gate computes itself from the previous
  chapter's length (~60%); its `mode` names a scale in `audio.js` `MODES`.
- Adding a hazard is four edits: an array in `entities.js` `setupEntities`, a block in
  `Game.update`, a block in `drawGame`, and a synthesized sound. Follow lures/crystals.
- Audio is 100% synthesized WebAudio (`audio.js`) — no audio files anywhere.
- Game services: `www/js/gameservices.js` drives a hand-written native bridge named `GameConnect`
  (`ios/App/App/GameConnectPlugin.swift`, `android/.../GameConnectPlugin.java`). Degrades to
  local-only when no bridge is present.
- Icon/splash source art: `/__dev/gen` page → `assets-out/`; fan out with `npx capacitor-assets generate`.
- Store docs in `store/`; build/publish runbooks in `docs/`; next-iteration design in `docs/plan-v1.1.html`.

## The gate economy (v1.2)
- Every 7th depth is a gate, every 14th a boss (`gateKind` in `levels.js`). The motes banked
  across the seven depths behind it set a `boon` passed into `Game.startStory`.
- **Every gate must stay winnable at zero motes.** The bank buys margin, never permission.
  Check with `__echo.autoplay(id, {})` against an empty save before shipping any gate change.
- **The bank is never consumed.** It is the sum of `bestMotes` per depth (already saved on
  deaths as well as wins), so replaying raises it and a failed gate costs nothing.
- The gate screen states a fact and offers a door back. No shop, no purchase, nothing that
  could read as a paywall — there is no way to buy light.
- Two stars per level, not three (`STARS_PER_LEVEL`, mirrored in `game.js` and `levels.js` —
  keep them in step or every chapter gate silently moves). Motes get a light bar instead.
- `www/js/ads.js` is dormant by design: fill `AD_IDS` / `IAP_PRODUCT_ID` to enable. Turning
  ads on also means a privacy-manifest and store data-safety update, and the iOS ATT prompt.

## Guidance and HUD layout
- **One transient slot.** Hints, boss cards and first-encounter teaches all queue through
  `ui.hint()` into a single element, so two messages can never sit on top of each other.
  Anything new that needs to *say* something goes through that queue, not a new overlay.
  (The boon chip was added as a floating element and immediately covered the hint.)
- **Persistent status is iconic, never prose.** `.hud-objectives` holds motes, the song
  budget, and the active boon as icon+number chips. The old goals banner was a sentence in
  the middle of the screen that told you nothing at a glance.
- **`teach.js` teaches on first encounter, once ever.** A concept fires only when its
  subject is actually on screen (`Teacher.update` checks `inView`), never on a timer and
  never before the player can see the thing. The seen set persists in `save.data.teachSeen`.
  Add a new mechanic → add a `TEACH` entry and a `SOURCES` row, or it goes unexplained.
- Vertical order, top to bottom: top bar → objectives → level toast → boss card → teach/hint.
  If you add an overlay, measure it against all of these at 320×568 before shipping.

## Bosses
- **Boss-ness is declared by the level, not by arithmetic.** A def with a `boss: { name,
  tell }` block is a boss; `gateKind` reads it. It used to be `id % 14 === 0`, which drifted
  out of step with the content — depth 14 announced a boss and contained an ordinary
  corridor, and the finale at 50 was not a gate at all. `verifyAll` now fails a level that
  declares a boss without a boss creature, so the two cannot separate again.
- Four bosses, four different creatures and four different counters: **The Listener** (14,
  an anchored `warden` that strikes where you last *sang*, so you win by misdirection),
  **The Twins** (28, crossing orbits, won by timing), **The Deaf God** (42, leviathans with
  `deaf: true` that ignore song entirely and wake only on breaking ice), and **The Warm
  Dark** (50). Reusing the leviathan a fourth time is what made bosses feel samey.
- Every boss needs an arena (a widened corridor segment), a `checkpoint` at its mouth, and
  **nothing hostile after it** — a stray hunter past the arena dilutes the fight and was
  killing five runs in twelve on depth 14.
- The autoplay bot sings exactly where it swims, which is the one thing a warden punishes,
  so **its survival rate says nothing about warden difficulty**. Tune that boss for humans.

## Verifying level content (learned the hard way)
- **`autoplay` is not deterministic.** Hunter wander uses `Math.random()`, so a single
  `verifyAll()` pass proves nothing for a marginal level. Run 9–11 trials and look at the
  *pass rate*. Shipped chapters 1–2 sit at 100%; treat anything under ~90% as a real problem.
- **A warm vent pins you to the centre line at speed.** In any level with `warmVents`, urchins
  and ice must hug the wall (|off| ≥ ~0.7 × half-width) or they are simply undodgeable — depth
  44 failed 0/7 until its last urchin moved outward, and 7/7 after.
- **Lures hug the wall too**, at |off| ≈ half-width: `lureBaitRadius` is 50, so a centred lure
  in a 90-wide corridor walls the seam completely.
- Never use more than 2 hunters in a corridor under ~110 wide. Three is beyond anything
  shipped and reads as unfair.

## Constraints worth remembering
- Future level content must **sawtooth** in difficulty per chapter (~60% of the previous peak,
  asymptotic ceiling), measured from **non-gate levels only** — gates are designed spikes and
  using them as the baseline opens the next chapter at boss difficulty. All four chapters
  (depths 1–50) are built: shallows, trench, hush, warm dark.
- A lure's real footprint is `lureBaitRadius` (the distance at which it springs), not its hit
  radius. Keep it well under the corridor half-width or it walls the passage off.
- Monetization plan is ads + level packs. **No gems, no currency, no energy timers.**
