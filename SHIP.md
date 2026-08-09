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

## 3.5 Game services (leaderboard + achievements)

The game already fires everything (see `www/js/gameservices.js`): milestone unlocks with
in-game toasts, depth submission on each Abyss death, sign-in attempt on Abyss entry.
It looks for a Capacitor plugin named `GameConnect` at runtime and stays local-only
without one. To go live:

- [ ] Native bridge: `@openforge/capacitor-game-connect` supports Capacitor 5 only
      (checked Aug 2026). Either update/fork it for Capacitor 8, or add a minimal custom
      plugin exposing `signIn()`, `unlockAchievement({achievementID})`,
      `submitScore({leaderboardID, totalScoreAmount})` under the name `GameConnect`.
- [ ] App Store Connect → Game Center: create leaderboard id `abyss_depth`
      (score = meters, higher is better) and 15 achievements with EXACTLY these ids:
      `abyss_1000` `abyss_2000` `abyss_3000` `abyss_4000` `abyss_5000`
      `abyss_10000` `abyss_20000` `abyss_30000` `abyss_40000` `abyss_50000`
      `abyss_60000` `abyss_70000` `abyss_80000` `abyss_90000` `abyss_100000`
- [ ] Play Console → Play Games Services: create the same leaderboard + 15 achievements;
      copy the generated ids into `PLAY_IDS` / `PLAY_LEADERBOARD_ID` in
      `www/js/gameservices.js`, then `npx cap sync`.
- [ ] Suggested display names: "First Thousand", "2,000 m" … "The Hundred-Kilometer Song".

## 4. Final sanity before each submit
- [ ] Version stamps agree: `www/js/config.js` GAME_VERSION, `package.json`,
      `www/sw.js` VERSION, `android/app/build.gradle` versionName, Xcode target version.
      All are 1.0.0 for this release.
- [ ] Name check: "Echolume" still free on both stores.
- [ ] Privacy policy URL is live and linked in both listings.

## 5. After launch
- [ ] Reply to first reviews quickly.
- [ ] Keep the privacy policy URL alive.
- [ ] For updates: bump all five version stamps, `npx cap sync`, rebuild, never reuse a build number.
