# Echolume

*Move by sound. See by light.*

A one-thumb atmosphere game: you are a small blind creature of the deep who moves by
singing — every tap pushes you through the water, lights the cave for a moment, and
makes noise the deep can hear. 28 handcrafted depths across two chapters + an endless Abyss.

Built as a deliberate answer to where AI-built mobile games usually fall short:
real sound design (fully synthesized, zero audio files), real game-feel (glow, particles,
haptics, screen-shake, combo melodies), a complete loop (tutorial → levels → stars →
finale → endless mode), tuned difficulty, and store-compliance from day one
(offline, no data collection, no placeholder anything).

## Run it

```
npm run dev
```
→ http://localhost:3852 (portrait phone viewport recommended)

## Project layout

- `www/` — the entire game (vanilla JS modules, no build step)
- `server.js` — dev static server (port 3852) with dev-only asset endpoints
- `android/`, `ios/` — complete Capacitor native projects (icons, splash, portrait lock)
- `assets/`, `assets-out/` — icon/splash source art (drawn in code)
- `store/` — privacy policy + hand-written store listings for both stores
- `docs/BUILDING.md` — web/Android/iOS build steps
- `docs/PUBLISHING.md` — submission runbook mapped to common rejection reasons

## Controls

Tap where you want to go. That's the whole interface — the song moves you, reveals
the world, and wakes the hunters. Escape/pause button pauses.

## Testing

With the dev server (not under Capacitor), `window.__echo` exposes a headless test API:
`__echo.startLevel(n)`, `__echo.stats()`, `__echo.tapWorld(x,y)`, `__echo.godMode()`,
`__echo.startAbyss()`, `__echo.grantAllStars()`, `__echo.resetSave()`.
`__echo.verifyAll()` runs the built-in autoplay harness over every level and reports
placement, reachability, and whether a bot that dodges the obvious survives. All 28
levels pass.
