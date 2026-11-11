import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { CATEGORIES, LEVELS, findQuestions, type Category } from '@/data/questions';
import { useTheme } from '@/hooks/use-theme';
import { uniqueRoundCount } from '@/lib/round-robin';
import type { SessionSettings } from '@/lib/session';

const ROUND_MINUTES = [1, 2, 3, 5, 10];
const MAX_ROUNDS = 20;

type SetupScreenProps = {
  settings: SessionSettings;
  onChange: (settings: SessionSettings) => void;
  onStart: () => void;
};

export function SetupScreen({ settings, onChange, onStart }: SetupScreenProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  // Counts every guest ever added so IDs are never reused after a removal.
  const [guestCounter, setGuestCounter] = useState(settings.participants.length);

  const { participants, level, categories, roundMinutes, roundCount } = settings;
  const questionCount = findQuestions(level, categories).length;
  const uniqueRounds = uniqueRoundCount(participants.length);

  const problem =
    participants.length < 2
      ? 'Add at least two students to start.'
      : questionCount === 0
        ? 'Choose at least one category.'
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

  function toggleCategory(category: Category) {
    onChange({
      ...settings,
      categories: categories.includes(category)
        ? categories.filter((c) => c !== category)
        : [...categories, category],
    });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle">Round robin</ThemedText>
        <ThemedText themeColor="textSecondary">
          Pair students up, give them a question, and rotate partners each round.
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
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.backgroundElement },
            ]}
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

      <View style={styles.section}>
        <ThemedText type="smallBold">Level</ThemedText>
        <View style={styles.chips}>
          {LEVELS.map((l) => (
            <Chip
              key={l}
              label={l}
              selected={l === level}
              onPress={() => onChange({ ...settings, level: l })}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Question categories</ThemedText>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={categories.includes(c)}
              onPress={() => toggleCategory(c)}
            />
          ))}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {questionCount} {questionCount === 1 ? 'question' : 'questions'} available.
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Minutes per round</ThemedText>
        <View style={styles.chips}>
          {ROUND_MINUTES.map((m) => (
            <Chip
              key={m}
              label={`${m} min`}
              selected={m === roundMinutes}
              onPress={() => onChange({ ...settings, roundMinutes: m })}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Number of rounds</ThemedText>
        <View style={styles.row}>
          <Button
            label="−"
            variant="secondary"
            disabled={roundCount <= 1}
            onPress={() => onChange({ ...settings, roundCount: roundCount - 1 })}
          />
          <ThemedText type="subtitle" style={styles.roundCount}>
            {roundCount}
          </ThemedText>
          <Button
            label="+"
            variant="secondary"
            disabled={roundCount >= MAX_ROUNDS}
            onPress={() => onChange({ ...settings, roundCount: roundCount + 1 })}
          />
        </View>
        {uniqueRounds > 0 && (
          <ThemedText
            type="small"
            themeColor={roundCount > uniqueRounds ? 'warning' : 'textSecondary'}>
            {roundCount > uniqueRounds
              ? `With ${participants.length} students, partners start repeating after round ${uniqueRounds}.`
              : `With ${participants.length} students, everyone gets a new partner for up to ${uniqueRounds} ${uniqueRounds === 1 ? 'round' : 'rounds'}.`}
          </ThemedText>
        )}
      </View>

      <View style={styles.section}>
        <Button label="Start session" disabled={problem !== null} onPress={onStart} />
        {problem && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
            {problem}
          </ThemedText>
        )}
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
  roundCount: {
    minWidth: 56,
    textAlign: 'center',
  },
  centered: {
    textAlign: 'center',
  },
});
