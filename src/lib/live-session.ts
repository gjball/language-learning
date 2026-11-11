/**
 * Phone sessions: the host creates a session and gets a join code, students
 * join with that code, and every phone follows the same session row in
 * Supabase. See supabase/schema.sql for the tables.
 */
import { LEVELS, findQuestions, type Category, type Level, type Question } from '@/data/questions';
import type { Participant } from '@/lib/round-robin';
import { CHANGEOVER_SECONDS, shuffle, type RoundSettings } from '@/lib/session';
import { ensureSignedIn, requireSupabase } from '@/lib/supabase';

export const CODE_LENGTH = 6;

export type LiveSession = {
  id: string;
  code: string;
  host_id: string;
  status: 'lobby' | 'playing' | 'finished';
  level: Level;
  categories: Category[];
  round_minutes: number;
  round_count: number;
  auto_advance: boolean;
  /** 0-based. */
  round: number;
  stage: 'changeover' | 'discussion';
  /** Set while the timer is running. */
  ends_at: string | null;
  /** Set while the timer is paused or has not been started. */
  remaining_ms: number | null;
  /** Who is taking part in the current round. */
  roster: Participant[];
  seed: number;
};

export type LiveParticipant = {
  id: string;
  session_id: string;
  user_id: string;
  name: string;
  joined_at: string;
};

type SessionChanges = Partial<Omit<LiveSession, 'id' | 'code' | 'host_id'>>;

// ---------------------------------------------------------------------------
// Talking to Supabase
// ---------------------------------------------------------------------------

export async function createSession(settings: RoundSettings): Promise<LiveSession> {
  const client = requireSupabase();
  await ensureSignedIn();

  // Codes are random, so on the rare clash with an existing one, try another.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await client
      .from('sessions')
      .insert({
        code: randomCode(),
        level: settings.level,
        categories: settings.categories,
        round_minutes: settings.roundMinutes,
        round_count: settings.roundCount,
        auto_advance: settings.autoAdvance,
        seed: Math.floor(Math.random() * 2 ** 31),
      })
      .select()
      .single();

    if (!error) return data as LiveSession;
    if (error.code !== '23505') throw new Error(error.message);
  }
  throw new Error('Could not create a session. Please try again.');
}

export async function fetchSessionByCode(code: string): Promise<LiveSession | null> {
  const { data, error } = await requireSupabase()
    .from('sessions')
    .select()
    .eq('code', code)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as LiveSession | null;
}

export async function fetchParticipants(sessionId: string): Promise<LiveParticipant[]> {
  const { data, error } = await requireSupabase()
    .from('participants')
    .select()
    .eq('session_id', sessionId)
    .order('joined_at')
    .order('id');
  if (error) throw new Error(error.message);
  return data as LiveParticipant[];
}

/** Adds this device to the session, or renames it if it has already joined. */
export async function joinSession(code: string, name: string): Promise<LiveSession> {
  const client = requireSupabase();
  const userId = await ensureSignedIn();

  const session = await fetchSessionByCode(code);
  if (!session) throw new Error('No session found with that code.');
  if (session.status === 'finished') throw new Error('That session has already finished.');

  let finalName = name.trim();
  if (!finalName) {
    const others = await fetchParticipants(session.id);
    const existing = others.find((p) => p.user_id === userId);
    finalName = existing?.name ?? `Guest ${others.length + 1}`;
  }

  const { error } = await client
    .from('participants')
    .upsert(
      { session_id: session.id, user_id: userId, name: finalName },
      { onConflict: 'session_id,user_id' },
    );
  if (error) throw new Error(error.message);

  return session;
}

export async function removeParticipant(participantId: string): Promise<void> {
  const { error } = await requireSupabase().from('participants').delete().eq('id', participantId);
  if (error) throw new Error(error.message);
}

/**
 * Saves changes to the session (host only). With `onlyIfUnmoved`, the change
 * is skipped when the session has already moved to another round or stage,
 * which stops an automatic step from being applied twice. Returns the saved
 * session, or null when nothing was changed.
 */
export async function updateSession(
  session: LiveSession,
  changes: SessionChanges,
  onlyIfUnmoved = false,
): Promise<LiveSession | null> {
  let query = requireSupabase().from('sessions').update(changes).eq('id', session.id);
  if (onlyIfUnmoved) query = query.eq('round', session.round).eq('stage', session.stage);

  const { data, error } = await query.select().maybeSingle();
  if (error) throw new Error(error.message);
  return data as LiveSession | null;
}

// ---------------------------------------------------------------------------
// Session steps (what to save for each thing the host can do)
// ---------------------------------------------------------------------------

export function rosterFrom(participants: LiveParticipant[]): Participant[] {
  return participants.map((p) => ({ id: p.id, name: p.name }));
}

function stageDurationMs(session: LiveSession, stage: LiveSession['stage']): number {
  return stage === 'changeover' ? CHANGEOVER_SECONDS * 1000 : session.round_minutes * 60 * 1000;
}

function timestampAfter(now: number, ms: number): string {
  return new Date(now + ms).toISOString();
}

/** Timer state at the start of a round. */
function roundStart(session: LiveSession, now: number): SessionChanges {
  return session.auto_advance
    ? {
        stage: 'changeover',
        ends_at: timestampAfter(now, stageDurationMs(session, 'changeover')),
        remaining_ms: null,
      }
    : {
        stage: 'discussion',
        ends_at: null,
        remaining_ms: stageDurationMs(session, 'discussion'),
      };
}

export function startSession(
  session: LiveSession,
  participants: LiveParticipant[],
  now: number,
): SessionChanges {
  return { status: 'playing', round: 0, roster: rosterFrom(participants), ...roundStart(session, now) };
}

/** Moves to the next round, or finishes the session after the last one. */
export function nextRound(
  session: LiveSession,
  participants: LiveParticipant[],
  now: number,
): SessionChanges {
  if (session.round + 1 >= session.round_count) return endSession();
  return {
    round: session.round + 1,
    // Picks up anyone who joined or was removed during the last round.
    roster: rosterFrom(participants),
    ...roundStart(session, now),
  };
}

/** Automatic mode: the changeover is over, start the discussion clock. */
export function beginDiscussion(session: LiveSession, now: number): SessionChanges {
  return {
    stage: 'discussion',
    ends_at: timestampAfter(now, stageDurationMs(session, 'discussion')),
    remaining_ms: null,
  };
}

export function startTimer(session: LiveSession, now: number): SessionChanges {
  return { ends_at: timestampAfter(now, remainingMs(session, now)), remaining_ms: null };
}

export function pauseTimer(session: LiveSession, now: number): SessionChanges {
  return { ends_at: null, remaining_ms: remainingMs(session, now) };
}

export function resetTimer(session: LiveSession): SessionChanges {
  return { ends_at: null, remaining_ms: stageDurationMs(session, session.stage) };
}

export function endSession(): SessionChanges {
  return { status: 'finished', ends_at: null, remaining_ms: 0 };
}

// ---------------------------------------------------------------------------
// Reading the session
// ---------------------------------------------------------------------------

export function remainingMs(session: LiveSession, now: number): number {
  if (session.ends_at) return Math.max(0, Date.parse(session.ends_at) - now);
  return session.remaining_ms ?? 0;
}

/**
 * The question a group discusses this round at the given level. Every phone
 * works this out the same way, so partners who pick the same level see the
 * same question, and different groups get different questions.
 */
export function questionForGroup(
  session: LiveSession,
  level: Level,
  groupIndex: number,
  groupCount: number,
): Question | null {
  const pool = findQuestions(level, session.categories);
  if (pool.length === 0) return null;

  const ordered = shuffle(pool, session.seed + LEVELS.indexOf(level));
  return ordered[(session.round * groupCount + groupIndex) % ordered.length];
}

export function formatCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

function randomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) code += Math.floor(Math.random() * 10);
  return code;
}
