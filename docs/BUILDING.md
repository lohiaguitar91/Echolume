# Building Echolume

The game itself is dependency-free vanilla JS in `www/`. Capacitor wraps it for the stores.

## Web (dev)

```
npm run dev        # serves www/ at http://localhost:3852
```

Dev-only helpers (never shipped):
- `http://localhost:3852/__dev/gen` — regenerates icon/splash source art into `assets-out/`
- `window.__echo` — headless test API (only installed when not running under Capacitor)

## Sync web → native

After ANY change in `www/` or `capacitor.config.json`:

```
npx cap sync
```

This copies `www/` into both native projects and updates plugin registrations
(@capacitor/haptics, @capacitor/preferences).

## Android (this machine or any machine with Android Studio)

1. Install Android Studio (bundles SDK + JDK).
2. `npx cap open android`
3. First run: let Gradle sync finish.
4. Debug APK: **Run** on an emulator or USB device.
5. Release: **Build → Generate Signed Bundle/APK → Android App Bundle**.
   - Create a keystore once; keep it safe (losing it means losing the app identity).
   - Output `.aab` is what you upload to Play Console.

Command-line alternative once SDK is installed:
```
cd android && .\gradlew bundleRelease
```

## iOS (requires a Mac with Xcode 26+)

The `ios/` project in this repo is complete (icons, splash, portrait lock,
Package.swift plugins). On a Mac:

1. Clone/copy the project; `npm install`; `npx cap sync ios`.
2. `npx cap open ios`
3. In Xcode: set your Team under Signing & Capabilities (bundle id `com.wibesllc.echolume`).
4. Product → Archive → Distribute App → App Store Connect.

CLI alternative to steps 2–4 (uses Xcode's signed-in account; team is already
set in the project, `ios/App/UploadOptions.plist` holds the upload settings):

    xcodebuild archive -project ios/App/App.xcodeproj -scheme App \
      -destination 'generic/platform=iOS' \
      -archivePath ios/App/output/Echolume.xcarchive -allowProvisioningUpdates
    xcodebuild -exportArchive -archivePath ios/App/output/Echolume.xcarchive \
      -exportOptionsPlist ios/App/UploadOptions.plist -allowProvisioningUpdates

Bump CURRENT_PROJECT_VERSION (build number) in `ios/App/App.xcodeproj` before
every upload — App Store Connect rejects reused build numbers.

Note: Apple requires builds with the current SDK (Xcode 26 / iOS 26 SDK as of April 2026).

## Icon / splash regeneration

Source art is drawn in code (`dev-assets-gen.html` → `assets-out/`, curated copies in `assets/`).
To re-fan-out all native sizes:

```
npx capacitor-assets generate --android --iconBackgroundColor '#030711' --splashBackgroundColor '#030711'
npx capacitor-assets generate --ios     --iconBackgroundColor '#030711' --splashBackgroundColor '#030711'
```

## Versioning a release

1. Bump `GAME_VERSION` in `www/js/config.js` and `version` in `package.json`.
2. Bump `VERSION` in `www/sw.js` (cache bust for web deploys).
3. Android: bump `versionCode`/`versionName` in `android/app/build.gradle`.
4. iOS: bump Version/Build in Xcode target settings.
5. `npx cap sync`, rebuild both.
