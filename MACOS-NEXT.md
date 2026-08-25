# For the Claude on Disha's MacBook — start here

You are picking up Echolume on macOS. A Claude session on the Windows box wrote
this for you. Read `CLAUDE.md` (project rules), then this file, then `SHIP.md`
for the full human checklist.

**The state in one line:** all 50 depths are built and verified, the gate
economy is in, the ad surface is written and wired but deliberately inert, and
everything still open needs Xcode, Android Studio, or a store console — which is
why it is waiting for you and not for the Windows box.

**The final Windows commit is `6bc70df`** ("Bosses perform casting; final
verified pass before the Mac", Aug 17 2026). Its message lists exactly what was
verified on that tree and what only thumbs can judge. If `git log` shows
anything after it that did not come from your own Mac session, read that first.

---

## Read this before you touch anything

Three things will waste your time if you learn them the hard way. The Windows
session learned all three the hard way.

1. **`npx cap sync` on Windows corrupts `ios/App/CapApp-SPM/Package.swift`**,
   rewriting the two plugin paths with backslashes. It has happened twice. On
   macOS it should be fine, but if the iOS build suddenly cannot resolve
   `CapacitorHaptics`, check that file first and run
   `git checkout -- ios/App/CapApp-SPM/Package.swift`.
2. **`__echo.autoplay()` is not deterministic** — hunter wander uses
   `Math.random()`. A single `verifyAll()` pass proves nothing about a marginal
   level. Run 9–11 trials and read the *pass rate*. The final Windows pass put
   every depth at 10/11 or better; depth 37 straddles (one round 24/25, another
   round a single-sample fail) and that is known and acceptable. Treat a *rate*
   under ~90% as a real problem, not one bad sample.
3. **Text has been damaged crossing machines before.** A previous handoff lost
   the space in `func signIn` (four times) and the backslashes in
   `Package.swift`. If native code written on Windows will not compile, suspect
   a dropped character before you suspect the logic.

---

## What is actually done

- **All 50 depths.** Four chapters: Shallows (1–14), Trench (15–28), Hush
  (29–42), Warm Dark (43–50). Verified: placement, reachability, and a
  dodging bot's survival rate (0.996 average over 9 trials × 50 depths).
- **The gate economy.** Every 7th depth is a gate, every 14th a boss. Motes
  banked across the seven depths behind it buy a passive boon. Two invariants,
  both tested, both load-bearing — do not break them:
  - every gate is winnable at **zero** motes (verified 5/5 on an empty save);
  - the bank is **never consumed** (sum of `bestMotes` per depth).
- **Two stars, not three.** Motes stopped being graded and got their own light
  bar. Save migrates v1→v2 by recomputing from stored `bestPings`.
- **Bosses perform their relationship to casting** (render-only, sim untouched):
  a listening warden turns its body toward your cast-aim landing and parts its
  plates (`_attend`/`_face`, fed by `main.js`, consumed by `draw.js` — the strike
  still uses `w.aim`, and a committed warden ignores the lure); the Twins' tell
  now says a thrown song can pull one wide; the Deaf God visibly swallows songs —
  the ring's arc facing it grays out and crumbles while the god does not react.
  Ash tones, not alert red, so it reads the same with the visual-threat toggle
  on or off.
- **Store screenshots are current.** Six new 1320×2868 captures in
  `store/screenshots/` (cold open with the verbs strip, mote chain, gate screen,
  Listener mid-telegraph, hush + ice, Warm Dark finale), rendered by the actual
  game with the DOM HUD composited in. Nothing left to capture for submission.
- **Two small HUD fixes from the final layout battery:** the depth toast now
  wraps instead of clipping on ≤430px-wide screens ("The Trench Mouth" was 398px
  wide at its tracking), and on short screens (≤640px tall) the verbs strip
  rides higher and smaller so a depth's opening hint cannot sit on top of it.
  Worth one glance on an SE-class phone.
- **The ad surface**, dormant. See below.
- iOS compiles (simulator, signing disabled) and has run on a real device via
  TestFlight. Android has **never been built at all**, on any machine.

## What is not done, and needs you

Ordered by what unblocks the most.

### 1. Android has never been compiled — do this first
It is the single biggest untested surface in the project. `npx cap open android`,
let Gradle sync, `assembleDebug`. Resource linking is known-good (it caught a
real adaptive-icon bug already), and `GameConnectPlugin.java` type-checks against
the real Play Games 22.0.0 API, but no full build has ever completed.

### 2. Look at the new screens on a device
The **gate screen** and the HUD have now been *seen* — the new store screenshots
composite them with computed styles, and collision boxes pass at 375×812 and
320×568 — but transitions and easing have still never advanced anywhere (the
Windows pane never composites, so every fade was forced to its resting state).
Watch the gate screen appear, the boss card fade, and the verbs strip dissolve
on first touch. Files: `#screen-gate` in `www/index.html`, styles under
`/* ---------- gate ---------- */` in `www/css/ui.css`.

### 3. Game Center capability — DONE on the Mac (Aug 20 2026)
The entitlement no longer needs an Xcode click: `App/App.entitlements` is in the
repo and wired into both build configs. More importantly, the Mac session found
and fixed a real registration hole: Capacitor 8 only auto-registers plugins named
in the synced config's `packageClassList`, which the CLI rebuilds from npm
packages on every sync — an app-target plugin never makes the list, so
`Capacitor.Plugins.GameConnect` was silently undefined. `EchoBridgeViewController`
(in `SceneDelegate.swift`) now registers it in `capacitorDidLoad()`. What remains
is console-side only: create the leaderboard and the 15 achievements exactly as
listed in `SHIP.md` §3.5 — the IDs are emitted verbatim by
`www/js/gameservices.js`, so a typo silently breaks unlocks.

### 4. Ads and the one purchase — IMPLEMENTED, running on SAMPLE ids
`www/js/ads.js` now drives `@capacitor-community/admob` 8.1.0 for real, against
Google's published sample ids (`ADS_ARE_SAMPLE = true`), so the whole surface is
testable on a device before the AdMob console work. Consent (UMP + ATT) and SDK
init run lazily on the first gate/boss depth — the cold open stays untouched.
**The placement rules are still enforced inside `ads.js`, not at the call
sites** — an interstitial is refused for a death or a non-gate win no matter who
asks. Keep it that way. The rewarded revive resumes the run **where you fell**
(`Game.revive()`) because the free retry already gives back the lair mouth — a
revive that only re-sold the checkpoint would be a scam.

Remaining: swap the six sample ids for real ones (see the ⚠ comments in
`ads.js`, `Info.plist`, `AndroidManifest.xml`), publish the GDPR message in
AdMob, create `remove_ads` in both consoles + a purchase plugin, set
`IAP_PRODUCT_ID`.

**The metadata is already done.** Ads ship at launch, so the repo now describes
an ad-supported app rather than an offline one: the privacy policy has an
advertising section, both listings declare collection with per-type tables,
`PrivacyInfo.xcprivacy` sets `NSPrivacyTracking` true, and `Info.plist` has the
ATT usage string and Google's SKAdNetwork id. `SHIP.md` §3.6 has the checklist.

Two identifiers are **deliberately missing** and you must add both when you add
the SDK: iOS `GADApplicationIdentifier` and Android
`com.google.android.gms.ads.APPLICATION_ID`. The SDK throws at launch if either
is absent *or* malformed, so a placeholder would have crashed every build. The
exact snippets are in comments at the point of use in `Info.plist` and
`AndroidManifest.xml`.

The `NSPrivacyTrackingDomains` question is now SETTLED by a real submission
(Aug 20 2026): `NSPrivacyTracking=true` with an empty domains list drew
ITMS-91064 "invalid tracking information" on build 1.0.0 (6). The fix that
matches Google's own GMA manifest (which omits the top-level tracking key and
declares tracking per data type): the app manifest says `false` + empty
domains, and the SDK manifest + ASC App Privacy answers carry the disclosure.

### 5. Play with the new verb: hold to throw your voice
Casting is the biggest gameplay change since the gate economy, and it is tuned
entirely by eye. Hold past ~320ms and release: the song lands where you held,
everything listening goes there, and you go nowhere. Things only a human can
judge:
- does 320ms feel right as the threshold, or do taps trigger casts by accident?
- tap now fires on pointer RELEASE (so tap and cast cannot collide), adding the
  finger's contact time (~80-120ms) to every tap. Does tap still feel snappy?
- is the aim thread legible while your thumb is on the screen?
- try a silent cast (carry banked light into 14): it should light distant water
  and wake nothing. That interaction is load-bearing — keep it.

### 6. Play the bosses, and watch the boon chip
Two things were rebuilt because they were real but invisible, and both need a
human to confirm they now read:

- **Bosses.** There are four, each a different creature with a different
  counter. Depth 14's is new: an anchored *warden* that strikes along the line
  to your **last song**, so you beat it by singing somewhere you are not. Its
  telegraph is a red arc that widens during windup — the whole fight is whether
  that arc is legible in time. The bot cannot judge this, because it sings
  exactly where it swims. Three cast-performances also need human eyes: does
  the warden's body-turn toward your held aim *read* as "it hears where the
  song will land"; does the Deaf God's gray ring-death read as "my voice does
  not work here" rather than a glitch; and does the Twins' new tell line land.
- **The boon chip.** Carried light used to be promised at the gate and then
  never shown. There is now a chip above the HUD naming the active boon, with
  pips that darken as silent songs are spent, plus a flash and a burst when one
  goes. Check that the spend actually reads at a glance.

### 7. Chapter 3's difficulty is unmeasured
The bot navigates by corridor geometry, not by what it can see, so it is
structurally blind to how hard a hush zone is — a hush level that is miserable
for a human scores the same as an easy one. Someone has to actually play 29–42.

---

## Design rules that must survive

These are not preferences. Breaking any of them re-introduces a bug that was
already found and fixed.

- **No hue may be reused.** The mote chain ladder once stepped through
  `#5effc2`, the vent's exact colour, while the tutorial taught "the green vent
  takes you deeper" — a playtester read a good chain as a new kind of object.
  Motes are amber at every tier now; the chain speaks through size, pulse and
  halo. The palette is crowded; separate new things by shape and scale first.
- **A warm vent pins you to the centre line at speed.** In any level with
  `warmVents`, urchins and ice must hug the wall (|off| ≥ ~0.7 × half-width).
  Depth 44 failed 0/7 until one urchin moved outward, then 7/7.
- **Lures hug the wall too**, at |off| ≈ half-width. `lureBaitRadius` is 50, so
  a centred lure in a 90-wide corridor walls the seam completely.
- **Never more than 2 hunters** in a corridor under ~110 wide.
- **Difficulty sawtooths from non-gate levels only.** Gates are designed spikes;
  using them as the baseline opens the next chapter at boss difficulty.
- **The gate screen states a fact and offers a door back.** No shop, no
  purchase, nothing that could read as a paywall. There is no way to buy light,
  and the copy must never imply otherwise.
- **Ads: after a win, never after a death.**

---

## How to verify anything you change

```bash
npm run dev            # port 3852
```

Then in the browser console:

```js
__echo.verifyAll()                    // placement, reachability, survival, all 50
__echo.autoplay(id, {})               // one depth, dodging bot, no god mode
__echo.autoplay(id, { god: true })    // reachability only; par is ~9.5x this
```

Drive the sim with `__echo.game.update(1/60)` in a synchronous loop rather than
waiting on frames. After any change to `www/`: `npx cap sync`.
