# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

A mobile calculator app (Android and iOS) built with React Native, Expo SDK 58, and TypeScript. It is currently a foundation only: tooling, design tokens, UI primitives, tests, and a placeholder home screen. Calculator features are built later from approved specs in `specs/`, using the screens in `designs/` as the visual source of truth.

## Architecture

Explain where things belong:

- Routes live in `src/app/`. Every file there is a screen; `_layout.tsx` defines navigators. Keep non-route code out of this folder, because Expo Router treats every file here as a route.
- Feature modules live in `src/features/` (planned, empty). Add one per approved spec.
- Business logic and calculation models live in `src/domain/` (planned, empty). Pure TypeScript with no React imports.
- Reusable design-system primitives live in `src/components/ui/` (`Text`, `Surface`, `Button`, `ScreenContainer`).
- Shared hooks live in `src/hooks/` and pure utilities in `src/lib/` (both planned, empty).
- Design tokens and theming live in `src/theme/`: `tokens.ts` (non-colour values), `palettes.ts` (colours for `sageClassic` light and `midnightOled` dark), `theme.ts` (combines them), and `ThemeProvider.tsx` (picks the mode from the system colour scheme).
- Specs live in `specs/` (workflow in `specs/README.md`, required sections in `specs/TEMPLATE.md`). Assets are in `assets/`; UI references in `designs/`.

Dependency direction is one way: `app` → `features` → `components` / `hooks` / `domain` → `theme` / `lib`. Lower layers must never import from higher ones. `import/no-cycle` is an ESLint error.

Routing uses Expo Router with typed routes (`experiments.typedRoutes`). Styling uses `StyleSheet` plus tokens, not NativeWind (NativeWind 5 is still pre-release; revisit when it is stable).

## Code Style

- Components are `PascalCase.tsx`, one component per file, with a named export. Hooks are `useThing.ts`. Other modules are `camelCase.ts`. Tests are `*.test.ts(x)` in a `__tests__/` folder.
- Import the design system through `@/theme/...` and components through `@/components/...`.
- Never hardcode colours, spacing, font sizes, or durations in components. Read them from `useTheme()`.
- No `any`, no non-null assertions (`!`), no weakened TypeScript settings. `noUncheckedIndexedAccess` is on.
- `console.log` is not allowed; only `console.warn` and `console.error`.
- Every acceptance criterion in a spec should map to at least one test.

## Preferred Libraries

- Use Expo modules and Expo Router for navigation. Check Expo's docs before using any Expo, EAS, or React Native API; APIs change between SDKs.
- Use `StyleSheet` with the theme tokens for styling.
- Use Jest with `jest-expo` and `@testing-library/react-native` for tests.
- Do not add dependencies unless the feature that needs them requires it. Deferred libraries (Zustand, Expo Haptics, Lucide icons, Maestro) are added only with the feature that first needs them.

## Commands

Package manager is npm (`package-lock.json`). Use `npx expo install <package>` to add dependencies so versions match the Expo SDK; never `npm install <package>`.

```bash
npm install               # install dependencies
npm start                 # Expo dev server (Metro)
npm run android           # native Android build + install (start the emulator first)
npm run ios               # native iOS build (requires Xcode; not verified on this machine)
npm test                  # run the Jest suite once
npx jest path/to/file     # run a single test file
npx jest -t "name"        # run a single test by name
npm run test:watch        # Jest in watch mode
npm run lint              # ESLint
npm run typecheck         # tsc --noEmit (strict)
npm run format:check      # Prettier check (npm run format to write)
npx expo-doctor          # dependency and config diagnostics
npx expo install --fix    # fix incompatible package versions
```

Run lint and typecheck before declaring a task done.

## Critical Rules

- Do not implement calculator features without an approved spec in `specs/` (`Status: Approved`).
- Do not create or hand-edit `ios/` or `android/`. They are generated (Continuous Native Generation). Configure native behaviour in `app.json` and config plugins. `android/` exists locally but is not tracked in git.
- Expo Go does not include third-party native modules. Any library with native code needs a development build (`npm run android` or `eas build --profile development`).
- Do not edit `expo-env.d.ts`; it is generated and gitignored.
- Do not put business logic in UI components. Use `src/domain/`.
- Do not hardcode design values in components. Add new values to `src/theme/` instead.
- Keep the palette keys of `sageClassic` and `midnightOled` identical; `palettes.test.ts` enforces this and WCAG AA contrast (4.5:1) for key text pairs.
- Use EAS (`npx eas-cli@latest <command>`) for cloud builds, submission, and OTA updates; do not require local Xcode or Android Studio for release builds.
