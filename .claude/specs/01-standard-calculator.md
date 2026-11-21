# Standard Calculator

Status: Implemented
Step: 01
Owner: TBD
Last updated: 2026-11-21

## 1. Overview

This feature turns the placeholder home screen into a working basic calculator. It has a display, a 4-function keypad (add, subtract, multiply, divide) with percent, sign toggle, clear entry, backspace, and equals, and a calculation engine in `src/domain/` that is pure TypeScript with no React imports. It is Step 1 of the roadmap and the foundation for Steps 2 (history) and 3 (scientific), which reuse the engine, so the engine must be independent of the UI. Memory keys (MC, MR, M-, M+) and the Converter and Scientific mode buttons shown in `designs/Column - Basic calculator@1.5x.png` are not part of this step (see Scope).

## 2. Goals

- A user can enter any sequence of digits and the four basic operators and see the correct result on the display, for 100% of the acceptance criteria in section 11.
- The calculation engine has no React or React Native imports and its tests run under Jest without rendering any UI.
- The keypad matches the basic calculator design layout (key order and key roles) on Android and iOS.
- Lint, typecheck, format check, and the full Jest suite pass before the feature is declared done.

## 3. Scope

**In scope**

- Calculator engine in `src/domain/` for digit entry, decimal point, the four operators, equals, percent, sign toggle, clear entry, backspace, and an error state.
- A calculator screen rendered from `src/app/index.tsx`, with a display and the 20-key keypad from the basic calculator design.
- Display formatting: thousands separators, a decimal point, and a maximum of 12 significant digits.
- Styling through the existing `src/theme/` tokens and palette keys (`keyDigit`, `keyFunction`, `keyAccent`, `keyDanger`, `displayText`, `displayBackground`, and so on).
- Accessibility labels on every key.

**Out of scope**

- Memory keys MC, MR, M−, M+ are working in this step (FR-21 to FR-26). The `MEM` indicator lights up while memory holds a value.
- Calculation history line on the display and history list. Step 2.
- Scientific mode, the Scientific button, and advanced functions. Step 3.
- Converter as a working feature. Step 4. The Converter button is shown as a disabled placeholder (see FR-20).
- Theme selection by the user. Step 5. The screen uses the system colour scheme through `ThemeProvider`.
- Persisting the display or any calculation across app restarts.
- Keyboard input on a hardware keyboard, and copy or paste of results.
- New dependencies: `@expo-google-fonts/inter` (Inter font) and `react-native-svg` (design icons), added for design fidelity. The engine uses JavaScript numbers with rounding (see FR-14). No calculator-specific library is added.

## 4. Functional requirements

- FR-1: Pressing a digit key (0-9) appends that digit to the current entry. A leading `0` is replaced by the digit. Pressing `0` on an entry of `0` leaves it as `0`.
- FR-2: Pressing `.` appends a decimal point once per entry. A second `.` in the same entry is ignored. Pressing `.` on an empty entry shows `0.`.
- FR-3: An entry can hold at most 12 digits, not counting the decimal point or the sign. Further digit presses are ignored when the limit is reached.
- FR-4: Pressing `+`, `−`, `×`, or `÷` stores the current entry as the left operand and the chosen operator as the pending operation. The display shows the stored value until the next digit is entered.
- FR-5: When an operator is pressed while a pending operation exists and a second operand has been entered, the pending operation is evaluated first. Its result becomes the left operand and the new operator becomes pending. Operations are evaluated left to right with no operator precedence.
- FR-6: Pressing `=` evaluates the pending operation with the current entry as the right operand and shows the result.
- FR-7: Pressing `=` again without entering a new number repeats the last operation with the same right operand (for example, `2 × 3 = =` shows `18`).
- FR-8: Pressing a digit or `.` after `=` starts a new calculation with that entry.
- FR-9: Pressing an operator after `=` continues from the result as the left operand.
- FR-10: Pressing `±` toggles the sign of the current entry. On an entry of `0`, it is ignored.
- FR-11: Pressing `%` when there is a pending operation and a right operand entered computes `left × (entry ÷ 100)` and shows it as the current entry. Pressing `%` with no pending operation divides the current entry by 100.
- FR-12: Pressing `CE` sets the current entry to `0`. It does not clear a pending operation or its left operand.
- FR-13: Pressing backspace removes the last digit of the current entry. When one digit remains, the entry becomes `0`. Backspace has no effect after `=` or when the display shows an error.
- FR-14: Results are rounded to 12 significant digits to remove floating-point noise (for example, `0.1 + 0.2` shows `0.3`). Results that are not finite or exceed the range `±9.99999999999e+11` show the error state. Results smaller in magnitude than `1e-12` that are not zero are shown as `0` (see Section 10).
- FR-15: Dividing by zero shows the error state. In the error state every key except `CE` is ignored, and `CE` resets the engine to `0` with no pending operation.
- FR-16: The display shows the current entry or the most recent result with thousands separators (for example `6,140.5`). A trailing decimal point during entry is shown as typed (for example `1,250.`).
- FR-17: The expression line shows the pending left operand and operator (for example `34 +`) from the operator press until `=`. It stays visible while the right operand is typed, because the expression and the current input are separate values. The expression line is empty when no calculation is pending, and it is cleared by a completed calculation (`=`) or an error. Clear entry (CE) keeps the pending expression (FR-12). The operator key in the expression stays marked as selected for the same period.
- FR-17a: Typing the right operand updates only the primary value. Pressing an operator again replaces the pending operator; with a right operand typed, it first evaluates the expression (FR-5) and shows the running total as the new expression.
- FR-18: The initial state on app launch is `0` with no pending operation.
- FR-19: The engine is a pure function-based module in `src/domain/` that takes the current state and an input and returns the next state. It does not import React, React Native, or any UI module.
- FR-20: The mode buttons (CONVERTER, SCIENTIFIC) are rendered as disabled placeholders. They have no action and do not change the engine state. Their behaviour belongs to later steps.
- FR-21: Memory is a single number, kept beside the calculator state (not inside it). It starts at `0`, which means empty. Calculator actions never change memory.
- FR-22 (MC): Pressing MC sets memory to `0`. It does not change the calculator.
- FR-23 (MR): Pressing MR places the stored value into the entry, as if it had been typed. After `=` it starts a new calculation. After an operator it becomes the right operand. It is ignored while the display shows an error. Memory is unchanged.
- FR-24 (M+): Pressing M+ adds the displayed number to memory. It uses the same 12-digit rounding and range check as calculations. It does not change the calculator. It is ignored while the display shows an error.
- FR-25 (M−): Pressing M− subtracts the displayed number from memory. The same rules as FR-24 apply.
- FR-26 (safety): If a memory total cannot be shown (out of range), memory keeps its previous value and nothing else changes. Decimal and negative values are handled exactly as the calculator handles them.
- FR-27 (indicator): The `MEM` label is dim (`displayInactiveText`) when memory is empty and lit (`displayText`) when memory holds a value. No other part of the design changes.

## 5. Non-functional requirements

- NFR-1 (Accessibility): every key has an accessibility label that names its action, for example "Seven", "Divide", "Clear entry", "Backspace", "Equals", "Percent", "Sign change", "Decimal point". The display has an accessibility label that reads the current value.
- NFR-2 (Accessibility): every keypad key has a touch target of at least `dimensions.minTouchTarget` (48) points wide. Keys are 62px tall. Exception: the design sizes the memory keys at 26px and the mode buttons at 38px. These are below 48px and are listed under "Accessibility review" for later review.
- NFR-3 (Accessibility): key and display text meet WCAG AA contrast (4.5:1) using the existing palette pairs. The existing palette test enforces this for the key text pairs.
- NFR-4 (Performance): a key press updates the display within one frame on a mid-range Android device. The engine does no work proportional to the number of previous key presses.
- NFR-5 (Platform): the layout fits a phone screen in portrait orientation on Android and iOS, respects the safe area, and does not depend on platform-specific code.
- NFR-6 (Platform): the display and keypad render with the same layout on Android and iOS. Fonts and sizes come from theme tokens.

## 6. User stories

- As a user, I want to enter numbers and press an operator, so that I can add, subtract, multiply, or divide two numbers.
- As a user, I want to press equals and see the result, so that I can use the calculator for everyday sums.
- As a user, I want to press equals again to repeat the last operation, so that I can apply the same step to a new result.
- As a user, I want percent and sign change keys, so that I can calculate percentages and negative numbers quickly.
- As a user, I want to clear the entry or delete a digit, so that I can fix a mistake without starting again.
- As a user, I want a clear error message when I divide by zero or overflow the display, so that I know the result is not valid.
- As a screen-reader user, I want each key to announce its action, so that I can use the calculator without seeing the keypad.

## 7. User flows

**Flow A: Simple addition**

1. The user opens the app. The display shows `0` (FR-18).
2. The user presses `1`, `2`, `5`, and `0`. The display shows `1,250` (FR-1, FR-16).
3. The user presses `+`. The display shows `1,250` as the stored left operand (FR-4).
4. The user presses `4`, `8`, `9`, `0`, `.`, `5`, `0`. The display shows `4,890.50` (FR-2, FR-16).
5. The user presses `=`. The display shows `6,140.5` (FR-6).

**Flow B: Chained operations**

1. The user enters `2`, presses `×`, enters `3`, presses `+`. The engine evaluates `2 × 3 = 6` and makes `6` the left operand (FR-5).
2. The user enters `4` and presses `=`. The display shows `10` (FR-6).

**Flow C: Repeat equals**

1. The user enters `2`, `×`, `3`, `=`. The display shows `6`.
2. The user presses `=` again. The display shows `18` (FR-7).

**Flow D: Percent**

1. The user enters `200`, presses `+`, enters `10`, presses `%`. The display shows `20` (the right operand is `200 × 10 ÷ 100`) (FR-11).
2. The user presses `=`. The display shows `220`.

**Flow E: Divide by zero**

1. The user enters `5`, presses `÷`, enters `0`, presses `=`. The display shows the error state (FR-15).
2. The user presses `7`. Nothing changes (FR-15).
3. The user presses `CE`. The display shows `0` and the engine is reset (FR-15).

**Flow F: Correcting an entry**

1. The user enters `1`, `2`, `3`. The display shows `123`.
2. The user presses backspace. The display shows `12` (FR-13).
3. The user presses `CE`. The display shows `0` (FR-12).

**Flow G: Continue after equals**

1. The user enters `8`, `×`, `2`, `=`. The display shows `16`.
2. The user presses `+`, then `4`, then `=`. The display shows `20` (FR-9).
3. The user presses `5` after the result. The display shows `5` as a new calculation (FR-8).

## 8. UI states

Based on `designs/Column - Basic calculator@1.5x.png`. The screen shows the header label, display, memory row, keypad (filling the remaining height), and the Converter and Scientific buttons. The memory keys are working (FR-21 to FR-27). The two mode buttons are disabled placeholders (FR-20). The history line is not built in this step.

| State            | Description                                                                                                                                                                                                                                       | Design reference                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Default          | Display shows the current entry or result (for example `6,140.5`) in `displayText` on `displayBackground`. Keys use `keyDigit` (digits), `keyFunction` (`±`, `÷`, `×`, `−`, `+`, `.`, `=`), `keyAccent` (`%`, backspace), and `keyDanger` (`CE`). | `Column - Basic calculator@1.5x.png`                 |
| Pressed          | Key shows a pressed style (for example reduced depth or slight darkening) using palette tokens, with no new hardcoded values.                                                                                                                     | `Column - Basic calculator@1.5x.png`                 |
| Operator pending | The expression line shows the left operand and operator symbol (for example `34 +`) while the right operand is typed (FR-4, FR-17). The operator key in use is visually marked as selected for the same period.                                   | `Column - Basic calculator@1.5x.png` (display area)  |
| Result           | Display shows the result after `=` (FR-6).                                                                                                                                                                                                        | `Column - Basic calculator@1.5x.png`                 |
| Error            | Display shows `Error` in `displayText` on `displayBackground`. All keys except `CE` are visually unchanged but ignored (FR-15).                                                                                                                   | Not in designs. Colour uses existing palette tokens. |
| Disabled         | Placeholder mode buttons only (Converter, Scientific). They are disabled, have no action, and use the `keyMode` token at the design size (38px). The memory keys use the `memoryKey` token at 26px.                                               | Not applicable                                       |
| Empty            | Not applicable. The display always shows a value, starting at `0` (FR-18).                                                                                                                                                                        | Not applicable                                       |
| Loading          | Not applicable. The calculator does no asynchronous work.                                                                                                                                                                                         | Not applicable                                       |
| Long values      | Entries and results that fill the display width shrink the font using tokens, not a fixed size, so they stay on one line.                                                                                                                         | `Column - Basic calculator@1.5x.png`                 |

## 9. Technical constraints

**Files to change**

- `src/app/index.tsx`: replace the placeholder home content with the calculator screen. Keep it a thin route that renders the screen component.
- `src/app/_layout.tsx`: only if the route header or status needs a change. Default is no change.
- `src/__tests__/home-screen.test.tsx`: currently asserts the placeholder text ("Calculator", "Foundation ready"). Update it to assert the calculator screen renders with display `0`.
- `src/theme/tokens.ts`: only if a spacing, font size, or radius value the design needs is missing. Add it here, never in components.

**Files to create**

- `src/domain/calculator.ts`: the calculation engine (state type, initial state, input reducer, formatting helper for results).
- `src/domain/__tests__/calculator.test.ts`: engine unit tests.
- `src/components/` new components, one per file, named exports, `PascalCase.tsx`. Planned:
  - `src/components/calculator/Display.tsx`
  - `src/components/calculator/Keypad.tsx`
  - `src/components/calculator/CalculatorKey.tsx`
  - `src/components/calculator/MemoryRow.tsx` and `src/components/calculator/MemoryKey.tsx` (working memory keys, FR-21 to FR-27)
  - `src/components/calculator/ModeRow.tsx` (placeholder mode buttons, FR-20)
  - `src/domain/memory.ts` (memory reducer, wrapping the calculator reducer) and `src/domain/__tests__/memory.test.ts`
  - `src/components/calculator/PlaceholderButton.tsx` (shared disabled button)
  - `src/components/calculator/BrandBadge.tsx` (STANDARD CALC / AUTO POWER OFF line)
  - `src/components/calculator/CalculatorIcon.tsx` (backspace, globe, atom outlines from the design, via react-native-svg)

**Design fidelity (added 2026-11-21)**

The OpenPencil file `Demo.fig`, frame "Column - Basic calculator", is the source of truth for this phase. Measured values are in `src/theme/tokens.ts` and the colours in `src/theme/palettes.ts` (`sageClassic`). Both match the design exactly. Contrast is not adjusted (see Accessibility review below).

- Font: Inter (`@expo-google-fonts/inter`, weights 400/500/600/700), loaded in `src/app/_layout.tsx`.
- Icons: `react-native-svg` draws the backspace, globe and atom outlines.
- Both are new dependencies. They are required for the design's font and icons (per the user's decision, 2026-11-21). Native code (`react-native-svg`) needs a development build.
- Not reproduced: the phone status bar and home indicator from the design, because Android provides its own. The history line is empty until Step 2.
- `src/features/calculator/CalculatorScreen.tsx`: the screen that connects the engine to the display and keypad. Lives in `src/features/` per the architecture rules (a feature module for an approved spec).
- `src/features/calculator/__tests__/CalculatorScreen.test.tsx`: component tests.

**Constraints**

- Business logic goes in `src/domain/` (pure TypeScript, no React imports).
- Styling uses tokens from `src/theme/`. No hardcoded colours, spacing, font sizes, or durations.
- Routes go in `src/app/`. Only the entry route is touched.
- Dependency direction: `app` → `features` → `components` / `hooks` / `domain` → `theme` / `lib`. `components` must not import from `features`.
- Import the design system through `@/theme/...` and components through `@/components/...`.
- No new dependency. Use `useReducer` from React for screen state.
- No `any`, no non-null assertions, `noUncheckedIndexedAccess` stays on.
- No `console.log`.

## 10. Edge cases

- Entering 12 digits, then pressing a digit: the digit is ignored (FR-3).
- `±` on `0`: no change (FR-10).
- `.` pressed twice: second press ignored (FR-2).
- `%` with no pending operation: divides the entry by 100 (FR-11).
- `%` with a pending operation and no right operand entered yet: no change to the display. Decision: this is a no-op, not an error.
- `=` with no pending operation: shows the current entry unchanged.
- `=` with no pending operation after a previous `=`: repeats the last operation (FR-7).
- Pressing an operator while the status is "operator" (no right operand yet) replaces the pending operator.
- A digit or `.` entered after `=` clears the stored repeat (FR-8).
- After `%` with a pending operation, the resulting value stays editable like a normal entry.
- Division by zero: error state (FR-15). Division of `0 ÷ 0` also shows the error state.
- Result exceeds `±9.99999999999e+11`: error state. Decision: the display is limited to 12 digits, so this is the largest result that can be shown in full.
- Result smaller than `1e-12` in magnitude but not zero: treated as `0`, not an error. Decision: this avoids showing noise. Open question below asks whether this should instead show an error.
- Backspace on the last remaining digit of a negative value (for example `-5`): the entry becomes `0`, not `-`.
- Backspace after `=`: no effect (FR-13).
- Pressing `CE` in the error state: resets to `0` (FR-15).
- Digit entry immediately after an operator: starts a new right operand; the left operand is kept.
- Rotating the device: the calculator state is kept in React state. Decision: no special handling. A rotation that remounts the screen would reset it. Open question below.
- Very rapid key presses: each press is processed in order by the reducer, so no press is lost.

## 11. Acceptance criteria

Each criterion is checkable and maps to at least one test in section 12.

- [ ] AC-1: Given the app launches, when the calculator screen first renders, then the display shows `0` and no operation is pending. (FR-18)
- [ ] AC-2: Given the display shows `0`, when the user presses `5`, then the display shows `5`. (FR-1)
- [ ] AC-3: Given the display shows `0`, when the user presses `0`, then the display still shows `0`. (FR-1)
- [ ] AC-4: Given the entry is `12`, when the user presses `.`, then the entry is `12.` and a second `.` is ignored. (FR-2)
- [ ] AC-5: Given the entry is empty (`0`), when the user presses `.`, then the entry shows `0.`. (FR-2)
- [ ] AC-6: Given the entry already has 12 digits, when the user presses another digit, then the entry does not change. (FR-3)
- [ ] AC-7: Given the entry is `2`, when the user presses `×`, `3`, `=`, then the display shows `6`. (FR-4, FR-6)
- [ ] AC-8: Given `1,250 + 4,890.50` is entered, when the user presses `=`, then the display shows `6,140.5`. (FR-16)
- [ ] AC-9: Given the expression `2 + 3 ×`, when the user presses `4` and `=`, then the display shows `20` (left-to-right, no precedence). (FR-5)
- [ ] AC-10: Given `2 × 3 =`, when the user presses `=` again, then the display shows `18`. (FR-7)
- [ ] AC-11: Given a result is shown, when the user presses `5`, then the display shows `5` as a new calculation. (FR-8)
- [ ] AC-12: Given a result of `16` is shown, when the user presses `+`, `4`, `=`, then the display shows `20`. (FR-9)
- [ ] AC-13: Given the entry is `5`, when the user presses `±`, then the display shows `-5`. Pressing `±` again shows `5`. (FR-10)
- [ ] AC-14: Given the entry is `0`, when the user presses `±`, then the display still shows `0`. (FR-10)
- [ ] AC-15: Given `200 +` and entry `10`, when the user presses `%`, then the entry shows `20`. (FR-11)
- [ ] AC-16: Given the entry is `50`, when the user presses `%` with no pending operation, then the display shows `0.5`. (FR-11)
- [ ] AC-17: Given `7 + 3` is entered with `3` as the right operand, when the user presses `CE`, then the entry shows `0` and the pending `+` with `7` is kept. (FR-12)
- [ ] AC-18: Given the entry is `123`, when the user presses backspace, then the entry shows `12`. (FR-13)
- [ ] AC-19: Given the entry is `5`, when the user presses backspace, then the entry shows `0`. (FR-13)
- [ ] AC-20: Given a result is shown, when the user presses backspace, then the result does not change. (FR-13)
- [ ] AC-21: Given `5 ÷ 0 =` is entered, when the user presses `=`, then the display shows `Error`. (FR-15)
- [ ] AC-22: Given the display shows `Error`, when the user presses `7`, then the display still shows `Error`. Pressing `CE` then shows `0`. (FR-15)
- [ ] AC-23: Given `0.1 + 0.2 =` is entered, when the user presses `=`, then the display shows `0.3`. (FR-14)
- [ ] AC-24: Given a result would exceed `9.99999999999e+11` in magnitude, when `=` is pressed, then the display shows `Error`. (FR-14)
- [ ] AC-25: Given the display shows `1234567.5`, when it is formatted, then it shows `1,234,567.5`. (FR-16)
- [ ] AC-26: Given `1,250 + ` is entered with no right operand, when the screen renders, then the display shows the stored `1,250` and the `+` operator is shown as selected. (FR-17)
- [ ] AC-41: Given `34 +` is pending, when the user types `22`, then the expression line still shows `34 +` and the primary value shows `22`; pressing `=` shows `56` and clears the expression line. The same flow holds for −, ×, and ÷ (`34 − 22 = 12`, `34 × 22 = 748`, `34 ÷ 22 = 1.54545454545`). (FR-17, FR-17a)
- [ ] AC-27: Given the calculator screen renders, when a screen reader inspects the keypad, then each key has an accessibility label that names its action. (NFR-1)
- [ ] AC-28: Given the calculator screen renders, when each key's style is inspected, then its `minHeight` and `minWidth` are at least `dimensions.minTouchTarget` (48). (NFR-2)
- [ ] AC-29: Given the calculator engine module, when its source is inspected, then it has no React or React Native import. (FR-19)
- [ ] AC-30: Given the palette, when the key text pairs are tested, then each meets 4.5:1 contrast. (NFR-3)
- [ ] AC-31: Given the calculator screen renders, when the user presses the Converter or Scientific button, then the button is disabled and the display stays unchanged. (FR-20)
- [ ] AC-32: Given memory is empty, when the user presses MR, then the display shows `0`, and when the user presses MC, then memory stays `0`. (FR-22, FR-23)
- [ ] AC-33: Given the display shows `5`, when the user presses M+, then memory holds `5` and the display is unchanged; pressing M+ again after typing `3` gives `8`. (FR-24)
- [ ] AC-34: Given memory holds `5` and the display shows `2`, when the user presses M−, then memory holds `3`. Pressing MC then sets memory to `0`. (FR-22, FR-25)
- [ ] AC-35: Given memory holds `5`, when the user presses MR after typing `7 +`, then the display shows `5` as the right operand, and `=` shows `12`. (FR-23)
- [ ] AC-36: Given decimals and negatives, when the user adds `0.1` and `0.2` with M+, then memory holds `0.3`; when the user adds `-5` with M+, then memory holds `-5`. (FR-24, FR-26)
- [ ] AC-37: Given the display shows an error, when the user presses M+, M−, or MR, then memory and the display are unchanged. (FR-23, FR-24, FR-25)
- [ ] AC-38: Given a memory total would exceed the display range, when the user presses M+, then memory keeps its previous value. (FR-26)
- [ ] AC-39: Given memory holds a value, when the user presses CE, clear, digits, or operators, then memory is unchanged. (FR-21)
- [ ] AC-40: Given memory is empty, the `MEM` label is dim; given memory holds a value, the `MEM` label is lit. (FR-27)

## 12. Testing requirements

- Unit tests (`src/domain/__tests__/calculator.test.ts`): cover AC-1 to AC-24 and AC-29 at the engine level. Use pure reducer calls with no rendering. Include cases for 0.1 + 0.2, the 12-digit limit, overflow, division by zero, and left-to-right evaluation. Also cover the number formatting helper for AC-25.
- Component tests (`src/features/calculator/__tests__/CalculatorScreen.test.tsx`, `@testing-library/react-native`): cover AC-1, AC-8 (end-to-end key presses on the screen), AC-26 (pending display), AC-27 (accessibility labels), and AC-28 (touch target size via layout). Use `fireEvent.press` on keys by accessibility label.
- Palette test: AC-30 is covered by the existing `src/theme/__tests__/palettes.test.ts`. Re-run it; no new palette keys are expected (see Open questions).
- Manual checks on the Android emulator: start with `npm run android`. Enter `1250 + 4890.5 =` and check `6,140.5`. Check `5 ÷ 0 =` shows `Error`. Check the keypad layout matches `designs/Column - Basic calculator@1.5x.png` in key order and roles. Check the layout on a small and a large phone emulator. Note: Android install-and-launch is not verified in `README.md` yet, so record the result of this check when it is run.
- Manual checks on iOS: not verified on this machine (see CLAUDE.md). Record as not run unless a build is available through EAS.
- Required before done: `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm test` all pass.

**Accessibility review (deferred, design fidelity first)**

The design itself fails WCAG AA in these places. They are kept as the design defines them and must be reviewed separately:

- Digit keys: white `#FFFFFF` text on `#7C8473` is about 3.9:1 (needs 4.5:1).
- Accent keys (`%`, backspace): white text on `#F39C12` is about 2.2:1.
- Brand badge "STANDARD CALC": `#686E60` on `#B9BDA9` is about 2.7:1.
- Display header "STANDARD MODE" (`#9B6512`) and the history line (`#7B4E0C`) on `#0C1A0C` are about 2.5:1–3.6:1. The "MEM" indicator (`#54380B`) is about 1.7:1 and is intentionally dim.
- Memory keys: `#E9EADB` text on `#8C907E` is about 2.7:1.
- Touch targets: memory keys 26px tall and mode buttons 38px tall, below 48px (see NFR-2).

`palettes.test.ts` records the first three pairs as documented gaps and fails if they start passing without the list being updated.

**Open questions**

- Memory keys (MC, MR, M-, M+) and the `MEM` indicator are shown in the design. This spec leaves them out because the roadmap row for Step 1 does not list them. Should they be in Step 1 or moved to a later step?
- The Converter and Scientific buttons are shown in the design. This spec does not render them. Should they be visible but inert until Steps 3 and 4, or hidden?
- The design has a `CE` key but no all-clear key. Should a separate `AC` (clear all) key be added, or should `CE` also clear the pending operation?
- Percent with a pending operation: is `200 + 10 %` → `20` (percent of the left operand, the iOS behaviour) the expected behaviour?
- Results smaller than `1e-12` in magnitude are shown as `0` in this spec. Should they show `Error` instead?
- Number formatting: thousands separators use `,` and the decimal separator is `.` (as in the design). Should this follow the device locale instead?
- Rotation and state: should the calculator state survive a device rotation or app backgrounding? This spec keeps it in React state only.
- Dark mode: the design is shown in the light palette (`sageClassic`). Confirm that the dark palette (`midnightOled`) is acceptable for this step without a separate design.
- Negative numbers in the display: shown with `-` (hyphen-minus) or `−` (minus sign) as in the design keypad? The spec uses `-` for the sign-change result.
