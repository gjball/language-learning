import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { RoundSettingsForm } from '@/components/round-settings-form';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { createSession } from '@/lib/live-session';
import { DEFAULT_ROUND_SETTINGS } from '@/lib/session';
import { errorMessage } from '@/lib/supabase';

/** The teacher chooses the settings and gets a join code for the class. */
export default function HostRoute() {
  const [settings, setSettings] = useState(DEFAULT_ROUND_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const session = await createSession(settings);
      router.replace({ pathname: '/session/[code]', params: { code: session.code } });
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle">Host a session</ThemedText>
        <ThemedText themeColor="textSecondary">
          Choose the settings, then share the join code with your students.
        </ThemedText>
      </View>

      <RoundSettingsForm
        settings={settings}
        levelHint="Every student gets questions at this level."
        onChange={(changes) => setSettings({ ...settings, ...changes })}
      />

      <View style={styles.section}>
        <Button
          label={busy ? 'Creating…' : 'Create session'}
          disabled={busy || settings.categories.length === 0}
          onPress={create}
        />
        {error && (
          <ThemedText type="small" themeColor="warning" style={styles.centered}>
            {error}
          </ThemedText>
        )}
        <Button label="Back" variant="secondary" onPress={() => router.replace('/')} />
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
  centered: {
    textAlign: 'center',
  },
});
