import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Level } from '@/data/questions';
import { findWeek } from '@/data/weeks';
import { useWeeks } from '@/hooks/use-questions';

type WeekFocusProps = {
  level: Level;
  week: number | null | undefined;
};

/** The level, week, topic and grammar focus of a session, in two short lines. */
export function WeekFocus({ level, week }: WeekFocusProps) {
  const plan = findWeek(useWeeks(), level, week);

  return (
    <View style={styles.focus}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {level}
        {week != null ? ` · Week ${week}` : ''}
        {plan ? `: ${plan.topic}` : ''}
      </ThemedText>
      {plan?.grammar ? (
        <ThemedText type="small" themeColor="textSecondary">
          Grammar: {plan.grammar}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  focus: {
    gap: Spacing.half,
  },
});
