# Android — the whole job, for the day you decide to do it

**Status: Android has never been compiled. Not once, on any machine.** Everything
below is written so that day starts from a known point instead of an archaeology
session. Release order (decided Aug 31 2026) is iOS first, Android a fast follow —
this file is the fast follow.

The single most valuable thing you can do *before* that day is **step 1**. It costs
an hour and retires the only unknown that can make a "fast" follow slow.

---

## 1. Prove it compiles (do this early, during the iOS beta)

```bash
npx cap sync android
npx cap open android
```

Then in Android Studio: let Gradle sync, `Build → Make Project`, then
`assembleDebug` on an emulator. You do not need a device, ids, or a console
account for this step. You are only asking "does it build."

**Toolchain trap, already hit once.** The Gradle build needs a JDK that ships
`jlink` — the compileSdk-36 JDK-image transform uses it. PyCharm's bundled JBR
does **not** have it and the assemble dies there; Android Studio's bundled JBR
does. If you see a `jlink`/JDK-image error, it is the JDK, not the project.
Check with `File → Settings → Build Tools → Gradle → Gradle JDK`.

**What is already known-good, so don't re-derive it:**
- Resource linking passes (it caught a real adaptive-icon bug already).
- `GameConnectPlugin.java` type-checks against the **real** Play Games Services
  22.0.0 API — javac, JDK 21, `android-36`, real `classes.jar`s from the resolved
  AARs. Every call, generic and lambda checks out, and
  `registerPlugin(Class<? extends Plugin>)` matches `BridgeActivity`.
- The AdMob plugin is wired into Gradle already
  (`android/capacitor.settings.gradle`, `android/app/capacitor.build.gradle`).

**What has never run:** all of it, at runtime. Type-checking is not execution.

---

## 2. Run it on a real Android phone once

Same spot-checks as iOS:
- audio unlocks on the **first** tap (WebAudio is 100% synthesized — no files),
- haptics fire,
- 60fps feel, not just 60fps in a counter,
- safe-area insets on a notched phone,
- portrait lock holds.

Then the Android-specific ones that iOS cannot tell you:
- **Back button.** Hardware/gesture back from a level, from the gate screen, from
  Abyss. Nothing in `www/` handles it today.
- **App backgrounding mid-level** — audio context suspend/resume.
- Cheap-phone frame rate. The renderer leans on `lighter` composite everywhere.

---

## 3. Fill in the three placeholders

Each one is deliberately a placeholder, not a guess, and each is dormant-safe
until you replace it. Do not "temporarily" fill any of them with something
plausible — that is how the Windows session lost a day.

### 3a. Play Games project id
`android/app/src/main/res/values/strings.xml`:

```xml
<string name="game_services_project_id">REPLACE_WITH_PLAY_GAMES_PROJECT_ID</string>
```

The numeric project ID from Play Console → Play Games Services → Configuration.
While it says `REPLACE_...` the plugin stays dormant instead of crashing.

### 3b. Play Games opaque ids
Game Center takes the string ids verbatim. **Play Console does not** — it
generates opaque `CgkI…` ids. So `www/js/gameservices.js` has a translation table
that is currently empty:

```js
const PLAY_IDS = {};              // { 'abyss_1000': 'CgkI…', … } — all 15
const PLAY_LEADERBOARD_ID = null; // the leaderboard's CgkI… id
```

Fill both, then `npx cap sync`. Until you do, Android falls back to sending the
string id, which the server treats as unknown — a silent no-op, not a crash.

The 15 achievement ids, in order (`MILESTONES` in that file, meters):
`abyss_1000 2000 3000 4000 5000 10000 20000 30000 40000 50000 60000 70000 80000
90000 100000`, plus the leaderboard `abyss_depth`.

### 3c. AdMob Android app id
`android/app/src/main/AndroidManifest.xml` currently carries **Google's published
sample app id** (`ca-app-pub-3940256099942544~3347511713`). It is there because
the SDK throws at launch if the value is absent *or malformed*, so a fake
placeholder would have crashed every build. Replace with the real id from
AdMob → Apps → Echolume (Android) → App settings.

Then match it in `www/js/ads.js` → `AD_IDS.android` (appId, interstitial,
rewarded), which is also still sample values.

> **Trap worth knowing now.** `ADS_ARE_SAMPLE = false` in `ads.js` is a comment-
> level claim about the *iOS* ids ("iOS ids above are real units"). The Android
> block under it is still samples. Today `FORCE_TEST_ADS = true` masks this for
> everyone. On the day you flip `FORCE_TEST_ADS` to false for a store build, if
> the Android ids are still samples Android will quietly serve test creatives and
> earn **nothing** — no error, no crash, no signal. Replace 3c before that flip.

Android AdMob ids can be created **before** the app is published, so this is not
blocked on shipping.

---

## 4. Play Console work

- Google Play Console account ($25, one-time) if not already done.
- Play Games Services → Setup: create the games project, link the app, add your
  signing certificate — **both the upload cert and the release cert**. Missing the
  release cert is the classic reason sign-in works in internal testing and dies in
  production.
- Create the leaderboard + 15 achievements (same names/semantics as Game Center;
  see §3b for the id mapping that follows).
- Play Games Services → Testers: add yourself, or sign-in fails before publishing.
- Data Safety = **Yes, collects**. Ads ship at launch. The exact per-type answers
  are already written out in `store/listing-android.md` — copy them, don't improvise.
- Listing copy: `store/listing-android.md`. Icon `assets-out/pwa/icon-512.png`
  (regenerate via `/__dev/gen` if missing). Feature graphic
  `store/feature-graphic.png`. Screenshots `store/screenshots/` — the six 1320×2868
  captures are current and were rendered by the actual game.

## 5. The purchase, done once for both stores

`remove_ads` uses the **same product id in both consoles**:
`com.wibesllc.echolume.remove_ads`.

**This is no longer configuration — Android needs code.** iOS was implemented as
`ios/App/App/StorePlugin.swift`, a StoreKit 2 plugin in the app target rather than
a cross-platform SDK, so there is no Android half to inherit. Android needs the
same shape against Play Billing: a `StorePlugin.java` exposing the same four
methods (`products`, `purchase`, `restore`, `isEntitled`) under the same `Store`
JS name, and `purchases.js` then works unchanged — `configured` is false on
Android today purely because no `Store` global exists there, so the surface stays
hidden rather than broken.

Budget it as real work, not a config line. The upside is that the JS layer, the
settings block, the pre-ad offer and every rule above them are already done and
verified; only the native adapter is missing.

## 6. Signing and release

- `Build → Generate Signed App Bundle`. Create the keystore.
  **BACK THE KEYSTORE UP.** Losing it means never updating this app again.
- Play Console: internal testing → upload `.aab` → test → promote to production.
- Publish the GDPR message in AdMob before public release.

---

## Order that minimizes wasted work

1. §1 compile (any time — do it during the iOS beta)
2. §2 on a real phone (finds the back-button and audio-resume gaps)
3. §4 console setup → gives you §3a and §3b
4. §3c AdMob ids
5. §5 purchase (reuses the iOS plugin work)
6. §6 sign and ship

Everything in §1 and §2 is free of accounts, ids and consoles. If you only ever
do two steps, do those two — they convert "never compiled" into "known quantity."
