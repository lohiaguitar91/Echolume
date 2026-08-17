# Echolume — handoff state

Written Aug 9, 2026, at the end of a long Windows session. Read this first, then
`SHIP.md` for the ordered checklist.

> **Picked up on macOS, Aug 9 2026.** Done since: the iOS project compiles
> (`GameConnectPlugin.swift` needed four one-character fixes — see below), the
> whole thing is synced to both native projects, and **chapter 2 · The Trench
> (depths 15–28) is built and verified**. Still open: everything needing
> Android Studio or a store console. Items below are marked **[done]** or
> **[still open]**.

> **Chapters 3-4 built on Windows, Aug 16 2026 — depths 29-50.** The Hush
> (29-42) introduces hush zones, water that swallows the song you sing inside
> it, and brittle ice, which costs no hearts but is the loudest mistake in the
> game. The Warm Dark (43-50) introduces warm vents: rising water that carries
> you where a song would have, and glows enough to see by, for free. Gates land
> at 35, 42 and 49 on the existing cadence. **All 50 depths verified**, and two
> design rules came out of it that are written into `CLAUDE.md`: `autoplay` is
> non-deterministic so pass *rates* are the only meaningful measure, and a warm
> vent pins you to the centre line so hazards in vent levels must hug the wall.

> **v1.2 built on Windows, Aug 16 2026 — the gate economy.** Motes became
> *stored light*. Every 7th depth is a gate and every 14th a boss; the motes
> banked across the seven depths behind it decide how much margin you carry in.
> Two rules are load-bearing and must survive any future change:
> **every gate stays winnable at zero motes** (verified by the bot with an empty
> save), and **the bank is never consumed** — it is the sum of your *best* haul
> per depth, so replaying raises it and failing costs nothing.
> Stars went from three to two (motes stopped being graded; they have their own
> light bar), with a v1→v2 save migration that recomputes from stored
> `bestPings` rather than clamping. Also in: plain second lines on all 42 hints,
> a hint queue with a minimum display time, motes no longer borrowing the vent's
> colour, redrawn tutorial glyphs, settings sub-lines, and a one-time Abyss idle
> nudge. **Ads and IAP are deliberately absent** — see `www/js/ads.js`, which is
> dormant until the IDs exist.

**The short version:** the game is finished and verified. The web build is done,
both native projects are scaffolded and wired, and a hand-written Game Center /
Play Games bridge is in place. What remains is everything that needs a Mac, an
Android Studio toolchain, or a store console — none of which existed on the
machine this was built on.

---

## Where the code actually stands

### Done and verified
- **The game.** `www/` is the whole thing: vanilla JS ES modules, no build step.
  **28** hand-authored levels in two chapters, plus an endless Abyss. All 28
  verified by the autoplay harness, zero console errors, ~0.7ms/frame at store
  resolution.
- **Chapter 2 · The Trench (15–28)**, built to `docs/plan-v1.1.html` §3. New
  vocabulary is **lures** (false motes wearing the field's own amber; a song
  shows the tether behind the light, and taking the bait is the loudest sound in
  the level) and **bloom crystals** (a song that touches one is answered by a
  free, silent bloom from where it stands — reach without spending a song, and
  without waking anything). **Leviathan** bosses close both halves at 21 and 28,
  patrolling readable orbits and checkpointing at the lair mouth. **Heart motes**
  (one per depth, off the safe line) are the only healing, and only take if you
  need them. Difficulty sawtooths: 15 opens at roughly depth 8's level and climbs
  back past depth 13 by 27. Chapter 2 opens at 26 of the shallows' 42 stars
  (~60%), never on clearing every depth. The trench also sings in its own mode —
  a flatter scale, so you hear the chapter before you read it.
- **v1.1 feature set** (all shipped, all verified in-browser):
  cold open (a fresh install fades straight into Depth 1 — no menus), Abyss death
  recap with record/near-miss + milestone progress, mote chain colour ladder
  (amber → gold → mint → cyan → violet; ×8 fires a silent bloom reveal), trench
  medals (par times), Continue chip + title micro-goal, deaths bank your mote
  haul, visual-threat toggle for deaf players, melodic pentatonic pings keyed per
  level, Abyss unlocks at depth 7.
- **Android resource linking passes.** `:app:processDebugResources` → BUILD
  SUCCESSFUL. This caught and fixed a real bug: the generated adaptive-icon XML
  referenced `@mipmap/ic_launcher_background`, which does not exist, and would
  have failed every Android build. Both launcher variants now use
  `@color/ic_launcher_background` (brand black `#030711`).
- **The Android game-services plugin compiles.** Verified with javac (JDK 21,
  `android-36`) against the real `classes.jar` from Play Games Services 22.0.0 —
  every call, generic and lambda type-checks.
- **Store package.** Listings for both stores, privacy policy, icon/splash sets
  (56 Android assets + full iOS set), Play feature graphic, six 1320×2868
  screenshots rendered by the actual game. All in `store/`.

### Written but NOT compiled — expect to fix small things
- **[done] `ios/App/App/GameConnectPlugin.swift`** (GameKit) now compiles. The
  prediction was right: four errors, all the same one — `@objc public funcsignIn`,
  the space between `func` and the method name lost somewhere on the way out of
  the Windows session (same class of damage as the backslashes in `Package.swift`).
  With those fixed the file builds clean, no warnings. Verified with
  `xcodebuild -project ios/App/App.xcodeproj -scheme App -sdk iphonesimulator
  -configuration Debug CODE_SIGNING_ALLOWED=NO build` → **BUILD SUCCEEDED**.
  Its registration in `App.xcodeproj` was correct as written.
- **[still open] Full `assembleDebug` never completed.** No JDK on this Mac
  either (`/usr/libexec/java_home` finds nothing), so Android is untouched here.
  Android Studio's bundled JBR has `jlink`, so the build should just work there.
- **[done] It has run on a real device.** Disha built and installed it through
  TestFlight, so the whole class of hardware-only unknowns — audio unlock on
  first touch, haptics, safe-area insets, sustained frame rate — is no longer
  hypothetical. What a TestFlight install does *not* prove is Game Center
  authenticating against a real Apple ID, which still needs the capability
  enabled (see below), or anything on the Android side.

---

## What's left, in order

### 1. iOS (needs this Mac)
```bash
npm install && npx cap sync ios && npx cap open ios
```
1. **[done]** Signing team is Wibes LLC (`RV5N43T74L`); bundle id is
   `com.wibesllc.echolume`.
2. **[still open]** Signing & Capabilities → **+ Capability → Game Center**.
   Still the one manual step: the entitlement is only half of it — the App ID in
   the developer portal needs the capability enabled too, which is what the Xcode
   click actually does. Pre-committing an `.entitlements` file without that would
   break device signing, so it was deliberately left alone.
3. **[done]** It compiles — see above.
4. **[done]** Runs on a real iPhone via TestFlight. (Per memory, `cap run`'s
   deploy step fails here; use `xcrun devicectl device install app` /
   `... process launch` for a direct install.)
5. **[still open]** Product → Archive → App Store Connect.

### 2. Android (needs Android Studio)
1. `npx cap open android`, let Gradle sync, then `assembleDebug` — resource
   linking is already known-good, so this should complete.
2. Real-device pass, same checks as iOS.
3. Build → Generate Signed App Bundle. **Create the keystore and back it up** —
   losing it means losing the app identity forever.

### 3. Game Center (App Store Connect)
Create one leaderboard and 15 achievements. The IDs are not cosmetic — the code
emits these exact strings from `www/js/gameservices.js`:

- Leaderboard: **`abyss_depth`** — integer, higher is better, "Best score".
- Achievements (1 point each is fine):
  ```
  abyss_1000   abyss_2000   abyss_3000   abyss_4000   abyss_5000
  abyss_10000  abyss_20000  abyss_30000  abyss_40000  abyss_50000
  abyss_60000  abyss_70000  abyss_80000  abyss_90000  abyss_100000
  ```
Suggested names: "First Thousand", "Two Thousand Metres", … , "The
Hundred-Kilometre Song".

### 4. Play Games Services (Play Console)
1. Play Games Services → Setup: create the games project, link the app, add both
   the upload and release signing certificates.
2. Copy the numeric project ID into `game_services_project_id` in
   `android/app/src/main/res/values/strings.xml`, replacing
   `REPLACE_WITH_PLAY_GAMES_PROJECT_ID`. **Until you do, the plugin stays dormant
   on purpose** rather than crashing at startup — that guard is in
   `GameConnectPlugin.load()`.
3. Create the same leaderboard + 15 achievements. Play generates opaque IDs
   (`CgkI...`), so map them in `www/js/gameservices.js`: fill `PLAY_IDS` as
   `{ 'abyss_1000': 'CgkI…', … }` and set `PLAY_LEADERBOARD_ID`. Then
   `npx cap sync`.
4. Add yourself under Play Games Services → Testers, or sign-in fails pre-publish.

---

## Things that will bite you if you don't know them

- **`npx cap sync` after every `www/` change.** The native projects hold copies.
- **A sync run on Windows corrupts `ios/App/CapApp-SPM/Package.swift`**, rewriting
  the two plugin paths with backslashes. Swift needs forward slashes, and the
  iOS build fails without them. This is the same damage the macOS session fixed
  in `e4a3d24`, and it comes back on every Windows sync. Follow any sync on
  Windows with `git checkout -- ios/App/CapApp-SPM/Package.swift`.
- **The debug API is web-only.** `window.__echo` is installed only when
  `window.Capacitor` is absent, so it never ships in a native build.
- **How to test headlessly.** Drive `__echo.game.update(1/60)` in a synchronous
  JS loop — this bypasses rAF throttling entirely, which matters because a hidden
  browser pane throttles to 1–4fps. `__echo.renderNow()` forces a frame and
  `__echo.canvasShot()` returns a PNG data URL. That's how every screenshot in
  `store/` was produced without the pane ever compositing.
- **The autoplay harness now lives in the repo** (`debug.js`), so it doesn't have
  to be rebuilt from session notes each time. `__echo.verifyAll()` runs every
  level and returns, per depth: whether every authored entity actually sits
  inside the cave (`placementCheck` — an offset one number too large is invisible
  until someone plays it), whether the vent is reachable at all (`autoplay` with
  `god: true`), and whether a bot that steers around thorns and lures survives.
  `__echo.autoplay(id)` alone gives times, songs and hearts for one depth; par
  times are set at roughly 9× a clean god-mode run, which is what chapter 1's
  pars already worked out to.
- **A lure's footprint is its bait radius, not its hit radius.** `lureBaitRadius`
  (50) is the distance at which it springs, so it has to stay well under a
  corridor's half-width or it walls the passage off completely. This bit once
  already, at 62 in the 76-wide deep corridors.
- **Regenerating art:** run the dev server (`npm run dev`) and open
  `http://localhost:3852/__dev/gen`. It draws the icon, splash, and feature
  graphic in code and POSTs them to `assets-out/`. Then
  `npx capacitor-assets generate --ios` / `--android`.
- **Versions are 1.1.0 everywhere**, bumped for chapter 2: `config.js`
  GAME_VERSION, `package.json`, `build.gradle` versionName, `sw.js` cache key,
  and iOS `MARKETING_VERSION`. Android `versionCode` is 2, iOS
  `CURRENT_PROJECT_VERSION` (build number) is 3. Bump the build number on every
  upload — App Store Connect rejects a repeat of one it has already seen for a
  given version string. `docs/plan-v1.1.html` is an internal milestone name that
  now happens to match the store version; they are still unrelated.
- **Game services degrade silently.** With no native bridge present, milestones
  still bank locally, the Leaderboard button hides itself, and nothing throws.
  Both paths were tested.

---

## What comes after launch

`docs/plan-v1.1.html` is a full illustrated design plan for the next iteration,
agreed over several rounds. The load-bearing decisions:

- **No gems, no currency.** Monetization is AdMob interstitials (**after wins
  only, never after a death**) + rewarded revive + a Remove Ads IAP + 50-level
  packs. Ads land in v1.2, *after* a clean first release earns a rating.
- **Difficulty must sawtooth.** Each new chapter opens at ~60% of the previous
  chapter's peak with an asymptotic ceiling. Linear scaling makes depth 97
  literally unplayable; this is the core structural constraint on all future
  content.
- Chapters of 10–14 levels, each introducing one or two new "listeners" (lures,
  bloom crystals, hush zones, warm vents, brittle ice) with mid- and end-chapter
  leviathan bosses. Free content ends at depth 50.

Chapter 2 is now built, which leaves **chapters 3–4 (depths 29–50)**: hush zones
and brittle ice, then warm vents. The scaffolding they need already exists —
add a `CHAPTERS` entry in `levels.js` (the star gate computes itself from the
previous chapter's length), give it a scale in `audio.js` `MODES`, and author
the defs. A new hazard is four small edits: an array in `setupEntities`, a block
in `Game.update`, a block in `drawGame`, and a synthesized sound. Follow the
lure/crystal pattern; `__echo.verifyAll()` will tell you if the placements are
wrong before a human ever plays them.
