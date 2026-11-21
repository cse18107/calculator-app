# Scientific Calculator and Advanced Maths Functions

Status: Draft
Step: 03
Owner: TBD
Last updated: 2026-11-21

## 1. Overview

This feature adds the scientific mode to the calculator. It is shown as the `iPhone - Scientific calculator` screen in the OpenPencil file `Demo.fig` (a FX-990-style layout). It adds a mode selector row, angle mode (DEG/RAD), trigonometric and inverse trigonometric functions, logarithms, square root, squares, the constants π and e, and parentheses. Because these functions need operator precedence and nested brackets, scientific mode uses its own expression engine in `src/domain/`. The Step 1 standard engine stays unchanged. This feature is Step 3 of the roadmap. It depends on Step 1 (`Implemented`) and reuses its display, key, and icon components where they fit.

## 2. Goals

- A user can enter a full scientific expression (for example `sin(30) + log(100) =`) and see the correct result for every acceptance criterion in section 11.
- The scientific engine has no React or React Native imports and its tests run under Jest without rendering any UI.
- The scientific screen matches the layout in `iPhone - Scientific calculator` (node `0:267`) in key order, key roles, and indicator states on Android and iOS.
- The Step 1 standard calculator behaves exactly as before.
- Lint, typecheck, format check, and the full Jest suite pass before the feature is declared done.

## 3. Scope

**In scope**

- Switching from the standard screen to scientific mode with the `SCIENTIFIC` button, which Step 1 shows as a disabled placeholder (this spec replaces Step 1 FR-20 for that button only).
- Scientific expression engine in `src/domain/`: tokens, operator precedence, parentheses, angle mode, and an error state.
- Functions: `sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹` (through `2nd`), `ln`, `log`, `√`, `x²`, `π`, `e`, percent (÷ 100), sign change, backspace, clear entry, and equals.
- Angle mode with the `deg` key, which toggles DEG and RAD.
- The expression line and primary value shown in the design, and the indicator row (RAD, DEG, SCI, FIX).
- The mode selector row (COMP, STAT, BASE-N, MATRIX), where only COMP is active.
- Styling through the existing `src/theme/` tokens. Any colour, spacing, or size the design needs and the theme lacks is added to `src/theme/`.

**Out of scope**

- STAT, BASE-N, and MATRIX modes. Their buttons are shown as disabled placeholders only.
- Converter (globe key) as a working feature. Step 4. The key is a disabled placeholder.
- Memory keys (MC, MR, M+, M−) in scientific mode.
- Power (`xʸ`), factorial, permutations and combinations, reciprocal, `Ans`, and `Pol`/`Rec`.
- The `FIX` and `SCI` display formats. The indicators are shown as in the design; the format cannot be changed.
- Repeat equals (Step 1 FR-7). The scientific expression is evaluated again only when a new expression is entered.
- Calculation history line and history list. Step 2.
- Theme selection by the user. Step 5.
- Persisting the expression or the angle mode across app restarts.
- New dependencies. Inter (font) and `react-native-svg` (icons) come from Step 1. No maths library is added.

## 4. Functional requirements

- FR-1: Pressing `SCIENTIFIC` on the standard screen opens scientific mode with the display at `0`, no expression, and a fresh engine state. The standard engine state is not carried over.
- FR-2: The atom key on the scientific keypad (the key left of `=`) is relabelled `S` and returns to the standard screen. The standard calculator keeps its state. The design has no such control; this is a decision (see Decisions).
- FR-3: The mode selector row shows COMP as the selected, enabled item. STAT, BASE-N, and MATRIX are disabled placeholders with no action.
- FR-4: The indicator row shows `RAD` and `DEG` (only the active one is selected), `SCI` as selected, and `FIX` as dim. The indicators are not interactive, except that the active angle mode changes through FR-5.
- FR-5: Pressing `deg` toggles the angle mode between RAD and DEG. The default is RAD, as shown in the design. The angle mode applies to `sin`, `cos`, `tan` (input) and to `sin⁻¹`, `cos⁻¹`, `tan⁻¹` (output). Changing the mode does not change an expression that has already been evaluated.
- FR-6: Pressing `2nd` arms the secondary function for the next function key, then clears. Secondary functions: `sin` → `sin⁻¹(`, `cos` → `cos⁻¹(`, `tan` → `tan⁻¹(`, `ln` → `eˣ`, `log` → `10ˣ`. Other function keys have no secondary function in this step, so `2nd` has no effect on them and is cleared. Pressing `2nd` again before a function key cancels it.
- FR-7: Digits, `.`, `+`, `−`, `×`, `÷`, `(`, `)`, `π`, `e`, `sin(`, `cos(`, `tan(`, `ln(`, `log(`, `√(`, and the secondary functions in FR-6 append tokens to the expression. `x²` applies to the operand before it (a number, a constant, or a closed bracket group). `%` is a postfix `÷ 100`. `±` negates the number currently being typed; if no number is being typed it is ignored.
- FR-8: Evaluation uses standard precedence: brackets, then functions and `x²` and `%`, then `×` and `÷`, then `+` and `−`. Operators of equal precedence are evaluated left to right. A leading `−` is a unary minus.
- FR-9: Pressing `=` closes any open brackets, evaluates the expression, and shows the result. Function calls not yet closed are closed at `=`. The result is rounded to 10 significant digits (see FR-12).
- FR-10: `π` inserts 3.14159265358979 and `e` inserts 2.71828182845905 as number tokens.
- FR-11: `√(` opens a square root that is closed by `)` or at `=`. `x²` squares the operand before it.
- FR-12: Results are rounded to 10 significant digits. Floating-point noise is removed in the same way as Step 1 FR-14, using the 10-digit limit.
- FR-13: The error state (shown as `Error`) occurs for: division by zero; `√` of a negative value; `ln` or `log` of a value ≤ 0; `sin⁻¹` or `cos⁻¹` of a value outside [−1, 1]; `tan` of an odd multiple of 90° (DEG) or π/2 (RAD) (where the cosine is less than 1e-12); and any result outside ±9.999999999e+9 (the 10-digit range). In the error state every key except `CE` is ignored, and `CE` resets the engine to `0` with no expression.
- FR-14: `CE` sets the number currently being typed to `0`. If no number is being typed (the expression ends with an operator, a bracket, or a function), `CE` has no effect.
- FR-15: `⌫` removes the last digit of the number being typed. If no number is being typed, it removes the last whole token (for example `sin(` is removed in one press). After `=` it has no effect.
- FR-16: The expression line shows the tokens as typed, with symbols (`sin(`, `√(`, `×`, `÷`, `π`, `e`, `x²`). The primary value shows the number being typed, or the result after `=`. Thousands separators are shown as in Step 1 FR-16. Values below 1000 are unaffected, so the design's `2.70710678` is unchanged.
- FR-17: After `=`, the expression line shows the completed expression followed by `=`, and the primary value shows the result. Pressing a digit or `.` starts a new expression. Pressing an operator continues from the result as the first token (`sin(30) =` then `+ 2 =` gives `2.5`).
- FR-18: The initial state on entering scientific mode is `0` with an empty expression. The `2nd` arm and the angle mode default (RAD) are reset when the state is reset by `CE` in the error state and on mode entry. The angle mode is kept until the app restarts or the user returns to standard mode.
- FR-19: The scientific engine is a pure module in `src/domain/` that takes the current state and an input and returns the next state. It does not import React, React Native, or any UI module. The Step 1 standard engine (`src/domain/calculator.ts`) is not modified.
- FR-20: The globe key and the atom key are disabled placeholders with no action. Their meaning is an open question.
- FR-21: The `SCIENTIFIC` button on the standard screen is enabled. The `CONVERTER` button stays a disabled placeholder (Step 4).
- FR-22: The brand badge shows `FX-990 SCIENTIFIC` on the left and `10-DIGIT` with `V.P.A.M.` on the right, as in the design. These are static labels.

## 5. Non-functional requirements

- NFR-1 (Accessibility): every key has an accessibility label that names its action, for example "Sine", "Inverse sine", "Degree mode toggle", "Second function", "Square root", "Open bracket", "Pi". The display has an accessibility label that reads the expression and the current value. The `deg` key and `2nd` key expose their selected state.
- NFR-2 (Accessibility): every key has a touch target at least `dimensions.minTouchTarget` (48) points wide. The design sizes the mode selector items and the secondary indicator text below 48 points. Those items are disabled placeholders (STAT, BASE-N, MATRIX). They are listed under "Accessibility review".
- NFR-3 (Accessibility): text meets WCAG AA contrast (4.5:1) using the existing palette pairs where possible. Any pair that fails and comes from the design is listed under "Accessibility review" and not silently changed.
- NFR-4 (Performance): a key press updates the display within one frame on a mid-range Android device. The engine parses the expression only on `=`, and evaluates tokens in one pass.
- NFR-5 (Platform): the layout fits a phone screen in portrait orientation on Android and iOS, respects the safe area, and does not depend on platform-specific code.
- NFR-6 (Platform): the keypad uses 5 columns and the same layout on Android and iOS. Fonts and sizes come from theme tokens.

## 6. User stories

- As a user, I want to enter `sin(30)` and get the answer, so that I can use trigonometry on the phone.
- As a user, I want operator precedence and brackets, so that `2 + 3 × 4` gives `14` and I can group terms.
- As a user, I want to switch between DEG and RAD, so that I can work in degrees or radians.
- As a user, I want inverse trigonometric and logarithmic functions through `2nd`, so that I can reach them on a small keypad.
- As a user, I want a clear error when the maths is undefined, so that I know the answer is not valid.
- As a screen-reader user, I want each key to announce its function and the current mode, so that I can use the calculator without seeing the keypad.

## 7. User flows

**Flow A: Enter scientific mode**

1. The user is on the standard screen and presses `SCIENTIFIC`. The scientific screen opens with `0`, RAD selected (FR-1, FR-5).

**Flow B: Trigonometry in degrees**

1. The user presses `deg` so DEG is selected (FR-5).
2. The user presses `sin`, `3`, `0`, `)`, then `=`. The expression line shows `sin(30) =` and the display shows `0.5` (FR-7, FR-9, FR-17).

**Flow C: Inverse trigonometry**

1. The user presses `2nd`, then `sin`. The expression shows `sin⁻¹(`. The `2nd` arm is cleared (FR-6).
2. The user presses `0`, `.`, `5`, `)`, then `=`. The display shows the result in the active angle mode (FR-5, FR-9).

**Flow D: Precedence and brackets**

1. The user presses `(`, `2`, `+`, `3`, `)`, `×`, `4`, `=`. The display shows `20` (FR-8).

**Flow E: Mixed expression from the design**

1. The user presses `sin`, `4`, `5`, `)`, `+`, `log`, `1`, `0`, `0`, `)`, `=`. The expression line shows `sin(45) + log(100) =`. The display shows the 10-digit result (FR-9, FR-16).

**Flow F: Error**

1. The user presses `5`, `÷`, `0`, `=`. The display shows `Error` (FR-13).
2. The user presses `7`. Nothing changes (FR-13).
3. The user presses `CE`. The display shows `0` and the expression is cleared (FR-13).

**Flow G: Correcting an entry**

1. The user presses `sin`, `1`, `2`, `3`. The expression shows `sin(123`.
2. The user presses `⌫`. The expression shows `sin(12` (FR-15).
3. The user presses `⌫` twice more. The expression shows `sin(` and then nothing (FR-15).

**Flow H: Continue after equals**

1. The user presses `8`, `+`, `4`, `=`. The display shows `12` and the expression line shows `8 + 4 =` (FR-17).
2. The user presses `×`, `2`, `=`. The display shows `24` (FR-17).

**Flow I: Return to standard**

1. The user presses the `S` key left of `=` on the scientific keypad. The standard screen opens with its previous state (FR-2).

## 8. UI states

Based on the OpenPencil file `Demo.fig` (document `Demo`, page `Tour`), frame `iPhone - Scientific calculator`, node ID `0:267` (380 × 820). The frame has the sections Top Section (status bar, brand badge, display panel, mode selector bar) and Keypad Bed (keypad and home bar). Reference frame `Column - Scientific calculator` (node `0:265`) exists in the same file and is not used by this spec because the roadmap row names the iPhone frame. The `designs/` folder is not used.

| State                 | Description                                                                                                                                                                                                                 | OpenPencil reference                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Default               | Display shows the primary value (for example `2.70710678`) in `displayText`. Indicator row shows RAD selected, DEG dim, SCI selected, FIX dim. Mode selector shows COMP selected. Keys use the colour groups in the design. | `iPhone - Scientific calculator` (0:267); Display Panel (0:287); Mode Selector Bar (0:300) |
| Pressed               | Key shows a pressed style using palette tokens, with no new hardcoded values.                                                                                                                                               | Keypad Bed (0:312)                                                                         |
| Angle mode DEG        | `DEG` is selected and `RAD` is dim after the `deg` key is pressed (FR-5).                                                                                                                                                   | Indicator row in Display Panel (0:287)                                                     |
| 2nd armed             | The `2nd` key shows its armed state until the next function key or a second `2nd` press (FR-6). The design has no 2nd indicator. Decision in Open questions.                                                                | `2nd` key (keypad row 1)                                                                   |
| Expression pending    | Expression line shows the tokens typed so far, for example `sin(45) +` (FR-16). The operator in use is marked selected.                                                                                                     | Expression line in Display Panel                                                           |
| Result                | Expression line shows the completed expression and `=`, and the primary value shows the result (FR-17).                                                                                                                     | Display Panel                                                                              |
| Error                 | Primary value shows `Error`. All keys except `CE` are visually unchanged but ignored (FR-13). Error colour uses existing palette tokens; the design has no error state.                                                     | Not in design. Colour uses existing palette tokens.                                        |
| Disabled placeholders | STAT, BASE-N, MATRIX, CONVERTER, globe key, and atom key are disabled. They have no action (FR-3, FR-20, FR-21).                                                                                                            | Mode Selector Bar (0:300); globe (0:380 row), atom (0:389)                                 |
| Empty                 | Not applicable. The display always shows a value, starting at `0` (FR-1).                                                                                                                                                   | Not applicable                                                                             |
| Loading               | Not applicable. The calculator does no asynchronous work.                                                                                                                                                                   | Not applicable                                                                             |
| Long values           | The expression line and the primary value shrink the font using tokens, not a fixed size, so each stays on one line.                                                                                                        | Display Panel                                                                              |

## 9. Technical constraints

**Files to change**

- `src/domain/calculator.ts`: no change. The Step 1 engine is not modified.
- `src/components/calculator/ModeRow.tsx` (Step 1): enable the `SCIENTIFIC` button (FR-21). `CONVERTER` stays disabled.
- `src/app/index.tsx`: keep it a thin route. It renders the standard or scientific screen based on the mode state.
- `src/theme/tokens.ts` and `src/theme/palettes.ts`: only if the design needs a value the theme lacks. Add it there, never in components.
- `src/theme/__tests__/palettes.test.ts`: only if a new palette key is added. Keep the `sageClassic` and `midnightOled` keys identical.

**Files to create**

- `src/domain/scientific.ts`: scientific engine (state type, initial state, input reducer, tokenizer, evaluator).
- `src/domain/__tests__/scientific.test.ts`: engine unit tests.
- `src/components/calculator/ModeSelectorBar.tsx`: COMP, STAT, BASE-N, MATRIX row (FR-3).
- `src/components/calculator/IndicatorRow.tsx`: RAD, DEG, SCI, FIX indicators (FR-4).
- `src/components/calculator/ScientificKeypad.tsx`: 5-column keypad from the design (FR-6 to FR-15, FR-20).
- `src/components/calculator/ScientificDisplay.tsx`: brand badge, indicators, expression line, primary value.
- `src/features/scientific/ScientificScreen.tsx`: connects the engine to the display, keypad, and mode selector.
- `src/features/scientific/__tests__/ScientificScreen.test.tsx`: component tests.
- Existing components to reuse: `CalculatorKey.tsx`, `PlaceholderButton.tsx`, `CalculatorIcon.tsx` (globe and atom outlines), `Display.tsx` (Step 1). Reuse where they fit. Do not copy them.

**Design fidelity**

- Layout, key order, colour groups, and indicator states come from `iPhone - Scientific calculator` in `Demo.fig` (node `0:267`). Measured values are added to `src/theme/tokens.ts` where the theme lacks them.
- Font: Inter from Step 1 (`src/app/_layout.tsx`). No new font.
- Icons: `CalculatorIcon.tsx` from Step 1 draws the globe and atom outlines.
- The phone status bar and home indicator from the design are not reproduced, as in Step 1.

**Constraints**

- Business logic goes in `src/domain/` (pure TypeScript, no React imports).
- Styling uses tokens from `src/theme/`. No hardcoded colours, spacing, font sizes, or durations.
- Routes go in `src/app/`. Only the entry route is touched.
- Dependency direction: `app` → `features` → `components` / `hooks` / `domain` → `theme` / `lib`. `components` must not import from `features`.
- No new dependency. Use `useReducer` from React for screen state.
- No `any`, no non-null assertions, `noUncheckedIndexedAccess` stays on.
- No `console.log`.

## 10. Edge cases

- `sin(` at `=` with no argument: the result is `Error`.
- `(` with no `)` at `=`: closed automatically (FR-9).
- `2 + ` at `=`: the expression is evaluated with the trailing operator removed. Decision: no error; the last operand becomes the result. Confirm in Open questions.
- `÷ 0` inside a bracket group, for example `(1 ÷ 0) + 2 =`: `Error`.
- `0 ÷ 0`: `Error`.
- `√(-4)`: `Error`. `√(` followed by `−`: unary minus applies inside the root.
- `ln(0)`, `log(-1)`: `Error`.
- `sin⁻¹(2) =`: `Error`.
- `tan(90) =` in DEG: `Error`. `tan(π/2) =` in RAD: `Error`.
- `x²` after `π`: `π²` as expected. `x²` with no operand: ignored.
- `%` with no operand: ignored.
- `±` after `(` or an operator: ignored (no number being typed).
- `e` and `π` followed by a digit: the digit starts a new number token (an implicit multiply is not inserted). Decision: no implicit multiplication in this step.
- A result that rounds to `-0`: shown as `0`.
- Results smaller than `1e-10` in magnitude but not zero: shown as `0`. Same rule as Step 1 FR-14, using the 10-digit limit.
- `2nd` followed by `CE` or `⌫`: the arm stays. Only a function key, a second `2nd`, or the error reset clears it.
- Rotating the device: state is kept in React state, as in Step 1. Decision: no special handling.
- Very rapid key presses: each press is processed in order by the reducer, so no press is lost.

## 11. Acceptance criteria

Each criterion is checkable and maps to at least one test in section 12.

- [ ] AC-1: Given the standard screen, when the user presses `SCIENTIFIC`, then the scientific screen shows `0`, no expression, and RAD selected. (FR-1, FR-21)
- [ ] AC-2: Given the scientific screen, when the user presses STAT, BASE-N, or MATRIX, then nothing changes. (FR-3)
- [ ] AC-3: Given RAD is selected, when the user presses `deg`, then DEG is selected; pressing `deg` again selects RAD. (FR-5)
- [ ] AC-4: Given `2nd` is pressed then `sin`, then `sin⁻¹(` is appended and the `2nd` arm is cleared. (FR-6)
- [ ] AC-5: Given the keys `2`, `+`, `3`, `×`, the expression line shows `2 + 3 ×`. (FR-7, FR-16)
- [ ] AC-6: Given `2 + 3 × 4 =`, when `=` is pressed, then the display shows `14`. (FR-8)
- [ ] AC-7: Given `( 2 + 3 ) × 4 =`, when `=` is pressed, then the display shows `20`. (FR-8)
- [ ] AC-8: Given DEG is selected and `sin(30) =`, then the display shows `0.5`. (FR-5, FR-9)
- [ ] AC-9: Given `sin(30` with the bracket open, when `=` is pressed, then the call is closed and the display shows `0.5`. (FR-9)
- [ ] AC-10: Given `π × 2 =`, then the display shows `6.283185307`. (FR-10, FR-12)
- [ ] AC-11: Given `9 √` then `=`, then the display shows `3`; given `3 x² =`, then the display shows `9`. (FR-11)
- [ ] AC-12: Given `log(100) =`, then the display shows `2`; given `ln(e) =`, then the display shows `1`. (FR-9, FR-10)
- [ ] AC-13: Given `1 ÷ 3 =`, then the display shows `0.3333333333`. (FR-12)
- [ ] AC-14: Given `5 ÷ 0 =`, then the display shows `Error`. (FR-13)
- [ ] AC-15: Given `√(-4) =`, `ln(0) =`, or `2nd sin 2 =`, then the display shows `Error` in each case. (FR-13)
- [ ] AC-16: Given DEG is selected and `tan(90) =`, then the display shows `Error`. (FR-13)
- [ ] AC-17: Given the display shows `Error`, when the user presses `7`, then the display still shows `Error`. Pressing `CE` then shows `0` with no expression. (FR-13)
- [ ] AC-18: Given `12 + 34`, when `CE` is pressed, then the number `34` becomes `0` and the expression line shows `12 +`. (FR-14)
- [ ] AC-19: Given `123`, when `⌫` is pressed, then the entry shows `12`. Given `sin(`, when `⌫` is pressed, then `sin(` is removed as one token. (FR-15)
- [ ] AC-20: Given `8 + 4 =`, then the display shows `12` and the expression line shows `8 + 4 =`. Pressing `×` `2` `=` then shows `24`. (FR-17)
- [ ] AC-21: Given `5 0 %`, then the display shows `0.5`. (FR-7)
- [ ] AC-22: Given `5`, when `±` is pressed, then the display shows `-5`. Given `±` with no number being typed, then nothing changes. (FR-7)
- [ ] AC-23: Given `1234567.5` is formatted, then it shows `1,234,567.5`. (FR-16)
- [ ] AC-24: Given the scientific engine module, when its source is inspected, then it has no React or React Native import. (FR-19)
- [ ] AC-25: Given the standard screen, when the Step 1 engine tests run, then they still pass and `2 + 3 × 4 =` still shows `20` (left to right). (FR-19, Step 1 FR-5)
- [ ] AC-26: Given the scientific screen renders, when a screen reader inspects the keypad, then each key has an accessibility label that names its action, and `deg` and `2nd` expose selected state. (NFR-1)
- [ ] AC-27: Given the scientific screen renders, when each key's style is inspected, then its `minHeight` and `minWidth` are at least 48, except the disabled placeholders listed in NFR-2. (NFR-2)
- [ ] AC-28: Given the globe key or the atom key is pressed, then it is disabled and the display does not change. (FR-20)
- [ ] AC-29: Given the scientific screen renders, then the header shows `FX-990 SCIENTIFIC`, the badge shows `10-DIGIT` and `V.P.A.M.`, and the `FIX` indicator is dim. (FR-4, FR-22)
- [ ] AC-30: Given the scientific screen is open, when the user presses `STANDARD`, then the standard screen shows `0`. (FR-2)

## 12. Testing requirements

- Unit tests (`src/domain/__tests__/scientific.test.ts`): pure reducer calls with no rendering. Cover AC-5 to AC-23 and AC-24 (source inspection). Include precedence, brackets, DEG and RAD, the 10-digit rounding, every error case in FR-13, `CE`, `⌫`, and `%` and `±`. Include the number formatting helper for AC-23.
- Unit tests (`src/domain/__tests__/calculator.test.ts`, Step 1): AC-25 is covered by the existing Step 1 suite. Re-run it.
- Component tests (`src/features/scientific/__tests__/ScientificScreen.test.tsx`, `@testing-library/react-native`): cover AC-1, AC-2, AC-3, AC-4, AC-17, AC-20, AC-26, AC-27, AC-28, AC-29, AC-30. Use `fireEvent.press` on keys by accessibility label.
- Standard screen test (existing `src/__tests__/home-screen.test.tsx` or the Step 1 screen test): cover AC-1 (the `SCIENTIFIC` button opens scientific mode).
- Palette test: any new palette key is covered by `src/theme/__tests__/palettes.test.ts`. Re-run it.
- Manual checks on the Android emulator: start with `npm run android`. Enter `sin(30) =` in DEG and check `0.5`. Enter `2 + 3 × 4 =` and check `14`. Enter `5 ÷ 0 =` and check `Error`. Check the keypad layout against `iPhone - Scientific calculator` in `Demo.fig` (node `0:267`) in key order and roles. Record the result, because Android install-and-launch is not verified in `README.md` yet.
- Manual checks on iOS: not verified on this machine (see CLAUDE.md). Record as not run unless a build is available through EAS.
- Required before done: `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm test` all pass.

**Accessibility review (deferred, design fidelity first)**

- The design's `FIX` indicator and secondary indicator text are dim and may fail WCAG AA. Keep the design colours and list the pair here once measured.
- STAT, BASE-N, MATRIX, and the globe/atom keys are below 48 points if the design sizes them so. They are disabled placeholders and must be checked before they are enabled in a later step.

**Open questions**

- Default angle mode: the indicator row shows RAD selected, but the design's result `2.70710678` matches `sin(45°) + log(100)` in DEG. Should the default be RAD (as the indicator shows) or DEG?
- Return to standard: the design has no control to go back from scientific to standard. Is the `STANDARD` header control in FR-2 acceptable, or should another control be used?
- Display precision: the badge says `10-DIGIT`, but the design result `2.70710678` shows 9 significant digits. Should results round to 10 significant digits (this spec), or to 9 to match the design exactly?
- `2nd` secondary functions: this spec uses `sin⁻¹`, `cos⁻¹`, `tan⁻¹`, `eˣ` (on `ln`), and `10ˣ` (on `log`). Confirm this set, and confirm whether the design needs a visible `2nd` indicator.
- Percent in scientific mode: this spec uses `%` as a postfix `÷ 100` (AC-21). Step 1 uses percent of the left operand with a pending operation. Should scientific mode match Step 1 instead?
- Unclosed brackets at `=`: this spec closes them automatically (FR-9). Should `=` show `Error` instead?
- Trailing operator at `=` (for example `2 + =`): this spec drops the operator and evaluates `2` (Section 10). Should it show `Error` instead?
- Globe and atom keys: what do they do in the design? This spec keeps them as disabled placeholders (FR-20). The globe may be the Converter (Step 4). The atom meaning is unknown.
- Mode selector: COMP is the only active item. Should STAT, BASE-N, and MATRIX stay visible but disabled, or be hidden until their steps?
- Memory in scientific mode: the design has no memory keys. Should scientific mode share the Step 1 memory value, or have none (this spec: none)?
- Naming: the design uses the product name `FX-990` and `V.P.A.M.`. Should these labels be used as shown, or replaced with neutral text?
