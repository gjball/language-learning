import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type FinishedScreenProps = {
  roundsPlayed: number;
  studentCount: number;
  onRestart: () => void;
};

export function FinishedScreen({ roundsPlayed, studentCount, onRestart }: FinishedScreenProps) {
  return (
    <Screen>
      <View style={styles.summary}>
        <ThemedText type="subtitle">Session complete</ThemedText>
        <ThemedText themeColor="textSecondary">
          {studentCount} students · {roundsPlayed} {roundsPlayed === 1 ? 'round' : 'rounds'}
        </ThemedText>
      </View>
      <Button label="New session" onPress={onRestart} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: Spacing.one,
    paddingVertical: Spacing.five,
  },
});
