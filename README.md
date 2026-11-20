# Calculator

A mobile calculator app (Android and iOS) built with React Native and Expo. The app currently
contains only the engineering foundation: tooling, design tokens, UI primitives, tests, and a
placeholder screen. Calculator features are built later from approved specs in [`specs/`](./specs).

## Quick start (daily commands)

Run these in two terminals.

**Terminal 1: start the Android emulator** (leave it open):

```bash
emulator -avd Pixel_8_API_35
```

**Terminal 2: build and run the app on the emulator:**

```bash
cd ~/Documents/claude-prac/calculator && npm run android
```

If `emulator` or Java is "not found" in a terminal, run `source ~/.zshrc` first, or open a new terminal.
The exports are set in `~/.zshrc` (see [Environment variables](#environment-variables)).

## Technology stack

| Area            | Choice                                   |
| --------------- | ---------------------------------------- |
| Framework       | Expo SDK 58, React Native 0.88, React 19 |
| Language        | TypeScript (strict)                      |
| Navigation      | Expo Router (file-based, typed routes)   |
| Styling         | `StyleSheet` + centralized design tokens |
| Testing         | Jest (`jest-expo`), React Native Testing Library |
| Lint and format | ESLint (`eslint-config-expo`, `typescript-eslint`), Prettier |

**Styling deviation:** the prompt prefers NativeWind. Only NativeWind 5 pre-releases support
current React Native, and stable 4.x targets Tailwind 3. Stable tooling was chosen instead, so
styling uses `StyleSheet` with tokens from `src/theme/`. Revisit this when NativeWind 5 is stable.

**Deferred libraries:** Zustand, Expo Haptics, Lucide icons, and Maestro are not installed yet.
Each will be added with the feature that first needs it, using `npx expo install`.

## Prerequisites

- macOS with Node.js `^24.3.0` (Expo 58 requires `^22.13.0 || ^24.3.0 || ^26.0.0 || >=27.0.0`).
  Verified with Node 24.14.0 and npm 11.9.0.
- JDK 17 (`brew install openjdk@17`).
- Android SDK at `~/Library/Android/sdk` with platform 35, build-tools 35.0.0, platform-tools,
  emulator, and the `google_apis_playstore;arm64-v8a` system image 35.
- Watchman (`brew install watchman`), recommended by Expo for file watching.
- Xcode for iOS. **Not installed on the machine this was set up on** (only Command Line Tools), so
  iOS is not verified.

## Environment variables

Add these to your shell profile (`~/.zshrc`):

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
```

## Installation

```bash
npm install
```

## Android emulator setup

Create an AVD (the foundation uses a Pixel 8 profile on API 35):

```bash
avdmanager create avd -n Pixel_8_API_35 -k "system-images;android-35;google_apis_playstore;arm64-v8a" -d pixel_8
```

Start it (headless is fine for verification):

```bash
emulator -avd Pixel_8_API_35 -no-window -no-audio -no-snapshot
adb devices   # should list emulator-5554 as "device"
```

## Running the app

| Command              | Purpose                                              | Status                      |
| -------------------- | ---------------------------------------------------- | --------------------------- |
| `npm start`          | Start the Expo dev server (Metro)                    | Verified bundle export; see Verification |
| `npm run android`    | Native Android build and install (`expo run:android`) | See Verification            |
| `npm run ios`        | Native iOS build (`expo run:ios`)                    | Not verified (no Xcode)     |

## Tests, lint, and type checking

| Command                | What it does                        | Status |
| ---------------------- | ----------------------------------- | ------ |
| `npm test`             | Run the Jest suite once             | PASS (27 tests) |
| `npm run test:watch`   | Run Jest in watch mode              | Not separately run; same suite as `npm test` |
| `npm run lint`         | ESLint across the project           | PASS (0 problems) |
| `npm run typecheck`    | `tsc --noEmit` in strict mode       | PASS |
| `npm run format`       | Prettier write                      | Verified |
| `npm run format:check` | Prettier check (used in CI-style checks) | PASS |

## Verification

Results from the setup run on macOS 15.5 (arm64, Apple M2), Node 24.14.0:

- Dependency install: PASS
- `expo-doctor`: PASS (20/20 checks)
- Type checking: PASS
- Lint: PASS
- Formatting: PASS
- Tests: PASS (3 suites, 27 tests)
- Expo Android bundle export: PASS
- Android emulator (Pixel 8 AVD, API 35, arm64): PASS, booted and detected by adb
- Native Android build (`npm run android`): PASS (`BUILD SUCCESSFUL`, 16m 58s on first run, including NDK and SDK downloads)
- Install and launch on the emulator: NOT VERIFIED. The install step failed because the emulator was stopped before it ran (`device 'emulator-5554' not found`). Re-run `npm run android` with the emulator running to verify.

## Project structure

```
src/
  app/           Expo Router routes only. Every file here is a screen; _layout.tsx defines navigators.
  components/
    ui/          Reusable, design-system primitives (Text, Surface, Button, ScreenContainer).
  features/      Feature modules, added per spec (e.g. calculator, converter, themes). Empty for now.
  domain/        Pure domain models and calculation logic, with no React imports. Added per spec.
  theme/         Design tokens (palettes, spacing, typography, motion) and ThemeProvider.
  hooks/         Shared React hooks (none yet).
  lib/           Pure utilities with no UI or platform dependencies (none yet).
  __tests__/     Screen-level tests. Kept out of src/app so Expo Router does not treat them as routes.
assets/          App icons and splash image.
designs/         UI reference images from the design files. Source of truth for visuals.
specs/           Feature specifications (Spec-Driven Development). See specs/README.md.
```

Dependency direction: `app` → `features` → `components`/`hooks`/`domain` → `theme`/`lib`. Lower
layers must not import from higher ones. `import/no-cycle` enforces this against cycles.

## Coding conventions

- Components: `PascalCase.tsx`, one component per file, named export.
- Hooks: `useThing.ts`. Other modules: `camelCase.ts`. Test files: `*.test.ts(x)` in `__tests__/`.
- Import the design system through `@/theme/...` and components through `@/components/...`.
- Never hardcode colors, spacing, font sizes, or durations in components. Read them from `useTheme()`.
- Business logic stays out of UI components. Use the `domain/` layer.
- No `any`, no non-null assertions, and no weakened TypeScript settings.

## Design system

- `src/theme/palettes.ts`: colors for Sage Classic (light, default) and Midnight OLED (dark). These
  are approximations read from the screenshots in `designs/`. Refine them against the source assets.
- `src/theme/tokens.ts`: spacing, radius, typography, opacity, icon sizes, elevation, component
  dimensions, layout, and motion.
- `src/theme/ThemeProvider.tsx`: picks light or dark from the system color scheme.
  User-selected themes are a later feature.
- The palette test enforces WCAG AA contrast (4.5:1) for key text pairs in both palettes.

## Specifications

See [`specs/README.md`](./specs/README.md). `specs/TEMPLATE.md` lists the required sections.
