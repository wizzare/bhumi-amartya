# Capacitor Android Setup - Bhumi Amartya

## Summary
Capacitor has been bootstrapped with:
- App name: `Bhumi Amartya`
- App ID: `com.bhumiamartya.app`
- Config file: `capacitor.config.ts`

Android platform folder was created and configured for **Remote URL Mode**.

## Installed Packages
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

## Capacitor Init
```bash
npx cap init "Bhumi Amartya" com.bhumiamartya.app --web-dir=.next
```

Current config:
```ts
const config: CapacitorConfig = {
  appId: "com.bhumiamartya.app",
  appName: "Bhumi Amartya",
  webDir: "capacitor-www",
  server: {
    url: "http://10.0.2.2:3000",
    cleartext: true,
  },
};
```

`10.0.2.2` is Android emulator access to host machine `localhost`.

## Build / Sync / Open Commands
```bash
npm run build
npm run android:sync
npm run android:open
```

## Next.js Export Strategy Check
- Current project is **not configured** for static export (`output: "export"` is not set in `next.config.ts`).
- This is fine for remote URL mode because the app is loaded from running/hosted Next.js server.

## Remote URL Mode
For internal Android testing:
- Emulator URL: `http://10.0.2.2:3000`
- Requires Next.js dev/server running on host machine.

For physical device testing:
- Use same Wi-Fi LAN IP, e.g. `http://192.168.x.x:3000`
- Device and host must be on same network.

For production Play Store builds:
- Use HTTPS hosted app URL, e.g. `https://app.bhumiamartya.com`

Warning:
- Remote URL mode is acceptable for **internal testing**.
- Production Play Store distribution should use a stable HTTPS hosted app (or static export if feasible) for reliability and policy readiness.

## Fallback WebDir
Capacitor still expects a valid web directory.  
This setup includes:
- `capacitor-www/index.html` (minimal fallback page)

## Android Studio
Open project:
```bash
npm run android:open
```

## Play Store Internal Testing Steps
1. Ensure release-ready Android package path is chosen (Capacitor static or TWA hosted).
2. Generate signed app bundle (`.aab`) from Android Studio.
3. In Play Console, create/update app and choose **Internal testing** track.
4. Upload `.aab` and release notes.
5. Add tester emails/group (up to 100 internal testers).
6. Share opt-in link and verify install/login flow.
