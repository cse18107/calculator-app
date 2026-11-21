---
description: Create a spec file and feature branch for the next Calculator step
argument-hint: Step number and feature name e.g. 2 basic calculation
allowed-tools: Read, Write, Glob, Bash(git:*), mcp__open-pencil__list_documents, mcp__open-pencil__open_file, mcp__open-pencil__activate_document, mcp__open-pencil__get_page_tree, mcp__open-pencil__find_nodes, mcp__open-pencil__get_node, mcp__open-pencil__node_tree, mcp__open-pencil__render, mcp__open-pencil__export_image, mcp__open-pencil__get_jsx
---

You are a senior developer spinning up a new feature for the
Calculator mobile app. Always follow the rules in CLAUDE.md.

User input: $ARGUMENTS

All specs live in `.claude/specs/`. Do not create or use a `specs/` folder at the project root.

## Step 1 - Check working directory is clean

Run `git status` and check for uncommitted, unstaged, or untracked files.
If any exist, stop immediately and tell the user to commit or stash changes before
proceeding. DO NOT CONTINUE until the working directory is clean.

## Step 2 - Parse the arguments

From $ARGUMENTS extract:

1. `step_number` - zero-padded to 2 digits: 2 -> 02, 11 -> 11

2. `feature_title` - human readable title in Title Case
   - Example: "Basic Calculation" or "Scientific Mode"

3. `feature_slug` - git and file safe slug
   - Lowercase, kebab-case
   - Only a-z, 0-9 and -
   - Maximum 40 characters
   - Example: basic-calculation, scientific-mode

4. `branch_name` - format: `feature/<feature_slug>`
   - Example: `feature/basic-calculation`

If you cannot infer these from $ARGUMENTS, ask the user to clarify before proceeding.

## Step 3 - Check the step is not already done or blocked

Read `CLAUDE.md` and find the matching row in the Implementation Roadmap table.
- If the Status is `Done` or `Implemented`, warn the user and stop.
- If the step depends on another step (see the Status column), check that the dependency's
  spec in `.claude/specs/` has `Status: Approved` or `Status: Implemented`. If not, warn the user and stop.
- For the UI sections of the spec, always get the UI design from OpenPencil through the OpenPencil MCP tools (`mcp__open-pencil__*`), never from the `designs/` folder.
  - Find the OpenPencil file (currently `Demo.fig`) and the step's frame, using the frame name from the design reference in that row (for example, `Column - Calculation History`) or from the user.
  - Open the file with `mcp__open-pencil__open_file` if it is not already open, then `mcp__open-pencil__activate_document`.
  - Locate the frame with `mcp__open-pencil__find_nodes` or `mcp__open-pencil__get_page_tree`. Read its layout and measurements with `mcp__open-pencil__get_node` and `mcp__open-pencil__node_tree`, and use `mcp__open-pencil__get_jsx` for structure if useful.
  - Use `mcp__open-pencil__render` or `mcp__open-pencil__export_image` to view the screen visually.
  - If the file or frame cannot be found, ask the user and stop. Do not fall back to `designs/`.
  - Record the OpenPencil file name and frame name (with node ID) in the spec's UI states section.

## Step 4 - Check branch name is not taken

Run `git branch --list "<branch_name>"` and `git ls-remote --heads origin "<branch_name>"`.
If either returns a result, append a number and check again:
`feature/basic-calculation-01`, `feature/basic-calculation-02`, and so on.

## Step 5 - Switch to main and pull latest

Run:

```
git checkout main
git pull origin main
```

## Step 6 - Create and switch to feature branch

Run:

```
git checkout -b <branch_name>
```

## Step 7 - Research existing specs

Read:

- `CLAUDE.md` - roadmap, conventions, and critical rules.
- All files matching `.claude/specs/*.md` - avoid duplicating existing specs and reuse their terms.

## Step 8 - Write the spec

Create `.claude/specs/<step_number>-<feature_slug>.md` using exactly this structure.
Keep every section. Write `Not applicable` only when a section truly does not apply.

```markdown
# <feature_title>

Status: Draft
Step: <step_number>
Owner: TBD
Last updated: <today's date, YYYY-MM-DD>

## 1. Overview

One paragraph: what this feature does and why it exists at this point in the roadmap.

## 2. Goals

- Measurable outcome 1

## 3. Scope

**In scope**

- ...

**Out of scope**

- ...

## 4. Functional requirements

Numbered, testable statements. Use FR-1, FR-2, ...

## 5. Non-functional requirements

Performance, accessibility, platform differences (Android/iOS). Use NFR-1, NFR-2, ...

## 6. User stories

- As a <user>, I want <capability>, so that <benefit>.

## 7. User flows

Numbered steps from entry point to outcome, including branches.

## 8. UI states

Default, pressed, disabled, error, empty, loading, and feature-specific states.
Name the OpenPencil file and frame (from Step 3) that this section is based on. Do not reference files in `designs/`.

| State | Description | OpenPencil reference |
| ----- | ----------- | -------------------- |

## 9. Technical constraints

- Files to change (existing files this feature modifies)
- Files to create (new files this feature adds)
- Business logic goes in `src/domain/` (pure TypeScript, no React imports)
- Styling uses tokens from `src/theme/`. No hardcoded colours, spacing, font sizes, or durations.
- Routes go in `src/app/`. New dependencies only if the feature needs them.

## 10. Edge cases

- ...

## 11. Acceptance criteria

Each criterion is checkable and maps to at least one test in section 12.

- [ ] AC-1: Given ..., when ..., then ...

## 12. Testing requirements

- Unit tests (`src/domain/`): ...
- Component tests (`__tests__/`, `@testing-library/react-native`): ...
- Manual checks on the Android emulator: ...
- Open questions: any decision still unknown. Do not invent answers.
```

Rules for the spec:
- Write only this spec file. Do not create or edit code, the roadmap table, or any other file.
- Do not set `Status: Approved`. Only the user does that after review.
- Every acceptance criterion must map to at least one test.

## Step 9 - Report to the user

Print exactly this:

```
Branch: <branch_name>
Spec file: .claude/specs/<step_number>-<feature_slug>.md
Title: <feature_title>
```

Then tell the user:

"Review the spec at `.claude/specs/<step_number>-<feature_slug>.md`. When it is ready, change
`Status: Draft` to `Status: Approved`. Only then start implementation, using Plan Mode
(Shift+Tab twice)."

List any open questions from section 12 in your reply.

Do not print the full spec in chat unless explicitly asked.
