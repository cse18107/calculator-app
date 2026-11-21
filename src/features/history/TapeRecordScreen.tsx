import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, Share, StyleSheet, View } from 'react-native';

import { CalculatorIcon } from '@/components/calculator/CalculatorIcon';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Text } from '@/components/ui/Text';
import { useAppState } from '@/features/calculator/useAppState';
import {
  type HistoryEntry,
  type HistoryFilter,
  firstSelectedForUse,
  selectedEntries,
  shareText,
  visibleEntries,
} from '@/domain/history';
import { useTheme } from '@/theme/ThemeProvider';

import { FilterTabs } from './FilterTabs';
import { HistoryCard } from './HistoryCard';
import { SelectionActionBar } from './SelectionActionBar';

const FILTER_NAME: Record<HistoryFilter, string> = {
  all: 'calculations',
  basic: 'basic calculations',
  scientific: 'scientific calculations',
  pinned: 'pinned calculations',
};

/**
 * Tape Record: the calculation history list, filters, selection, and actions.
 * Reads and changes the shared app state. USE and USE IN CALC place a result in the
 * calculator and return to it.
 */
export function TapeRecordScreen() {
  const theme = useTheme();
  const { state, dispatch } = useAppState();
  const history = state.history;
  const entries = visibleEntries(history);
  const selected = selectedEntries(history);
  // Fixed for each visit to the screen, so timestamps do not change while it is open.
  const [now] = useState(() => Date.now());

  const leave = () => {
    dispatch({ type: 'clearSelection' });
    router.back();
  };

  const reuseEntry = (entry: HistoryEntry) => {
    dispatch({ type: 'clearSelection' });
    dispatch({ type: 'recall', value: Number(entry.result) });
    router.back();
  };

  const useSelected = () => {
    const target = firstSelectedForUse(history);
    if (target !== null) {
      reuseEntry(target);
    }
  };

  const shareSelected = () => {
    Share.share({ message: shareText(selected) }).catch((error: unknown) => {
      console.warn('Sharing calculations failed', error);
    });
  };

  const confirmDelete = () => {
    Alert.alert('Delete selected calculations?', `${selected.length} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch({ type: 'deleteSelected' }) },
    ]);
  };

  const confirmClearAll = () => {
    Alert.alert('Clear all calculations?', 'Pinned calculations are removed too.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: () => dispatch({ type: 'clearAll' }) },
    ]);
  };

  const emptyText = history.entries.length === 0 ? 'No calculations yet' : `No ${FILTER_NAME[history.filter]} yet`;

  return (
    <ScreenContainer>
      <View style={styles.screen}>
        <View style={[styles.header, { marginBottom: theme.spacing.md }]}>
          <Text size="label" weight="bold" style={{ color: theme.colors.textSecondary }}>
            TAPE RECORD
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter (not available yet)"
            accessibilityState={{ disabled: true }}
            disabled
            style={[
              styles.placeholder,
              {
                gap: theme.spacing.xs,
                paddingHorizontal: theme.spacing.sm,
                borderRadius: theme.dimensions.memoryKeyRadius,
                backgroundColor: theme.colors.memoryBar,
                opacity: theme.opacity.disabled,
              },
            ]}
          >
            <CalculatorIcon
              name="filter"
              size={theme.iconSize.sm - theme.spacing.xs}
              color={theme.colors.textPrimary}
            />
            <Text size="micro" weight="bold" style={{ color: theme.colors.textPrimary }}>
              FILTER
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.panel,
            {
              padding: theme.spacing.compact,
              borderRadius: theme.radius.lg,
              borderWidth: theme.spacing.xxs,
              borderColor: theme.colors.displayBorder,
              backgroundColor: theme.colors.displayBackground,
              marginBottom: theme.spacing.sm,
            },
          ]}
        >
          <FlatList
            data={entries}
            keyExtractor={(entry) => entry.id}
            contentContainerStyle={{ gap: theme.spacing.sm, flexGrow: 1 }}
            ListEmptyComponent={
              <Text size="sm" style={{ color: theme.colors.displaySecondaryText, textAlign: 'center' }}>
                {emptyText}
              </Text>
            }
            renderItem={({ item }) => (
              <HistoryCard
                entry={item}
                now={now}
                selected={history.selectedIds.includes(item.id)}
                onToggleSelect={() => dispatch({ type: 'toggleSelect', id: item.id })}
                onUse={() => reuseEntry(item)}
              />
            )}
          />
        </View>

        <FilterTabs filter={history.filter} onSelect={(filter) => dispatch({ type: 'setFilter', filter })} />

        <View style={{ marginTop: theme.spacing.sm }}>
          <SelectionActionBar
            selectedCount={selected.length}
            canSelectAll={entries.length > 0}
            onSelectAll={() => dispatch({ type: 'selectAllVisible' })}
            onPin={() => dispatch({ type: 'pinSelected' })}
            onUseInCalc={useSelected}
            onShare={shareSelected}
            onDelete={confirmDelete}
            onBack={leave}
            onClearAll={confirmClearAll}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 26,
  },
  panel: {
    flex: 1,
  },
});
