# Echolume — project facts

- Run: `npm run dev` → port 3852 (config also in parent code-projects/.claude/launch.json as "echolume").
- Pure vanilla JS in `www/`, no build step. Capacitor 8 wraps it (`android/`, `ios/`).
- Debug API: `window.__echo` (web dev only; gated off under Capacitor). Key calls:
  `startLevel(n)`, `startAbyss()`, `stats()`, `tapWorld(x,y)`, `teleport(t)`, `godMode()`,
  `winLevel()`, `grantAllStars()`, `resetSave()`, `audioState()`.
- Headless testing pattern: drive `__echo.game.update(1/60)` in a JS loop — ignores rAF throttling.
- All tuning constants in `www/js/config.js` (TUNING/PALETTE). Level content in `www/js/levels.js`.
- Audio is 100% synthesized WebAudio (`audio.js`) — no audio files anywhere.
- After editing `www/` or capacitor.config.json: `npx cap sync` to update native projects.
- Icon/splash source art: `/__dev/gen` page → `assets-out/`; fan out with `npx capacitor-assets generate`.
- Store docs in `store/`; build/publish runbooks in `docs/`.
