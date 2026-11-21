# Calculation History

Status: Approved
Step: 02
Owner: TBD
Last updated: 2026-11-21

## 1. Overview

This feature records each completed calculation made on the basic calculator, shows the most recent one on the display as a `HISTORY:` line, and adds a "Tape Record" screen that lists the session's calculations. From the list the user can pin, select, reuse a result in the calculator, share, or delete calculations. It is Step 2 of the roadmap. It builds on the Step 1 engine in `src/domain/`, which stays pure TypeScript with no React imports, and on the Step 1 display. Step 1 deferred both the display history line and the history list to this step (see `.claude/specs/01-standard-calculator.md`, section 3). The design is `designs/Column - Calculation History@1.5x.png`, with the display line taken from `designs/Column - Basic calculator@1.5x.png`.

## 2. Goals

- Every completed calculation from the basic calculator is recorded, and 100% of the recording rules in FR-1 to FR-8 are covered by unit tests.
- A user can reach any recorded calculation from the calculator in no more than two taps, and reuse its result in the calculator in one more tap.
- The Step 1 calculator behaviour is unchanged: all acceptance criteria AC-1 to AC-40 of `01-standard-calculator.md` still pass.
- Lint, typecheck, format check, and the full Jest suite pass before the feature is declared done.

## 3. Scope

**In scope**

- Recording completed calculations made with `=` (see FR-1 to FR-8) as history entries in `src/domain/`.
- The `HISTORY:` line on the display, showing the most recent entry.
- The Tape Record screen (a route in `src/app/`) with the entry list, the filter tabs (ALL, BASIC, SCIENTIFIC, PINNED), and the bottom action area from the design.
- Per-entry actions: select (checkbox), pin, and the card-level "USE" action.
- Bulk actions on the selection: PIN, USE IN CALC, SHARE, DELETE, SELECT ALL, CLEAR ALL, and BACK TO CALC.
- Session-only storage: entries live in memory while the app runs.
- Timestamp display: time of day for today, "Yesterday" for the previous day, and the date for older entries.
- Accessibility labels on every control on the screen.
- Styling through the existing `src/theme/` tokens. New palette keys are added only if the design needs a colour that is not in `palettes.ts`.
- A `HISTORY` button in the calculator's top row (right side, beside `AUTO POWER OFF`) that opens the Tape Record screen. This button is not in the basic calculator design; it was added on request (FR-10a).
- Icons in the design (pin, calculator, share, trash, corner arrow, close, check, filter) are drawn with the existing `CalculatorIcon` component (react-native-svg, already a dependency). Path data was exported from `Demo.fig`, frame `Column - Calculation History` (node `0:398`). No new dependency is added.

**Out of scope**

- Persisting history across app restarts. This needs a storage library, which is a new dependency, so it is deferred (see Open questions).
- Converter entries. The CONVERTER kind and its records belong to Step 4. The SCIENTIFIC filter shows an empty state until Step 3 adds scientific entries.
- The FILTER button in the header, which is shown in the design without a defined behaviour. It is a disabled placeholder in this step (FR-22).
- Editing an entry's expression or result.
- Exporting history to a file.
- Memory actions (MC, MR, M−, M+). They are not recorded in history.
- Error results. A calculation that shows `Error` is not recorded.

## 4. Functional requirements

**Recording**

- FR-1: Pressing `=` that evaluates a pending operation records one history entry. The entry holds the expression and the result shown on the display after the press. It is recorded only when the result is not an error.
- FR-2: The expression is the sequence of numbers and operators since the last result, in the order typed, ending with `=`. Operands use the same thousands separators as the display (for example, `1,250 + 4,890.5 =`). Operators use the display symbols `+`, `−`, `×`, `÷`.
- FR-3: For a chained calculation, the expression includes every operator and operand since the last result. Example: `2 × 3 + 4 =` records result `10`, as one entry.
- FR-4: When a percent key changes the right operand (FR-11 of Step 1), the expression shows the operand that was actually used. Example: `200 + 10 %` then `=` records expression `200 + 20 =` and result `220`.
- FR-5: Pressing `=` again without a new number (FR-7 of Step 1) records one new entry. Its expression is the previous result, the operator, the repeated operand, and `=`. Example: after `2 × 3 =`, pressing `=` records `6 × 3 =` with result `18`.
- FR-6: Pressing a key other than `=` never records an entry. Operators, digits, percent, sign change, CE, backspace, and memory actions do not record anything.
- FR-7: New entries are added at the top of the list. The most recent entry is first.
- FR-8: The list holds at most 100 unpinned entries. When an 101st unpinned entry is recorded, the oldest unpinned entry is removed. Pinned entries are never removed by this limit.

**Display line**

- FR-9: While at least one entry exists, the display shows a `HISTORY:` line above the pending expression line, with the most recent entry's expression and result (example: `HISTORY: 450 × 8 = 3,600`). With no entries, the line is not shown.
- FR-10: The `HISTORY:` line is a control. Pressing it opens the Tape Record screen.
- FR-10a: The calculator's top row has a `HISTORY` button on its right side, beside `AUTO POWER OFF`. Pressing it opens the Tape Record screen. It is always enabled, including when there are no entries (the list then shows the empty state, FR-26).

**Tape Record screen**

- FR-11: The Tape Record screen is a route in `src/app/` and is pushed from the calculator. Its header reads `TAPE RECORD`.
- FR-12: Each entry card shows: its kind label (BASIC), its timestamp (FR-19), a pin icon that shows whether the entry is pinned, its expression, its result, a select checkbox, and a `USE` button.
- FR-13: The filter tabs ALL, BASIC, SCIENTIFIC, and PINNED show, respectively, all entries, entries with kind BASIC, entries with kind SCIENTIFIC, and pinned entries. ALL is selected by default. The selected tab is highlighted.
- FR-14: Changing the filter clears the selection.
- FR-15: Tapping a checkbox selects or deselects that entry. Selecting an entry does not change the calculator.
- FR-16: `SELECT ALL` selects every entry visible under the current filter.
- FR-17: The action area shows `N items selected` (or `No items selected` when N is 0). `PIN`, `USE IN CALC`, `SHARE`, and `DELETE` are enabled only when at least one entry is selected. `BACK TO CALC` and `CLEAR ALL` are always enabled.
- FR-18: `PIN` toggles the pin state of the selected entries. If at least one selected entry is unpinned, all selected entries become pinned. If all selected entries are pinned, all become unpinned.
- FR-19: Timestamps: an entry from the current calendar day shows its time (for example `9:41 AM`), an entry from the previous calendar day shows `Yesterday`, and any older entry shows its date. Timestamps are formatted from the time the entry was recorded and the current time, both passed in as values.
- FR-20: `USE` on a card, and `USE IN CALC` with a selection, place the entry's result into the calculator and return to the calculator screen. The result is placed as if it had been recalled from memory (FR-23 of Step 1): after the calculator shows a result it starts a new calculation, and with a pending operator it becomes the right operand. When several entries are selected, `USE IN CALC` uses the first selected entry in list order (the newest one).
- FR-21: `SHARE` opens the native share sheet with the selected entries as text, one entry per line, in the form `<expression> <result>`. It uses the React Native `Share` API and adds no dependency.
- FR-22: `FILTER` is a disabled placeholder. Pressing it does nothing.
- FR-23: `DELETE` removes the selected entries after the user confirms in a dialog. Cancelling keeps them.
- FR-24: `CLEAR ALL` removes every entry, pinned or not, after the user confirms in a dialog. Cancelling keeps them.
- FR-25: `BACK TO CALC` returns to the calculator screen. The selection is cleared.
- FR-26: With no entries, the list area shows the empty state `No calculations yet`. A filter with no matching entries shows `No <filter name> calculations yet` (for example `No scientific calculations yet`).

**Session and state**

- FR-27: History is held in memory only. Closing and restarting the app empties it.
- FR-28: The history feature does not change memory, and the Tape Record screen does not change the calculator state except through `USE` and `USE IN CALC` (FR-20).
- FR-29: The calculator state and the history state are one `AppState` (`calc`, `memory`, `history`), held by a single React context provider (`AppStateProvider`) mounted in `src/app/_layout.tsx`. The calculator screen and the Tape Record screen both read it. No new state library is added. The history state is inside `AppState` so that recording a completed calculation happens in the pure reducer, with no effects.

## 5. Non-functional requirements

- NFR-1 (Accessibility): every control has an accessibility label that names its action. Examples: "Select calculation 1,250 + 4,890.5 equals 6,140.5", "Pin calculation", "Use result 6,140.5", "Filter: pinned". Checkboxes expose a checked or unchecked state. The `HISTORY:` line is announced as a button.
- NFR-2 (Accessibility): every tappable control has a touch target of at least `dimensions.minTouchTarget` (48) points. The design's smaller controls (filter tabs, pin icon, checkbox, USE button) are enlarged to meet this, using their padding and hit slop, without changing their visual size.
- NFR-3 (Accessibility): text on the screen meets WCAG AA contrast (4.5:1) against its background. Any new palette pair is added to the palette test in the same change.
- NFR-4 (Performance): the list holds up to 100 unpinned entries plus any pinned entries and scrolls at 60 fps on a mid-range Android device. The list uses a virtualised list (`FlatList`).
- NFR-5 (Performance): recording an entry on `=` updates the display within one frame. Recording does no work proportional to the number of entries beyond inserting the new entry and applying the limit in FR-8.
- NFR-6 (Platform): the screen fits a phone in portrait orientation on Android and iOS and respects the safe area. Confirmation dialogs and the share sheet use React Native core APIs (`Alert`, `Share`) that work on both platforms.
- NFR-7 (Platform): fonts, colours, and sizes come from theme tokens read through `useTheme()`. `ThemeProvider` currently always returns the light theme (no dark design exists yet), so this feature is verified in the light theme only. Dark mode behaviour follows whenever `ThemeProvider` changes.

## 6. User stories

- As a user, I want my completed calculations listed, so that I can check an earlier result.
- As a user, I want to see my last calculation above the display, so that I can recall it without opening a list.
- As a user, I want to reuse a result from the list in the calculator, so that I can continue a calculation without retyping it.
- As a user, I want to pin calculations I use often, so that I can find them using the PINNED filter.
- As a user, I want to delete or clear calculations I no longer need, so that the list stays tidy.
- As a user, I want to share a calculation, so that I can send the result to someone else.
- As a screen-reader user, I want each entry and action to announce what it is and whether it is selected, so that I can use the list without seeing it.

## 7. User flows

**Flow A: Record and view the last calculation**

1. The user enters `1,250 + 4,890.50` and presses `=`. The display shows `6,140.5`, and a `HISTORY:` line shows `1,250 + 4,890.50 = 6,140.5` (FR-1, FR-9).
2. The user presses the `HISTORY:` line. The Tape Record screen opens with the entry at the top (FR-10, FR-11, FR-7).

**Flow B: Reuse a result**

1. On the Tape Record screen, the user presses `USE` on an entry showing `6,140.5`.
2. The app returns to the calculator. The display shows `6,140.5` as a new result (FR-20).
3. The user presses `+` and `1`, then `=`. The display shows `6,141.5`.

**Flow C: Pin and filter**

1. The user selects two entries and presses `PIN`. Both are pinned (FR-18).
2. The user presses the PINNED tab. Only the two pinned entries are listed (FR-13).

**Flow D: Delete with confirmation**

1. The user selects an entry and presses `DELETE`. A dialog asks the user to confirm (FR-23).
2. The user presses Cancel. Nothing is removed and the selection stays.
3. The user presses `DELETE` again and confirms. The entry is removed.

**Flow E: Clear all**

1. The user presses `CLEAR ALL`. A dialog asks the user to confirm (FR-24).
2. The user confirms. The list shows `No calculations yet` (FR-26).

**Flow F: Share**

1. The user selects two entries and presses `SHARE`. The native share sheet opens with the two entries as text (FR-21).

**Flow G: Error is not recorded**

1. The user enters `5 ÷ 0 =`. The display shows `Error` (Step 1 FR-15). No entry is recorded (FR-1).

## 8. UI states

Based on `designs/Column - Calculation History@1.5x.png` (Tape Record screen) and `designs/Column - Basic calculator@1.5x.png` (the `HISTORY:` line on the display).

| State                            | Description                                                                                                            | Design reference                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Display line hidden              | No entries exist, so the `HISTORY:` line is not shown.                                                                 | `Column - Basic calculator@1.5x.png`                             |
| Display line shown               | Shows the most recent entry as `HISTORY: <expression> <result>` above the pending expression line.                     | `Column - Basic calculator@1.5x.png`                             |
| Entry default                    | Card with kind label, timestamp, pin icon, expression, result, unchecked checkbox, and `USE` button.                   | `Column - Calculation History@1.5x.png`                          |
| Entry selected                   | Checkbox checked and card outlined in the accent colour.                                                               | `Column - Calculation History@1.5x.png` (the two selected cards) |
| Entry pinned                     | Pin icon in the accent colour, lit. Unpinned entries show the pin icon dimmed.                                         | `Column - Calculation History@1.5x.png`                          |
| Filter tab selected / unselected | Selected tab uses the dark fill and light text. Unselected tabs use the muted fill.                                    | `Column - Calculation History@1.5x.png`                          |
| Filter placeholder (FILTER)      | Disabled. Dimmed, no action (FR-22).                                                                                   | `Column - Calculation History@1.5x.png`                          |
| Action area, no selection        | Text reads `No items selected`. PIN, USE IN CALC, SHARE, DELETE disabled (dimmed). BACK TO CALC and CLEAR ALL enabled. | Derived from `Column - Calculation History@1.5x.png` (FR-17)     |
| Action area, with selection      | Text reads `N items selected` and SELECT ALL. Actions enabled.                                                         | `Column - Calculation History@1.5x.png`                          |
| Pressed                          | Action buttons and cards show pressed feedback from theme tokens. The button's face drops by its shadow depth.         | `Column - Calculation History@1.5x.png`                          |
| Empty                            | No entries: `No calculations yet`.                                                                                     | Derived (FR-26)                                                  |
| Empty filter                     | A filter with no matching entries: `No <filter name> calculations yet`.                                                | Derived (FR-26)                                                  |
| Confirmation dialog              | Shown for DELETE and CLEAR ALL with Cancel and Confirm actions (FR-23, FR-24).                                         | Derived (no design file)                                         |
| Error (calculator)               | An error result is not recorded, and the `HISTORY:` line keeps the previous entry.                                     | Derived (Step 1 FR-15)                                           |
| Loading                          | Not applicable. History is held in memory and is available immediately.                                                | Not applicable                                                   |

## 9. Technical constraints

**Files to change (existing)**

- `src/domain/calculator.ts`: add `tokens` (committed operands and operators of the current calculation, FR-2 to FR-5) and `lastCompletion` (set only by a successful `=`). Existing fields and results must not change (AC-33).
- `src/domain/memory.ts`: `AppState` gains `history`. `appReducer` delegates history actions to `historyReducer` and records a completed calculation when `calc.lastCompletion` changes identity.
- `src/features/calculator/CalculatorScreen.tsx`: read state from `AppStateProvider` instead of a local `useReducer`. Pass the `HISTORY:` line and the header button handler to the display and top row (FR-9, FR-10, FR-10a).
- `src/components/calculator/Display.tsx`: accept and render the `HISTORY:` line above the pending expression. It is a control (FR-10).
- `src/components/calculator/BrandBadge.tsx`: accept an optional trailing slot so the header button sits on the right of the top row (FR-10a).
- `src/app/_layout.tsx`: mount `AppStateProvider` (FR-29). The `history` route is registered by file.
- `src/__tests__/home-screen.test.tsx` and `src/features/calculator/__tests__/CalculatorScreen.test.tsx`: wrap renders in `AppStateProvider`, since the calculator now needs it.
- `src/theme/palettes.ts` and `src/theme/tokens.ts`: only if the design needs a colour or size that is not already a token. Add to both palettes together, and keep the keys identical (CLAUDE.md).
- `src/theme/__tests__/palettes.test.ts`: only if palette keys change.

**Files to create (new)**

- `src/domain/history.ts`: pure TypeScript. Entry type, `historyReducer` (record with limit FR-8, filter FR-13, selection FR-14 to FR-16, pin FR-18, delete and clear FR-23, FR-24), `visibleEntries`, `formatTimestamp` (FR-19, `now` passed in), `historyLine` (FR-9), `shareText` (FR-21), `firstSelectedForUse` (FR-20). Entry IDs come from a counter in the state, so the reducer stays pure.
- `src/domain/__tests__/history.test.ts`: unit tests.
- `src/features/calculator/AppStateProvider.tsx`: provider. Holds `AppState` in `useReducer` and stamps each action with `Date.now()` before calling `appReducer`.
- `src/features/calculator/useAppState.ts`: context and hook for `AppState` and dispatch.
- `src/features/history/TapeRecordScreen.tsx`: the screen component (named export, one component per file).
- `src/app/history.tsx`: route file. Renders `TapeRecordScreen`. It contains no logic.
- `src/features/history/HistoryCard.tsx`: one entry card.
- `src/features/history/FilterTabs.tsx`: the four filter tabs.
- `src/features/history/SelectionActionBar.tsx`: the selection text and action buttons.
- `src/components/calculator/HistoryButton.tsx`: the header `HISTORY` button (FR-10a).
- `src/features/history/__tests__/TapeRecordScreen.test.tsx`: component tests.

**Design source and implementation notes (added after implementation started)**

- Design source is `Demo.fig` (OpenPencil), frame `Column - Calculation History` (node `0:398`), not only the PNG. Measurements used: tabs 81×26 in a 32pt bar; action tiles 73.5×56 with a hard edge; bottom bar buttons 157×32; entry cards 328 wide with 1px borders (2px when selected); the list panel uses `displayBackground`.
- New palette keys `historyCard` and `historyCardBorder` (both palettes), taken from the Demo card fill and stroke.
- New layout tokens: `dimensions.historyButtonHeight` (26), `historyTabHeight` (26), `historyActionTileHeight` (56), `historyBarButtonHeight` (32). Small visual targets use `touchSlop` (`src/lib/touchTarget.ts`) to reach 48pt.
- New files: `src/features/history/ActionTile.tsx` (tile and bar buttons), `src/features/calculator/AppStateProvider.tsx`, `src/features/calculator/useAppState.ts`. `CalculatorIcon.tsx` gained eight icons.
- Demo shows results as `3,600.00` and `6,140.50` and `2.70710678`. The implementation keeps the calculator format (see the resolved decisions below). This conflicts with the Demo and needs a decision.

**Constraints**

- Business logic (recording, pinning, filtering, limit, timestamp formatting) lives in `src/domain/`. Components only dispatch actions and render.
- `src/domain/` imports nothing from React, React Native, or `src/features/`.
- `src/features/` imports from `components/`, `hooks/`, and `domain/`. Components do not import from `features/`. `import/no-cycle` must pass.
- Styling uses tokens from `src/theme/`. No hardcoded colours, spacing, font sizes, or durations.
- No new dependencies. Share uses React Native `Share`, dialogs use `Alert`, and state uses React context. Session-only storage needs no library.
- Routes go in `src/app/`. The route file only renders the feature screen.

## 10. Edge cases

- `=` pressed with no pending operation and no repeat operation: nothing is recorded (FR-6).
- `=` pressed while the display shows an error: nothing is recorded (FR-1).
- Division by zero followed by `=`: error, not recorded (Step 1 FR-15).
- Result too large for the display: error, not recorded (FR-1).
- A result that rounds to 12 significant digits: the recorded result uses the rounded value shown on the display.
- An entry recorded while the list is at the 100 unpinned limit: the oldest unpinned entry is removed (FR-8). If every entry is pinned, the new entry is added and the list grows beyond 100 (pinned entries are not limited).
- `USE` on an entry while the calculator shows a pending operator: the result becomes the right operand (FR-20).
- `PIN` on a mixed selection (some pinned, some not): all become pinned (FR-18).
- Changing the filter while entries are selected: the selection is cleared (FR-14).
- Selecting entries, then pressing `BACK TO CALC`: the selection is cleared (FR-25).
- `CLEAR ALL` with pinned entries: pinned entries are removed too, after confirmation (FR-24).
- An entry from before midnight, shown after midnight: it reads `Yesterday` (FR-19).
- An entry older than yesterday: it shows its date, not `Yesterday`.
- Very long expression (for example, 12 digits and many operators): the text wraps to a second line and does not clip the result.
- Device rotated: not applicable beyond the portrait layout in NFR-6.
- App restarted: history is empty (FR-27).
- Share with no selection: `SHARE` is disabled, so it cannot run (FR-17).

## 11. Acceptance criteria

Each criterion is checkable and maps to at least one test in section 12.

- [ ] AC-1: Given the display shows `2 × 3`, when the user presses `=`, then one entry is recorded with expression `2 × 3 =` and result `6`. (FR-1, FR-2)
- [ ] AC-2: Given the user enters `2 × 3 + 4`, when the user presses `=`, then one entry is recorded with expression `2 × 3 + 4 =` and result `10`. (FR-3)
- [ ] AC-3: Given the user has pressed `2 × 3 =`, when the user presses `=` again, then a second entry is recorded with expression `6 × 3 =` and result `18`. (FR-5)
- [ ] AC-4: Given the user enters `200 + 10 %`, when the user presses `=`, then the entry is `200 + 20 =` with result `220`. (FR-4)
- [ ] AC-5: Given the display shows `Error` after `5 ÷ 0`, when the user presses `=`, then no entry is recorded. (FR-1, Edge cases)
- [ ] AC-6: Given the user presses digits, operators, `%`, `±`, `CE`, backspace, and memory keys without `=`, then no entry is recorded. (FR-6)
- [ ] AC-7: Given the user enters `1250 + 4890.5 =`, then the entry expression reads `1,250 + 4,890.5 =` and the result reads `6,140.5`. (FR-2)
- [ ] AC-8: Given two entries are recorded, then the newer entry is listed first. (FR-7)
- [ ] AC-9: Given 101 unpinned entries are recorded, then 100 unpinned entries remain and the oldest is removed. Given pinned entries exist, then they are not removed by the limit. (FR-8)
- [ ] AC-10: Given at least one entry exists, then the display shows `HISTORY:` with the most recent entry. Given no entries exist, then the line is hidden. (FR-9)
- [ ] AC-11: Given the `HISTORY:` line is shown, when the user presses it, then the Tape Record screen opens. (FR-10, FR-11)
- [ ] AC-12: Given the Tape Record screen opens, then the header reads `TAPE RECORD`, the ALL tab is selected, and each card shows its kind, timestamp, pin state, expression, result, checkbox, and USE button. (FR-11, FR-12, FR-13)
- [ ] AC-13: Given the user selects entries, then the action area reads `N items selected`. Given no selection, it reads `No items selected`, and PIN, USE IN CALC, SHARE, and DELETE are disabled. (FR-17)
- [ ] AC-14: Given the BASIC tab is selected, then only BASIC entries are listed. Given the PINNED tab is selected, then only pinned entries are listed. Given the SCIENTIFIC tab is selected with no scientific entries, then `No scientific calculations yet` is shown. (FR-13, FR-26)
- [ ] AC-15: Given entries are selected, when the user changes the filter, then the selection is empty. (FR-14)
- [ ] AC-16: Given the user presses `SELECT ALL` with the ALL tab selected, then every entry is selected. (FR-16)
- [ ] AC-17: Given one unpinned and one pinned entry are selected, when the user presses PIN, then both are pinned. Given both are pinned, when the user presses PIN, then both are unpinned. (FR-18)
- [ ] AC-18: Given an entry was recorded now, its timestamp reads its time. Given it was recorded yesterday, it reads `Yesterday`. Given it was recorded two days ago, it reads its date. (FR-19)
- [ ] AC-19: Given an entry with result `6,140.5` is selected, when the user presses USE IN CALC, then the calculator shows `6,140.5` and the Tape Record screen closes. (FR-20)
- [ ] AC-20: Given the calculator shows a pending `+` with left operand `1`, when the user presses USE on an entry with result `5`, then the display shows `5` as the right operand. (FR-20)
- [ ] AC-21: Given two entries are selected, when the user presses USE IN CALC, then the first selected entry in list order is placed in the calculator. (FR-20)
- [ ] AC-22: Given entries are selected, when the user presses SHARE, then the native share sheet is opened with each entry on its own line in the form `<expression> <result>`. (FR-21)
- [ ] AC-23: Given the user presses FILTER, then nothing changes. (FR-22)
- [ ] AC-24: Given entries are selected, when the user presses DELETE and cancels the dialog, then the entries remain. When the user confirms, then the selected entries are removed. (FR-23)
- [ ] AC-25: Given entries exist, when the user presses CLEAR ALL and confirms, then all entries are removed, including pinned entries, and the list shows `No calculations yet`. When the user cancels, then nothing is removed. (FR-24, FR-26)
- [ ] AC-26: Given entries are selected, when the user presses BACK TO CALC, then the calculator screen is shown and the selection is empty. (FR-25)
- [ ] AC-27: Given history actions run, then memory is unchanged and the calculator state is unchanged except after USE or USE IN CALC. (FR-28)
- [ ] AC-28: Given the app is restarted, then the history is empty. (FR-27)
- [ ] AC-29: Given the list is empty, then `No calculations yet` is shown. (FR-26)
- [ ] AC-30: Given the screen renders, then each checkbox exposes its checked state and each control has the accessibility label in NFR-1. (NFR-1)
- [ ] AC-31: Given the screen renders, then each tappable control has a hit area of at least 48 points. (NFR-2)
- [ ] AC-32: Given the palette changes, then each text pair used on the screen meets 4.5:1 contrast. (NFR-3)
- [ ] AC-33: Given the Step 1 calculator behaviour, then all AC-1 to AC-40 of `01-standard-calculator.md` still pass. (Goals)
- [ ] AC-34: Given the calculator screen, when the user presses the header `HISTORY` button, then the Tape Record screen opens. The button is enabled with no entries. (FR-10a)
- [ ] AC-35: Given the user presses `=` with nothing pending, or `=` while the display shows an error, then no entry is recorded and the history is unchanged. (FR-1, FR-6)

## 12. Testing requirements

- Unit tests (`src/domain/__tests__/calculator.test.ts`, extended): cover AC-1 to AC-7 at the engine level. Include the chained case `2 × 3 + 4 =`, the percent operand case `200 + 10 %`, the repeated equals case, and the error case. Assert that Step 1 results are unchanged (AC-33).
- Unit tests (`src/domain/__tests__/history.test.ts`): cover AC-8 to AC-10, AC-17 (pin logic), AC-18 (timestamp formatting, with `now` passed in), AC-14 (filter logic), and the limit in AC-9. Include the boundary at 100 and 101 unpinned entries and pinned entries beyond the limit.
- Unit tests (`src/domain/__tests__/history.test.ts`): cover AC-24 and AC-25 at the state level (delete selected, clear all), and AC-15 (selection clears on filter change).
- Component tests (`src/features/history/__tests__/TapeRecordScreen.test.tsx`, `@testing-library/react-native`): cover AC-11 (open from display line), AC-12, AC-13, AC-16, AC-19, AC-20, AC-21, AC-22 (mock `Share.share`), AC-23, AC-24 and AC-25 (mock `Alert.alert` and press its buttons), AC-26, AC-27, AC-29, and AC-30 (accessibility labels and checked state). Use `fireEvent.press` on controls by accessibility label.
- Component tests (`src/features/calculator/__tests__/CalculatorScreen.test.tsx`, extended): cover AC-10 (display line shown and hidden) and AC-28 (a fresh provider mount starts empty).
- Layout test: AC-31 (hit area) by checking the layout of each tappable control.
- Palette test: AC-32 is covered by `src/theme/__tests__/palettes.test.ts`. Extend the pairs list there if new text colours are added.
- Regression: AC-33 runs the existing `src/domain/__tests__/calculator.test.ts`, `memory.test.ts`, and `src/features/calculator/__tests__/CalculatorScreen.test.tsx`.
- Manual checks on the Android emulator (`npm run android`): record `1250 + 4890.5 =`, check the `HISTORY:` line shows `1,250 + 4,890.5 = 6,140.5`, open the Tape Record screen, use the result, pin, filter, share, delete with confirm and cancel, clear all, and check the layout against `designs/Column - Calculation History@1.5x.png` on a small and a large phone emulator. Record the result. Android install-and-launch is not yet verified in `README.md`.
- Manual checks on iOS: not verified on this machine (see CLAUDE.md). Record as not run unless a build is available through EAS.
- Required before done: `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm test` all pass.

**Verification status (not yet run)**

- The Tape Record component tests and the calculator history tests were written but not run after the Demo restyle, because the owner asked for no test runs in this session. Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run format:check` before marking the feature done.
- The palette test was not extended for the new text pairs on the Tape Record screen (`memoryKeyText/memoryKey`, `keyMode/border`, `keyDanger/keyFunction`, `memoryBar/historyCard`, and similar). NFR-3 is therefore not yet verified for those pairs.

**Resolved decisions (approved 2026-11-21)**

- Persistence: session-only (FR-27). Persisting would need a new storage dependency, deferred.
- Result format: the calculator format (`6,140.5`), not the design's fixed two decimals.
- Repeated `=` records a new entry (FR-5).
- USE IN CALC with several selected: first selected entry in list order (FR-20).
- Entry point: the `HISTORY:` line on the display (FR-10) and the header `HISTORY` button (FR-10a).
- FILTER: disabled placeholder (FR-22).
- Pinned entries keep their recorded position (FR-7).
- Limit: 100 unpinned entries (FR-8).
- DELETE and CLEAR ALL ask for confirmation (FR-23, FR-24).
- SCIENTIFIC filter is empty until Step 3. Converter entries are not recorded until Step 4.
- Accessibility exception: the `HISTORY:` line uses `displayHistoryText`, which is below 4.5:1 on the design's background. It is listed as a documented design gap in `palettes.test.ts`, like the Step 1 gaps.

**Open questions**

None open. The items below are kept for the record.

- **Persistence (resolved).** This draft keeps history in memory only (FR-27), matching Step 1's no-persistence rule. Should history survive app restarts? That needs a storage library such as `@react-native-async-storage/async-storage` installed with `npx expo install`, which is a new dependency. Decide before implementation.
- **Result format.** The design shows `3,600.00` and `6,140.50` with two decimal places, but the calculator display shows `6,140.5` (Step 1 FR-16). This draft uses the calculator's format for both. Should history use fixed two decimals instead?
- **Repeated equals.** FR-5 records every `=` that repeats an operation, which can add many similar entries. Should repeated equals record, or only the first `=`?
- **Multiple selection with USE IN CALC.** FR-20 uses the first selected entry in list order. Should it be disabled when more than one entry is selected instead?
- **Entry point.** This draft opens the Tape Record screen from the `HISTORY:` line only. Is a visible button needed as well? The basic calculator design has none.
- **FILTER button.** It is a disabled placeholder (FR-22). Should it be hidden instead, or given a behaviour in this step?
- **Pinned order.** FR-7 keeps pinned entries in their recorded position. Should pinned entries move to the top?
- **Limit.** FR-8 sets the unpinned limit at 100. Is 100 the right number?
- **Confirmation.** FR-23 asks for confirmation before DELETE. Should DELETE act immediately, as in the design's direct action bar?
- **Scientific and Converter entries.** The SCIENTIFIC filter is empty until Step 3, and CONVERTER entries are not recorded until Step 4. Confirm that this is acceptable for Step 2.
