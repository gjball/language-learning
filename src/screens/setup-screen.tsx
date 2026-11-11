import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { RoundSettingsForm } from '@/components/round-settings-form';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { findQuestions } from '@/data/questions';
import { useQuestions } from '@/hooks/use-questions';
import { useTheme } from '@/hooks/use-theme';
import type { SessionSettings } from '@/lib/session';

type SetupScreenProps = {
  settings: SessionSettings;
  onChange: (settings: SessionSettings) => void;
  onStart: () => void;
  onBack: () => void;
};

export function SetupScreen({ settings, onChange, onStart, onBack }: SetupScreenProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  // Counts every guest ever added so IDs are never reused after a removal.
  const [guestCounter, setGuestCounter] = useState(settings.participants.length);

  const { participants } = settings;
  const questions = useQuestions();
  const questionCount = findQuestions(questions, settings.level, settings.categories).length;

  const problem =
    participants.length < 2
      ? 'Add at least two students to start.'
      : questionCount === 0
        ? `There are no questions at ${settings.level} yet.`
        : null;

  function addParticipant() {
    const number = guestCounter + 1;
    const id = `G-${number.toString().padStart(2, '0')}`;
    setGuestCounter(number);
    setName('');
    onChange({
      ...settings,
      participants: [...participants, { id, name: name.trim() || `Guest ${number}` }],
    });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle">One shared screen</ThemedText>
        <ThemedText themeColor="textSecondary">
          Enter the students here and show this screen to the room.
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Students ({participants.length})</ThemedText>
        <View style={styles.row}>
          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={addParticipant}
            submitBehavior="submit"
            placeholder="Name (optional)"
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel="Student name"
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          />
          <Button label="Add" onPress={addParticipant} />
        </View>
        {participants.length > 0 && (
          <View style={styles.chips}>
            {participants.map((p) => (
              <Chip
                key={p.id}
                label={`${p.name}  ✕`}
                accessibilityLabel={`Remove ${p.name}`}
                onPress={() =>
                  onChange({
                    ...settings,
                    participants: participants.filter((other) => other.id !== p.id),
                  })
                }
              />
            ))}
          </View>
        )}
        <ThemedText type="small" themeColor="textSecondary">
          Leave the name empty to add a numbered guest. Tap a student to remove them.
        </ThemedText>
      </View>

      <RoundSettingsForm
        settings={settings}
        studentCount={participants.length}
        onChange={(changes) => onChange({ ...settings, ...changes })}
      />

      <View style={styles.section}>
        <Button label="Start session" disabled={problem !== null} onPress={onStart} />
        {problem && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
            {problem}
          </ThemedText>
        )}
        <Button label="Back" variant="secondary" onPress={onBack} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  section: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    fontSize: 16,
  },
  centered: {
    textAlign: 'center',
  },
});
