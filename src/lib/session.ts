import type { Category, Level, Question } from '@/data/questions';
import type { Participant } from '@/lib/round-robin';

/** What the host chooses on the setup screen. */
export type SessionSettings = {
  participants: Participant[];
  level: Level;
  categories: Category[];
  roundMinutes: number;
  roundCount: number;
  /**
   * When true the whole session runs on its own: each round starts after a
   * short changeover and moves on when its time is up.
   */
  autoAdvance: boolean;
};

/** Time given at the start of each automatic round to find a partner. */
export const CHANGEOVER_SECONDS = 20;

/** A session that is being played. */
export type Session = SessionSettings & {
  /** Matching questions in a random order; rounds draw from this in turn. */
  questions: Question[];
};

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
