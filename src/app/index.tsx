import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Placeholder home screen. The calculator UI is implemented in a later,
 * spec-driven feature; this screen only proves the foundation renders.
 */
export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <Surface style={{ padding: theme.spacing.xxl, marginTop: theme.spacing.huge }}>
        <Text variant="label" tone="secondary">
          STANDARD CALC HI
        </Text>
        <Text variant="title" style={{ marginTop: theme.spacing.sm }}>
          Calculator
        </Text>
        <Text variant="body" tone="secondary" style={{ marginTop: theme.spacing.sm }}>
          Foundation ready. Calculator features are not implemented yet.
        </Text>
      </Surface>
    </ScreenContainer>
  );
}
