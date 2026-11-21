import {
  type HistoryAction,
  type HistoryEntry,
  type HistoryState,
  HISTORY_LIMIT,
  firstSelectedForUse,
  formatTimestamp,
  historyLine,
  historyReducer,
  initialHistoryState,
  selectedEntries,
  shareText,
  visibleEntries,
} from '../history';

function run(state: HistoryState, ...actions: HistoryAction[]): HistoryState {
  return actions.reduce(historyReducer, state);
}

function record(expression: string, result: string, createdAt = 1_000): HistoryAction {
  return { type: 'record', expression, result, createdAt };
}

/** Records `count` unpinned entries with ids "1".."count" (ids are assigned in order). */
function recordMany(state: HistoryState, count: number): HistoryState {
  let next = state;
  for (let index = 0; index < count; index += 1) {
    next = run(next, record(`${index} + 1 =`, String(index + 1)));
  }
  return next;
}

function ids(entries: readonly HistoryEntry[]): string[] {
  return entries.map((entry) => entry.id);
}

describe('recording (FR-7, FR-8)', () => {
  it('AC-8: the newest entry is first', () => {
    const state = run(initialHistoryState, record('2 × 3 =', '6'), record('6 × 3 =', '18'));
    expect(state.entries.map((entry) => entry.expression)).toEqual(['6 × 3 =', '2 × 3 =']);
  });

  it('new entries are unpinned basic entries with a stored result and time', () => {
    const state = run(initialHistoryState, record('2 × 3 =', '6', 42));
    expect(state.entries[0]).toEqual({
      id: '1',
      kind: 'basic',
      expression: '2 × 3 =',
      result: '6',
      createdAt: 42,
      pinned: false,
    });
  });

  it('AC-9: at exactly 100 unpinned entries nothing is removed', () => {
    const state = recordMany(initialHistoryState, HISTORY_LIMIT);
    expect(state.entries).toHaveLength(HISTORY_LIMIT);
    expect(ids(state.entries)).toContain('1');
  });

  it('AC-9: the 101st unpinned entry removes the oldest unpinned entry', () => {
    const state = recordMany(initialHistoryState, HISTORY_LIMIT + 1);
    expect(state.entries).toHaveLength(HISTORY_LIMIT);
    expect(ids(state.entries)).not.toContain('1');
    expect(state.entries[0]?.id).toBe(String(HISTORY_LIMIT + 1));
  });

  it('AC-9: pinned entries are never removed by the limit', () => {
    let state = run(
      initialHistoryState,
      record('pinned =', '1'),
      { type: 'toggleSelect', id: '1' },
      { type: 'pinSelected' },
    );
    state = recordMany(state, HISTORY_LIMIT + 1);
    expect(state.entries.filter((entry) => entry.pinned).map((entry) => entry.id)).toEqual(['1']);
    expect(state.entries.filter((entry) => !entry.pinned)).toHaveLength(HISTORY_LIMIT);
    expect(ids(state.entries)).not.toContain('2');
  });
});

describe('display line (FR-9)', () => {
  it('AC-10: null with no entries', () => {
    expect(historyLine([])).toBeNull();
  });

  it('AC-10: shows the most recent expression and formatted result', () => {
    const state = run(initialHistoryState, record('450 × 8 =', '3600'), record('1,250 + 4,890.5 =', '6140.5'));
    expect(historyLine(state.entries)).toBe('1,250 + 4,890.5 = 6,140.5');
  });
});

describe('filters (FR-13, FR-14, AC-14)', () => {
  const base = run(
    initialHistoryState,
    record('1 + 1 =', '2'),
    record('2 + 2 =', '4'),
    { type: 'toggleSelect', id: '1' },
    { type: 'pinSelected' },
  );

  it('ALL shows every entry', () => {
    expect(visibleEntries(base)).toHaveLength(2);
  });

  it('PINNED shows only pinned entries', () => {
    expect(ids(visibleEntries(run(base, { type: 'setFilter', filter: 'pinned' })))).toEqual(['1']);
  });

  it('BASIC shows basic entries', () => {
    expect(visibleEntries(run(base, { type: 'setFilter', filter: 'basic' }))).toHaveLength(2);
  });

  it('SCIENTIFIC is empty while there are no scientific entries', () => {
    expect(visibleEntries(run(base, { type: 'setFilter', filter: 'scientific' }))).toEqual([]);
  });

  it('AC-15: changing the filter clears the selection', () => {
    const selected = run(base, { type: 'toggleSelect', id: '2' });
    expect(run(selected, { type: 'setFilter', filter: 'basic' }).selectedIds).toEqual([]);
  });

  it('AC-16: SELECT ALL selects only the entries visible under the filter', () => {
    const pinnedOnly = run(base, { type: 'setFilter', filter: 'pinned' }, { type: 'selectAllVisible' });
    expect(pinnedOnly.selectedIds).toEqual(['1']);
    expect(run(base, { type: 'selectAllVisible' }).selectedIds).toEqual(['2', '1']);
  });
});

describe('selection and pin (FR-15, FR-18, AC-17)', () => {
  const twoEntries = run(initialHistoryState, record('1 + 1 =', '2'), record('2 + 2 =', '4'));

  it('toggling a checkbox selects, then deselects', () => {
    const selected = run(twoEntries, { type: 'toggleSelect', id: '1' });
    expect(selected.selectedIds).toEqual(['1']);
    expect(run(selected, { type: 'toggleSelect', id: '1' }).selectedIds).toEqual([]);
  });

  it('AC-17: pinning a mix of pinned and unpinned pins them all', () => {
    const pinnedFirst = run(twoEntries, { type: 'toggleSelect', id: '1' }, { type: 'pinSelected' });
    const mixed = run(pinnedFirst, { type: 'selectAllVisible' }, { type: 'pinSelected' });
    expect(mixed.entries.every((entry) => entry.pinned)).toBe(true);
  });

  it('AC-17: pinning when every selected entry is pinned unpins them', () => {
    const allPinned = run(twoEntries, { type: 'selectAllVisible' }, { type: 'pinSelected' });
    const unpinned = run(allPinned, { type: 'pinSelected' });
    expect(unpinned.entries.every((entry) => !entry.pinned)).toBe(true);
  });

  it('pins only the selected entries', () => {
    const state = run(twoEntries, { type: 'toggleSelect', id: '2' }, { type: 'pinSelected' });
    expect(state.entries.find((entry) => entry.id === '2')?.pinned).toBe(true);
    expect(state.entries.find((entry) => entry.id === '1')?.pinned).toBe(false);
  });

  it('FR-20: the first selected entry in list order is the one USE IN CALC applies', () => {
    const state = run(twoEntries, { type: 'selectAllVisible' });
    expect(firstSelectedForUse(state)?.id).toBe('2');
    expect(firstSelectedForUse(initialHistoryState)).toBeNull();
    expect(selectedEntries(state).map((entry) => entry.id)).toEqual(['2', '1']);
  });
});

describe('delete and clear (FR-23, FR-24, AC-24, AC-25)', () => {
  const pinned = run(
    initialHistoryState,
    record('1 + 1 =', '2'),
    record('2 + 2 =', '4'),
    record('3 + 3 =', '6'),
    { type: 'toggleSelect', id: '3' },
    { type: 'pinSelected' },
    { type: 'clearSelection' },
  );

  it('AC-24: deleteSelected removes only the selected entries and clears the selection', () => {
    const state = run(pinned, { type: 'toggleSelect', id: '1' }, { type: 'deleteSelected' });
    expect(ids(state.entries)).toEqual(['3', '2']);
    expect(state.selectedIds).toEqual([]);
  });

  it('AC-25: clearAll removes every entry, pinned or not', () => {
    const state = run(pinned, { type: 'clearAll' });
    expect(state.entries).toEqual([]);
    expect(state.selectedIds).toEqual([]);
  });
});

describe('timestamps (FR-19, AC-18)', () => {
  const now = new Date(2026, 10, 21, 12, 0).getTime();

  it('AC-18: an entry from today shows its time', () => {
    const created = new Date(2026, 10, 21, 9, 41).getTime();
    expect(formatTimestamp(created, now)).toBe(
      new Date(created).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    );
  });

  it('AC-18: an entry from the previous calendar day shows Yesterday, even just before midnight', () => {
    const created = new Date(2026, 10, 20, 23, 59).getTime();
    expect(formatTimestamp(created, now)).toBe('Yesterday');
  });

  it('AC-18: an entry from two days ago shows its date', () => {
    const created = new Date(2026, 10, 19, 8, 12).getTime();
    expect(formatTimestamp(created, now)).toBe(new Date(created).toLocaleDateString());
  });
});

describe('share text (FR-21)', () => {
  it('AC-22: one "<expression> <result>" line per entry, formatted like the display', () => {
    const state = run(initialHistoryState, record('1,250 + 4,890.5 =', '6140.5'), record('2 × 3 =', '6'));
    expect(shareText(state.entries)).toBe('2 × 3 = 6\n1,250 + 4,890.5 = 6,140.5');
  });
});
