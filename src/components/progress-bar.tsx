import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** A thin horizontal bar; `fraction` runs from 0 (empty) to 1 (full). */
export function ProgressBar({ fraction }: { fraction: number }) {
  const theme = useTheme();
  const clamped = Math.min(1, Math.max(0, fraction));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.fill, { backgroundColor: theme.accent, width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
