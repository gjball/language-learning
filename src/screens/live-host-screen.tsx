import { router, type Href } from 'expo-router';
import { useEffect, useEffectEvent, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Avatar } from '@/components/avatar';
import { ExternalLink } from '@/components/external-link';
import { JoinQrCode, getAppAddress, joinUrl } from '@/components/join-qr-code';
import { LiveTimer } from '@/components/live-timer';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useQuestions } from '@/hooks/use-questions';
import { useTheme } from '@/hooks/use-theme';
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
  const questions = useQuestions();
  const theme = useTheme();
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

  const header = (status: string) => (
    <View style={styles.topBar}>
      <View style={styles.brand}>
        <View style={[styles.brandMark, { backgroundColor: theme.accent }]} />
        <ThemedText type="smallBold">Round robin</ThemedText>
      </View>
      <Pill label={status} tone="accent" />
    </View>
  );

  if (session.status === 'lobby') {
    const address = getAppAddress();
    const link = address ? joinUrl(address, session.code) : null;

    return (
      <Screen>
        {header('Waiting for students')}

        <View style={[styles.hero, { backgroundColor: theme.hero }]}>
          <View style={styles.heroText}>
            <Text style={[styles.heroLabel, { color: theme.onHeroMuted }]}>Join code</Text>
            <Text style={[styles.code, { color: theme.onHero }]} selectable>
              {formatCode(session.code)}
            </Text>
            {address && link ? (
              <View style={styles.heroLines}>
                <Text style={[styles.heroBody, { color: theme.onHeroMuted }]}>
                  Scan to join, or go to
                </Text>
                <ExternalLink href={link as Href & string}>
                  <Text style={[styles.heroLink, { color: theme.onHero }]}>
                    {address.replace(/^https?:\/\//, '')}
                  </Text>
                </ExternalLink>
              </View>
            ) : (
              <Text style={[styles.heroBody, { color: theme.onHeroMuted }]}>
                Students open the app and enter this code.
              </Text>
            )}
          </View>
          {link && <JoinQrCode url={link} />}
        </View>

        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText type="smallBold">Students</ThemedText>
            <Pill label={String(participants.length)} tone="accent" />
          </View>
          {participants.length === 0 ? (
            <View style={[styles.empty, { borderColor: theme.border }]}>
              <ThemedText themeColor="textSecondary" style={styles.centered}>
                Waiting for students to join…
              </ThemedText>
            </View>
          ) : (
            <View style={styles.chips}>
              {participants.map((p) => (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${p.name}`}
                  onPress={() => remove(p)}
                  style={({ pressed }) => [
                    styles.student,
                    { backgroundColor: theme.background },
                    pressed && styles.pressed,
                  ]}>
                  <Avatar id={p.id} name={p.name} size={28} />
                  <ThemedText type="small">{p.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    ✕
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        </ThemedView>

        <View style={styles.pills}>
          <Pill label={`Level ${session.level}`} />
          <Pill
            label={`${session.round_count} ${session.round_count === 1 ? 'round' : 'rounds'}`}
          />
          <Pill label={`${session.round_minutes} min each`} />
          <Pill label={session.auto_advance ? 'Automatic timer' : 'Manual timer'} />
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
      {header(`Join code ${formatCode(session.code)}`)}

      <View style={styles.section}>
        <ThemedText type="subtitle">
          Round {session.round + 1} of {session.round_count}
        </ThemedText>
        <View style={styles.steps}>
          {Array.from({ length: session.round_count }, (_, i) => (
            <View
              key={i}
              style={[
                styles.step,
                { backgroundColor: i <= session.round ? theme.accent : theme.backgroundSelected },
              ]}
            />
          ))}
        </View>
      </View>

      <ThemedView type="backgroundElement" style={[styles.card, styles.timerCard]}>
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
      </ThemedView>

      <View style={styles.section}>
        <View style={styles.cardHeader}>
          <ThemedText type="smallBold">Partners</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Level {session.level}
          </ThemedText>
        </View>
        <View style={styles.groups}>
          {groups.map((group, index) => {
            const question = questionForGroup(session, questions, session.level, index, groups.length);
            return (
              <ThemedView
                key={group.map((p) => p.id).join('+')}
                type="backgroundElement"
                style={[styles.card, styles.group]}>
                <View style={styles.groupPeople}>
                  <View style={styles.avatars}>
                    {group.map((p, i) => (
                      <View
                        key={p.id}
                        style={[
                          styles.avatarRing,
                          { borderColor: theme.backgroundElement },
                          i > 0 && styles.avatarOverlap,
                        ]}>
                        <Avatar id={p.id} name={p.name} />
                      </View>
                    ))}
                  </View>
                  <ThemedText type="smallBold" style={styles.groupNames}>
                    {group.map((p) => p.name).join('  ·  ')}
                  </ThemedText>
                </View>
                {question && <ThemedText themeColor="textSecondary">{question.text}</ThemedText>}
              </ThemedView>
            );
          })}
        </View>
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
  section: {
    gap: Spacing.two,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandMark: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  // The code sits beside the QR code on wide screens and above it on phones.
  hero: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
    borderRadius: 28,
  },
  heroText: {
    flexGrow: 1,
    flexBasis: 260,
    gap: Spacing.one,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  code: {
    fontSize: 60,
    lineHeight: 72,
    fontWeight: 800,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  heroLines: {
    alignItems: 'flex-start',
    gap: Spacing.half,
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 24,
  },
  heroLink: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 700,
    textDecorationLine: 'underline',
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  empty: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Spacing.three,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  student: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    paddingLeft: Spacing.one,
    paddingRight: Spacing.three,
    borderRadius: Spacing.four,
    minHeight: 36,
  },
  pressed: {
    opacity: 0.7,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  steps: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  step: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  timerCard: {
    alignItems: 'center',
    gap: Spacing.four,
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
    flexGrow: 1,
    flexBasis: 260,
    gap: Spacing.two,
  },
  groupPeople: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatars: {
    flexDirection: 'row',
  },
  avatarRing: {
    borderWidth: 2,
    borderRadius: 18,
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  groupNames: {
    flexShrink: 1,
  },
  centered: {
    textAlign: 'center',
  },
});
