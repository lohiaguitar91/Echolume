# Echolume — project facts

**Picking this up on a new machine? Read `HANDOFF.md` first** — it covers what's
done, what's never been compiled, and the exact remaining steps for iOS, Android,
and the two game-service consoles. `SHIP.md` is the ordered checklist.

- Run: `npm run dev` → port 3852 (config also in parent code-projects/.claude/launch.json as "echolume").
- Pure vanilla JS in `www/`, no build step. Capacitor 8 wraps it (`android/`, `ios/`).
- After editing `www/` or capacitor.config.json: `npx cap sync` to update native projects.

## Testing
- Debug API: `window.__echo` (web dev only; gated off when `window.Capacitor` exists). Key calls:
  `startLevel(n)`, `startAbyss()`, `stats()`, `tapWorld(x,y)`, `teleport(t)`, `godMode()`,
  `winLevel()`, `grantAllStars()`, `resetSave()`, `audioState()`, `renderNow()`, `canvasShot()`.
- Headless pattern: drive `__echo.game.update(1/60)` in a synchronous JS loop — ignores rAF
  throttling (a hidden preview pane runs at 1–4fps). `renderNow()` + `canvasShot()` + POST to
  `/__dev/save` is how the store screenshots were captured.
- Verify real click routing with `document.elementFromPoint()`, not synthetic events dispatched
  straight at the canvas — a full-screen HUD overlay once swallowed every real tap and synthetic
  tests missed it.

## Layout
- Tuning constants: `www/js/config.js` (TUNING / PALETTE / CHAIN_TIERS). Level content: `www/js/levels.js`.
- Audio is 100% synthesized WebAudio (`audio.js`) — no audio files anywhere.
- Game services: `www/js/gameservices.js` drives a hand-written native bridge named `GameConnect`
  (`ios/App/App/GameConnectPlugin.swift`, `android/.../GameConnectPlugin.java`). Degrades to
  local-only when no bridge is present.
- Icon/splash source art: `/__dev/gen` page → `assets-out/`; fan out with `npx capacitor-assets generate`.
- Store docs in `store/`; build/publish runbooks in `docs/`; next-iteration design in `docs/plan-v1.1.html`.

## Constraints worth remembering
- Future level content must **sawtooth** in difficulty per chapter (~60% of the previous peak,
  asymptotic ceiling). Linear scaling makes deep levels unplayable.
- Monetization plan is ads + level packs. **No gems, no currency, no energy timers.**
