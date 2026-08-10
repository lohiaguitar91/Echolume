# Echolume — ship checklist

Everything automatable is done and committed. These are the remaining human steps, in order.
Details for each live in docs/BUILDING.md and docs/PUBLISHING.md.

## 0. Repo
- [ ] Grant push access (add `dishakoul94` as collaborator on lohiaguitar91/Echolume,
      or `git credential-manager github login` as lohiaguitar91), then `git push -u origin main`.

## 1. Accounts (one-time)
- [ ] Google Play Console account ($25 once)
- [ ] Apple Developer Program ($99/yr)
- [ ] Host `store/privacy-policy.md` somewhere public (GitHub Pages of this repo works); save the URL.

## 2. Android build (any machine with Android Studio)
- [ ] Install Android Studio, open `android/` (`npx cap open android`), let Gradle sync.
- [ ] Run on a real device once; check: audio unlocks on first tap, haptics fire, 60fps feel,
      safe-area insets on a notched phone, portrait lock.
- [ ] Build → Generate Signed App Bundle; create keystore, BACK IT UP.
- [ ] Play Console: internal testing → upload .aab → test → promote to production.
- [ ] Store listing from `store/listing-android.md`; data safety = no collection;
      icon `assets-out/pwa/icon-512.png` (regenerate via `/__dev/gen` if missing);
      feature graphic `store/feature-graphic.png`; screenshots `store/screenshots/`.

## 3. iOS build (Mac with current Xcode)
- [ ] Clone repo, `npm install`, `npx cap sync ios`, `npx cap open ios`.
- [ ] Set signing Team; bundle id `com.kaush.echolume`.
- [ ] Run on a real iPhone once (same spot-checks as Android).
- [ ] Product → Archive → upload to App Store Connect.
- [ ] Listing from `store/listing-ios.md`; App Privacy = Data Not Collected;
      paste the review notes from that file into App Review Information.

## 3.5 Game services — Game Center & Play Games

The native bridge is **written and in the repo** (no third-party plugin: the only one
available is stuck on Capacitor 5). Both platforms expose the same JS API as
`Capacitor.Plugins.GameConnect`, and `www/js/gameservices.js` already drives it:
sign-in on Abyss entry, milestone unlocks as you cross them, depth submitted on each
death, a Leaderboard button on the recap, and a replay of anything earned offline once
sign-in completes. With no bridge present it silently stays local-only.

Files: `ios/App/App/GameConnectPlugin.swift` (GameKit) ·
`android/app/src/main/java/com/kaush/echolume/GameConnectPlugin.java` (Play Games v2,
registered in `MainActivity.java`, dependency in `app/build.gradle`).

**These native files have not been compiled** — no Xcode or Android SDK on the build
machine. Expect to fix small things on first build.

### iOS
- [x] `GameConnectPlugin.swift` is already registered in `App.xcodeproj` (file reference,
      App group, and Sources build phase) — it compiles without any Xcode file wrangling.
- [ ] Enable the **Game Center** capability on the App target
      (Signing & Capabilities → + → Game Center). This needs your signing team, so it
      can't be pre-set in the repo; it's one click and writes the entitlement for you.
- [ ] App Store Connect → your app → Game Center: create a leaderboard with ID
      `abyss_depth` (integer, higher is better, "Best score" aggregation) and 15
      achievements with EXACTLY these IDs (1 point each is fine):

      abyss_1000  abyss_2000  abyss_3000  abyss_4000   abyss_5000
      abyss_10000 abyss_20000 abyss_30000 abyss_40000  abyss_50000
      abyss_60000 abyss_70000 abyss_80000 abyss_90000  abyss_100000

- [ ] Suggested display names: "First Thousand", "Two Thousand Metres", … ,
      "The Hundred-Kilometre Song".

### Android
- [ ] Play Console → Play Games Services → Setup: create the games project, link the app,
      add your signing certificate (both upload and release certs).
- [ ] Copy the numeric **project ID** into `game_services_project_id` in
      `android/app/src/main/res/values/strings.xml`, replacing the `REPLACE_WITH_...`
      placeholder. Until you do, the plugin stays dormant by design rather than crashing.
- [ ] Create the same leaderboard + 15 achievements. Play generates opaque IDs
      (`CgkI...`), so map them in `www/js/gameservices.js`:
      fill `PLAY_IDS` as `{ 'abyss_1000': 'CgkI…', … }` and set `PLAY_LEADERBOARD_ID`.
      Then `npx cap sync`.
- [ ] Add testers in Play Games Services → Testers, or sign-in fails before publishing.

## 4. Final sanity before each submit
- [ ] Version stamps agree: `www/js/config.js` GAME_VERSION, `package.json`,
      `www/sw.js` VERSION, `android/app/build.gradle` versionName, Xcode target version.
      All are 1.0.0 — this is the first store release. ("v1.1" in `docs/plan-v1.1.html`
      is the internal milestone name for the feature set inside it, not a store version.)
- [ ] Name check: "Echolume" still free on both stores.
- [ ] Privacy policy URL is live and linked in both listings.

## 5. After launch
- [ ] Reply to first reviews quickly.
- [ ] Keep the privacy policy URL alive.
- [ ] For updates: bump all five version stamps, `npx cap sync`, rebuild, never reuse a build number.
