import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { BUILT_IN_QUESTIONS, LEVELS, type Level, type Question } from '@/data/questions';
import { BUILT_IN_WEEKS, type Week } from '@/data/weeks';
import { supabase } from '@/lib/supabase';

/** Give up on the database after this long and use the built-in content. */
const LOAD_TIMEOUT_MS = 6000;

type Content = {
  questions: readonly Question[];
  weeks: readonly Week[];
};

const BUILT_IN: Content = { questions: BUILT_IN_QUESTIONS, weeks: BUILT_IN_WEEKS };

const ContentContext = createContext<Content>(BUILT_IN);

/** The questions the app is using: from the database, or the built-in list. */
export function useQuestions(): readonly Question[] {
  return use(ContentContext).questions;
}

/** The 16-week plan for every level: from the database, or the built-in draft. */
export function useWeeks(): readonly Week[] {
  return use(ContentContext).weeks;
}

const isLevel = (value: unknown): value is Level => LEVELS.includes(value as Level);

async function loadQuestions(): Promise<Question[] | null> {
  if (!supabase) return null;

  // A fixed order, so every phone shuffles the same list the same way.
  const read = (columns: string) =>
    supabase!.from('questions').select(columns).eq('active', true).order('id');

  let { data, error } = await read('level, topic, text, week');
  // A database set up before weeks were added has no "week" column.
  if (error) ({ data, error } = await read('level, topic, text'));
  if (error || !data) return null;

  const rows = data as unknown as Record<string, unknown>[];
  const questions = rows.flatMap((row): Question[] =>
    isLevel(row.level) && typeof row.text === 'string'
      ? [
          {
            level: row.level,
            text: row.text,
            topic: typeof row.topic === 'string' ? row.topic : '',
            week: typeof row.week === 'number' ? row.week : null,
          },
        ]
      : [],
  );
  return questions.length > 0 ? questions : null;
}

async function loadWeeks(): Promise<Week[] | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.from('weeks').select('level, week, topic, grammar');
  if (error || !data) return null;

  const weeks = data.flatMap((row): Week[] =>
    isLevel(row.level) && typeof row.week === 'number' && typeof row.topic === 'string'
      ? [
          {
            level: row.level,
            week: row.week,
            topic: row.topic,
            grammar: typeof row.grammar === 'string' ? row.grammar : '',
          },
        ]
      : [],
  );
  return weeks.length > 0 ? weeks : null;
}

async function loadContent(): Promise<Content> {
  const [questions, weeks] = await Promise.all([
    loadQuestions().catch(() => null),
    loadWeeks().catch(() => null),
  ]);
  return { questions: questions ?? BUILT_IN_QUESTIONS, weeks: weeks ?? BUILT_IN_WEEKS };
}

/**
 * Loads the questions and the weekly plan once when the app opens and shares
 * them with every screen. Nothing is shown until they are ready, so a screen
 * never starts with one list and then switches to another.
 */
export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content | null>(supabase ? null : BUILT_IN);

  useEffect(() => {
    if (!supabase) return;
    let settled = false;
    const settle = (loaded: Content) => {
      if (settled) return;
      settled = true;
      setContent(loaded);
    };

    const timeout = setTimeout(() => settle(BUILT_IN), LOAD_TIMEOUT_MS);
    loadContent().then(settle, () => settle(BUILT_IN));

    return () => {
      settled = true;
      clearTimeout(timeout);
    };
  }, []);

  if (!content) return null;
  return <ContentContext value={content}>{children}</ContentContext>;
}
