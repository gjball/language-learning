import { router } from 'expo-router';
import { useEffect, useEffectEvent, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { LiveTimer } from '@/components/live-timer';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import {
  beginDiscussion,
  endSession,
  formatCode,
  nextRound,
  pauseTimer,
  questionForGroup,
  remainingMs,
  removeParticipant,
  resetTimer,
  startSession,
  startTimer,
  updateSession,
  type LiveParticipant,
  type LiveSession,
} from '@/lib/live-session';
import { groupsForRound } from '@/lib/round-robin';
import { errorMessage } from '@/lib/supabase';
import { FinishedScreen } from '@/screens/finished-screen';

type LiveHostScreenProps = {
  session: LiveSession;
  participants: LiveParticipant[];
  onSession: (session: LiveSession) => void;
  onParticipants: (participants: LiveParticipant[]) => void;
};

/** What the teacher sees: the join code, then the controls for each round. */
export function LiveHostScreen({
  session,
  participants,
  onSession,
  onParticipants,
}: LiveHostScreenProps) {
  const now = useNow();
  const [error, setError] = useState<string | null>(null);

  type Changes = Parameters<typeof updateSession>[1];

  async function save(changes: Changes, onlyIfUnmoved = false) {
    try {
      const saved = await updateSession(session, changes, onlyIfUnmoved);
      if (saved) onSession(saved);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function remove(participant: LiveParticipant) {
    try {
      await removeParticipant(participant.id);
      onParticipants(participants.filter((p) => p.id !== participant.id));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  // Automatic mode: this screen moves the session on when the clock runs out.
  const playing = session.status === 'playing';
  const expired =
    playing && session.auto_advance && session.ends_at !== null && remainingMs(session, now) <= 0;

  const advance = useEffectEvent(() => {
    const current = Date.now();
    save(
      session.stage === 'changeover'
        ? beginDiscussion(session, current)
        : nextRound(session, participants, current),
      true,
    );
  });

  useEffect(() => {
    if (expired) advance();
  }, [expired, session.round, session.stage]);

  if (session.status === 'finished') {
    return (
      <FinishedScreen
        roundsPlayed={session.roster.length > 0 ? session.round + 1 : 0}
        studentCount={session.roster.length}
        restartLabel="Back to start"
        onRestart={() => router.replace('/')}
      />
    );
  }

  const errorText = error && (
    <ThemedText type="small" themeColor="warning" style={styles.centered}>
      {error}
    </ThemedText>
  );

  if (session.status === 'lobby') {
    return (
      <Screen>
        <View style={styles.codeBlock}>
          <ThemedText themeColor="textSecondary">Join code</ThemedText>
          <ThemedText style={styles.code} selectable>
            {formatCode(session.code)}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centered}>
            Students open the app, tap Join, and enter this code.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Students ({participants.length})</ThemedText>
          {participants.length === 0 ? (
            <ThemedText themeColor="textSecondary">Waiting for students to join…</ThemedText>
          ) : (
            <View style={styles.chips}>
              {participants.map((p) => (
                <Chip
                  key={p.id}
                  label={`${p.name}  ✕`}
                  accessibilityLabel={`Remove ${p.name}`}
                  onPress={() => remove(p)}
                />
              ))}
            </View>
          )}
          <ThemedText type="small" themeColor="textSecondary">
            {session.level} · {session.round_count} {session.round_count === 1 ? 'round' : 'rounds'}{' '}
            of {session.round_minutes} min · {session.auto_advance ? 'automatic' : 'manual'} timer
          </ThemedText>
        </View>

        <View style={styles.section}>
          <Button
            label="Start session"
            disabled={participants.length < 2}
            onPress={() => save(startSession(session, participants, Date.now()))}
          />
          {participants.length < 2 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
              At least two students need to join before you can start.
            </ThemedText>
          )}
          <Button label="Cancel session" variant="secondary" onPress={() => save(endSession())} />
          {errorText}
        </View>
      </Screen>
    );
  }

  const groups = groupsForRound(session.roster, session.round);
  const lastRound = session.round + 1 >= session.round_count;
  const remaining = remainingMs(session, now);
  const running = session.ends_at !== null && remaining > 0;
  const rosterIds = new Set(session.roster.map((p) => p.id));
  const waiting = participants.filter((p) => !rosterIds.has(p.id));

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle">
          Round {session.round + 1} of {session.round_count}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Join code {formatCode(session.code)}
        </ThemedText>
      </View>

      <LiveTimer session={session} now={now} />

      <View style={styles.centeredRow}>
        {remaining > 0 && (
          <Button
            label={running ? 'Pause' : session.auto_advance ? 'Resume' : 'Start timer'}
            onPress={() =>
              save(running ? pauseTimer(session, Date.now()) : startTimer(session, Date.now()))
            }
          />
        )}
        <Button label="Reset" variant="secondary" onPress={() => save(resetTimer(session))} />
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Partners</ThemedText>
        <View style={styles.groups}>
          {groups.map((group, index) => {
            const question = questionForGroup(session, session.level, index, groups.length);
            return (
              <ThemedView
                key={group.map((p) => p.id).join('+')}
                type="backgroundElement"
                style={styles.group}>
                <ThemedText type="smallBold">{group.map((p) => p.name).join('  ·  ')}</ThemedText>
                {question && <ThemedText>{question.text}</ThemedText>}
              </ThemedView>
            );
          })}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Questions shown at {session.level}. Students who change level on their phone see a
          different question.
        </ThemedText>
        {waiting.length > 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            Joining next round: {waiting.map((p) => p.name).join(', ')}
          </ThemedText>
        )}
      </View>

      <View style={styles.section}>
        <Button
          label={lastRound ? 'Finish session' : 'Next round'}
          onPress={() => save(nextRound(session, participants, Date.now()))}
        />
        {!lastRound && (
          <Button label="End session" variant="secondary" onPress={() => save(endSession())} />
        )}
        {errorText}
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
  codeBlock: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  code: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  centeredRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  groups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  group: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
    flexGrow: 1,
    flexBasis: 220,
  },
  centered: {
    textAlign: 'center',
  },
});
