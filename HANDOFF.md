# Echolume — handoff state

Written Aug 9, 2026, at the end of a long Windows session. Everything below is
current as of the commit that added this file. Read this first, then `SHIP.md`
for the ordered checklist.

**The short version:** the game is finished and verified. The web build is done,
both native projects are scaffolded and wired, and a hand-written Game Center /
Play Games bridge is in place. What remains is everything that needs a Mac, an
Android Studio toolchain, or a store console — none of which existed on the
machine this was built on.

---

## Where the code actually stands

### Done and verified
- **The game.** `www/` is the whole thing: vanilla JS ES modules, no build step.
  14 hand-authored levels plus an endless Abyss. All 14 verified solvable by an
  autoplay harness, zero console errors, ~0.7ms/frame at store resolution.
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
- **`ios/App/App/GameConnectPlugin.swift`** (GameKit). Never compiled; there is no
  macOS here. It was written against the Capacitor 8 sources in
  `node_modules/@capacitor/ios` and matches the framework's own reference plugins
  (`Console.swift`) exactly: `@objc(...)`, `CAPPlugin, CAPBridgedPlugin`,
  `public let identifier / jsName / pluginMethods`. Deployment target is iOS 15,
  so every GameKit API used (all iOS 14+) is available. **It is already registered
  in `App.xcodeproj`** — file reference, App group, and Sources build phase were
  added programmatically and the project file was validated, so no Xcode file
  wrangling is needed.
- **Full `assembleDebug` never completed.** The only JDK on the Windows box was
  PyCharm's bundled JBR, which ships without `jlink`/`jmods` — required by the
  compileSdk-36 JDK-image transform. That is a local toolchain gap, not a project
  one. Android Studio's bundled JBR has `jlink`, so the build should just work
  on a normal setup.
- **Never run on a real device**, either platform.

---

## What's left, in order

### 1. iOS (needs this Mac)
```bash
git clone https://github.com/lohiaguitar91/Echolume.git
cd Echolume && npm install && npx cap sync ios && npx cap open ios
```
1. Signing & Capabilities → set your Team. Bundle id is `com.kaush.echolume`.
2. Same panel → **+ Capability → Game Center**. This can't be pre-set in the repo
   because it needs your signing team; one click writes the entitlement.
3. Build. This is the first-ever compile of `GameConnectPlugin.swift` — fix
   whatever it complains about.
4. Run on a real iPhone and check: audio unlocks on the first tap, haptics fire,
   60fps, safe-area insets on a notched phone, portrait lock holds.
5. Product → Archive → App Store Connect.

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
- **The debug API is web-only.** `window.__echo` is installed only when
  `window.Capacitor` is absent, so it never ships in a native build.
- **How to test headlessly.** Drive `__echo.game.update(1/60)` in a synchronous
  JS loop — this bypasses rAF throttling entirely, which matters because a hidden
  browser pane throttles to 1–4fps. `__echo.renderNow()` forces a frame and
  `__echo.canvasShot()` returns a PNG data URL. That's how every screenshot in
  `store/` was produced without the pane ever compositing.
- **Regenerating art:** run the dev server (`npm run dev`) and open
  `http://localhost:3852/__dev/gen`. It draws the icon, splash, and feature
  graphic in code and POSTs them to `assets-out/`. Then
  `npx capacitor-assets generate --ios` / `--android`.
- **Versions are 1.0.0 everywhere** (`config.js` GAME_VERSION, `package.json`,
  `sw.js` VERSION, `build.gradle` versionName), `versionCode 1`. The "v1.1" in
  `docs/plan-v1.1.html` is an internal milestone name, not a store version.
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
