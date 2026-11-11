import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CODE_LENGTH, joinSession } from '@/lib/live-session';
import { NOT_CONFIGURED_MESSAGE, errorMessage, supabase } from '@/lib/supabase';

/** Start page: students join with a code, teachers host a session. */
export default function HomeRoute() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code ?? '');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = supabase !== null;
  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.background }];

  async function join() {
    setBusy(true);
    setError(null);
    try {
      const session = await joinSession(code, name);
      router.push({ pathname: '/session/[code]', params: { code: session.code } });
    } catch (e) {
      setError(errorMessage(e));
    }
    setBusy(false);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle">Round robin</ThemedText>
        <ThemedText themeColor="textSecondary">
          Talk with a new partner every round, with a question to get you started.
        </ThemedText>
      </View>

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Join a session</ThemedText>
        <TextInput
          value={code}
          onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          placeholder="Join code"
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Join code"
          keyboardType="number-pad"
          inputMode="numeric"
          style={[inputStyle, styles.codeInput]}
        />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name (optional)"
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Your name"
          maxLength={40}
          onSubmitEditing={() => code.length === CODE_LENGTH && join()}
          style={inputStyle}
        />
        <Button
          label={busy ? 'Joining…' : 'Join'}
          disabled={!configured || busy || code.length !== CODE_LENGTH}
          onPress={join}
        />
        {error && (
          <ThemedText type="small" themeColor="warning">
            {error}
          </ThemedText>
        )}
      </ThemedView>

      <View style={styles.section}>
        <ThemedText type="smallBold">Teachers</ThemedText>
        <Button
          label="Host a session"
          variant="secondary"
          disabled={!configured}
          onPress={() => router.push('/host')}
        />
        <Button
          label="Use one shared screen instead"
          variant="secondary"
          onPress={() => router.push('/single')}
        />
        {!configured && (
          <ThemedText type="small" themeColor="warning">
            {NOT_CONFIGURED_MESSAGE}
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
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    fontSize: 16,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: 4,
  },
});
