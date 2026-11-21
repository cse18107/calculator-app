/**
 * Calculation history ("Tape Record"). Pure TypeScript: no React or React Native imports.
 *
 * Entries are recorded when `=` completes a calculation. The reducer assigns IDs from a
 * counter in the state and takes times as values, so every transition is deterministic.
 */

import { formatNumber } from './calculator';

export type HistoryKind = 'basic' | 'scientific';

export type HistoryFilter = 'all' | 'basic' | 'scientific' | 'pinned';

export type HistoryEntry = {
  id: string;
  kind: HistoryKind;
  /** Display-formatted expression ending with "=", e.g. "1,250 + 4,890.5 =". */
  expression: string;
  /** Plain decimal string of the result, e.g. "6140.5". */
  result: string;
  createdAt: number;
  pinned: boolean;
};

export type HistoryState = {
  /** Newest first. */
  entries: HistoryEntry[];
  filter: HistoryFilter;
  selectedIds: string[];
  /** Counter for the next entry ID. */
  nextId: number;
};

export type HistoryAction =
  | { type: 'record'; expression: string; result: string; createdAt: number }
  | { type: 'setFilter'; filter: HistoryFilter }
  | { type: 'toggleSelect'; id: string }
  | { type: 'selectAllVisible' }
  | { type: 'clearSelection' }
  | { type: 'pinSelected' }
  | { type: 'deleteSelected' }
  | { type: 'clearAll' };

/** Maximum number of unpinned entries kept (FR-8). Pinned entries are never removed by the limit. */
export const HISTORY_LIMIT = 100;

const DAY_MS = 24 * 60 * 60 * 1000;

export const initialHistoryState: HistoryState = {
  entries: [],
  filter: 'all',
  selectedIds: [],
  nextId: 1,
};

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'record': {
      const entry: HistoryEntry = {
        id: String(state.nextId),
        kind: 'basic',
        expression: action.expression,
        result: action.result,
        createdAt: action.createdAt,
        pinned: false,
      };
      return { ...state, entries: applyLimit([entry, ...state.entries]), nextId: state.nextId + 1 };
    }
    case 'setFilter':
      return { ...state, filter: action.filter, selectedIds: [] };
    case 'toggleSelect': {
      const selectedIds = state.selectedIds.includes(action.id)
        ? state.selectedIds.filter((id) => id !== action.id)
        : [...state.selectedIds, action.id];
      return { ...state, selectedIds };
    }
    case 'selectAllVisible':
      return { ...state, selectedIds: visibleEntries(state).map((entry) => entry.id) };
    case 'clearSelection':
      return { ...state, selectedIds: [] };
    case 'pinSelected':
      return { ...state, entries: applyLimit(pinSelected(state)) };
    case 'deleteSelected':
      return {
        ...state,
        entries: state.entries.filter((entry) => !state.selectedIds.includes(entry.id)),
        selectedIds: [],
      };
    case 'clearAll':
      return { ...state, entries: [], selectedIds: [] };
  }
}

/** Entries shown under the current filter, in list order. */
export function visibleEntries(state: HistoryState): HistoryEntry[] {
  switch (state.filter) {
    case 'all':
      return state.entries;
    case 'pinned':
      return state.entries.filter((entry) => entry.pinned);
    case 'basic':
    case 'scientific':
      return state.entries.filter((entry) => entry.kind === state.filter);
  }
}

/** Entries that are currently selected, in list order. */
export function selectedEntries(state: HistoryState): HistoryEntry[] {
  return state.entries.filter((entry) => state.selectedIds.includes(entry.id));
}

/**
 * The entry that USE IN CALC applies: the first selected entry in list order (FR-20),
 * or null when nothing is selected.
 */
export function firstSelectedForUse(state: HistoryState): HistoryEntry | null {
  return selectedEntries(state)[0] ?? null;
}

/**
 * The most recent entry as the display's history line, e.g. "450 × 8 = 3,600" (FR-9).
 * Null when there are no entries.
 */
export function historyLine(entries: readonly HistoryEntry[]): string | null {
  const latest = entries[0];
  return latest === undefined ? null : `${latest.expression} ${formatNumber(latest.result)}`;
}

/** Text for the share sheet: one "<expression> <result>" per line (FR-21). */
export function shareText(entries: readonly HistoryEntry[]): string {
  return entries.map((entry) => `${entry.expression} ${formatNumber(entry.result)}`).join('\n');
}

/**
 * Time of day for today, "Yesterday" for the previous calendar day, and the date otherwise (FR-19).
 * Both times are passed in, so the output is deterministic for a given `now`.
 */
export function formatTimestamp(createdAt: number, now: number): string {
  const created = new Date(createdAt);
  const days = Math.round((startOfDay(now) - startOfDay(createdAt)) / DAY_MS);

  if (days === 0) {
    return created.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (days === 1) {
    return 'Yesterday';
  }
  return created.toLocaleDateString();
}

function startOfDay(time: number): number {
  const date = new Date(time);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Pins all selected entries if any is unpinned; otherwise unpins them all (FR-18). */
function pinSelected(state: HistoryState): HistoryEntry[] {
  const selected = selectedEntries(state);
  const pin = selected.some((entry) => !entry.pinned);
  return state.entries.map((entry) => (state.selectedIds.includes(entry.id) ? { ...entry, pinned: pin } : entry));
}

/** Removes the oldest unpinned entries until at most HISTORY_LIMIT unpinned entries remain (FR-8). */
function applyLimit(entries: HistoryEntry[]): HistoryEntry[] {
  let excess = entries.filter((entry) => !entry.pinned).length - HISTORY_LIMIT;
  if (excess <= 0) {
    return entries;
  }

  const dropIds = new Set<string>();
  // The list is newest first, so walk from the end to find the oldest unpinned entries.
  for (let index = entries.length - 1; index >= 0 && excess > 0; index -= 1) {
    const entry = entries[index];
    if (entry !== undefined && !entry.pinned) {
      dropIds.add(entry.id);
      excess -= 1;
    }
  }
  return entries.filter((entry) => !dropIds.has(entry.id));
}
