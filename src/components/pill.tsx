import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** A small rounded label, for statuses and settings. */
export function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' }) {
  const theme = useTheme();
  const accent = tone === 'accent';

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: accent ? theme.accentSoft : theme.backgroundElement },
      ]}>
      <ThemedText type="smallBold" themeColor={accent ? 'accent' : 'textSecondary'}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
  },
});
