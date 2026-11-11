import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatClock } from '@/hooks/use-countdown';
import { remainingMs, type LiveSession } from '@/lib/live-session';

/** The shared countdown for a phone session, as seen by host and students. */
export function LiveTimer({ session, now }: { session: LiveSession; now: number }) {
  const remaining = remainingMs(session, now);
  const finished = remaining <= 0;
  const running = session.ends_at !== null && !finished;

  const label = finished
    ? null
    : !running
      ? session.auto_advance || session.remaining_ms !== session.round_minutes * 60 * 1000
        ? 'Paused'
        : 'Waiting for the timer to start'
      : session.stage === 'changeover'
        ? 'Find your partner'
        : 'Talk';

  return (
    <View style={styles.timer}>
      {label && (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {label}
        </ThemedText>
      )}
      <ThemedText
        accessibilityRole="timer"
        themeColor={finished ? 'warning' : 'text'}
        style={styles.clock}>
        {finished ? "Time's up" : formatClock(Math.ceil(remaining / 1000))}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  timer: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  clock: {
    fontSize: 64,
    lineHeight: 72,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
  },
});
