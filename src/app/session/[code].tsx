import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useLiveSession } from '@/hooks/use-live-session';
import { LiveHostScreen } from '@/screens/live-host-screen';
import { LiveStudentScreen } from '@/screens/live-student-screen';

/** A phone session: shows the host's controls or the student's view. */
export default function LiveSessionRoute() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { state, applySession, applyParticipants } = useLiveSession(code);

  if (state.status === 'loading') {
    return (
      <Screen>
        <ThemedText themeColor="textSecondary">Connecting…</ThemedText>
      </Screen>
    );
  }

  if (state.status === 'error') {
    return (
      <Screen>
        <View style={styles.message}>
          <ThemedText type="subtitle">Can&apos;t open this session</ThemedText>
          <ThemedText themeColor="textSecondary">{state.message}</ThemedText>
        </View>
        <Button label="Back to start" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const { session, participants, userId } = state;

  if (session.host_id === userId) {
    return (
      <LiveHostScreen
        session={session}
        participants={participants}
        onSession={applySession}
        onParticipants={applyParticipants}
      />
    );
  }

  const me = participants.find((p) => p.user_id === userId);

  if (!me) {
    return (
      <Screen>
        <View style={styles.message}>
          <ThemedText type="subtitle">You&apos;re not in this session</ThemedText>
          <ThemedText themeColor="textSecondary">
            Enter your name on the start page to join.
          </ThemedText>
        </View>
        <Button
          label="Join this session"
          onPress={() => router.replace({ pathname: '/', params: { code: session.code } })}
        />
      </Screen>
    );
  }

  return <LiveStudentScreen session={session} participants={participants} me={me} />;
}

const styles = StyleSheet.create({
  message: {
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
});
