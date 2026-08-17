# Echolume — project facts

**Picking this up on a new machine? Read `HANDOFF.md` first** — it covers what's
done, what's never been compiled, and the exact remaining steps for iOS, Android,
and the two game-service consoles. `SHIP.md` is the ordered checklist.

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

## Constraints worth remembering
- Future level content must **sawtooth** in difficulty per chapter (~60% of the previous peak,
  asymptotic ceiling). Linear scaling makes deep levels unplayable. Chapters 1–2 (depths 1–28)
  are built; 3–4 (29–50) are hush zones, brittle ice, then warm vents.
- A lure's real footprint is `lureBaitRadius` (the distance at which it springs), not its hit
  radius. Keep it well under the corridor half-width or it walls the passage off.
- Monetization plan is ads + level packs. **No gems, no currency, no energy timers.**
