# Publishing Echolume — store submission runbook

This checklist is built directly from the most common reasons AI-built/"vibe-coded"
apps get rejected in 2025-2026, and how this project already answers each one.

## Compliance status (already handled in-code)

| Rejection risk | Guideline | Status in Echolume |
|---|---|---|
| Web-wrapper feel (single WebView, offline failures, browser chrome) | Apple 4.2.2 | Fully offline, fullscreen, native splash/icons, haptics, safe-area aware, no URL bar, no external content |
| Crashes / unhandled errors | Apple 2.1 | Fixed-timestep sim with frame clamping, pooled particles, bounded geometry in endless mode, save I/O in try/catch, rescue system for physics escapes, pause on background |
| Placeholder content | Apple 2.1 | No lorem ipsum, no dead buttons, every screen final |
| Missing privacy policy | Apple 5.1.1 / Play Data safety | `store/privacy-policy.md` (zero collection — host it and link) |
| IAP violations | Apple 3.1.1 | No IAP, no external payment links |
| Account deletion | Apple 5.1.1 | No accounts at all; local reset in Settings |
| Template/clone detection | Apple 4.1 | Original mechanic (song = movement + light + noise), original art direction, original audio |
| Unjustified permissions | Both | No sensitive permissions requested |
| Generic metadata | Both | Hand-written listings in `store/` |

## One-time setup

- [ ] Apple Developer Program membership ($99/yr) — developer.apple.com
- [ ] Google Play Console account ($25 once) — play.google.com/console
- [ ] Verify the name "Echolume" is free on both stores at submission time
      (checked free as of Aug 2026; the similarly-named "Sonolus" is unrelated).
- [ ] Host the privacy policy (GitHub Pages is fine) and note the URL.
- [ ] Decide price (free or paid; no ads/IAP in either case).

## Screenshots (both stores)

Ready now:
- `store/screenshots/` — six 1320×2868 (iOS 6.9") captures rendered by the actual game:
  title mood, thorns gameplay, hunter chase, vent arrival, bloom cavern, the Abyss.
- `store/feature-graphic.png` — Play feature graphic 1024×500.

Still to capture on a device (DOM UI isn't in the canvas captures):
- Title screen with logo/buttons, level-select with stars — grab from any phone or
  the browser at 1320×2868 equivalent (6.5" iOS sets can be downscaled from 6.9").

## Google Play (do this first — faster review)

1. Play Console → Create app → App name `Echolume`, Game, Free/Paid.
2. Complete **App content**: privacy policy URL, ads = No, content rating questionnaire
   (answers in `store/listing-android.md`), target audience 13+ (or all ages), data safety = no collection.
3. Store listing: copy from `store/listing-android.md`; upload icon 512 (`assets-out/pwa/icon-512.png`),
   feature graphic, screenshots.
4. Build the signed `.aab` (see BUILDING.md), upload to **Internal testing** first.
5. Test on at least one real device from Internal testing.
6. Promote to Production → submit for review.

## Apple App Store

1. App Store Connect → My Apps → + → New App → bundle id `com.wibesllc.echolume`.
2. Fill listing from `store/listing-ios.md` (name, subtitle, description, keywords,
   support URL, privacy policy URL).
3. App Privacy → "Data Not Collected" (accurate: no SDKs, no requests).
4. Archive + upload from Xcode on a Mac (see BUILDING.md), select build.
5. Paste the review notes from the listing file (offline, no accounts, no credentials needed).
6. Submit. If rejected, the resolution center message will cite a guideline —
   the table above maps each likely one to what's already in place.

## Post-launch hygiene

- Respond to the first reviews; fast replies visibly improve early ratings.
- Version bumps: follow BUILDING.md → Versioning; never reuse a build number.
- Keep the privacy policy URL alive — a dead link is a takedown risk.
