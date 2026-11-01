# FitHome

No-gym home workouts with a daily diet plan. Expo SDK 58 / React Native, TypeScript.

- **Today**: streak, week strip, timed workout with voice-over coach
- **Diet**: daily kcal target, macros, 4 meals with foods (rotates daily). Needs height, age and sex in the Plan tab
- **Progress**: weight log
- **Plan**: goals, level, workout days, reminder time (local notifications)

## Run

```bash
npm install
npx expo start      # scan QR with Expo Go, or press i / a
```

Checks:

```bash
npm run typecheck
npm run lint
npm test            # plan + diet logic
npx expo-doctor
```

## Build a small Android APK (local, no EAS)

`android/` is generated (Continuous Native Generation) and gitignored. Size settings live in `app.json` under the `expo-build-properties` plugin: R8 minify, resource shrinking, PNG crunch, bundle compression, legacy native-lib packaging, GIF/WebP off.

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Notes:

- `-PreactNativeArchitectures=arm64-v8a` builds for 64-bit ARM phones only. This is the biggest size saving (drops armv7, x86, x86_64 native libs). It will not install on an x86 emulator; use `arm64-v8a,x86_64` for that.
- The release build is signed with the debug keystore. Fine for sideloading; create a real keystore before publishing to the Play Store.
- Needs JDK 17 and the Android SDK (`ANDROID_HOME`).
- Keep it light: add dependencies sparingly, use `npx expo install`, and prefer Expo modules.

## Structure

```
App.tsx              tabs + state
src/screens/         Today, Diet, Progress, Setup, Player
src/components/ui.tsx  Btn, Chip, Card, Bar
src/lib/             plan.ts (workout), diet.ts (diet), notify.ts (reminders)
src/theme.ts         design tokens
```
