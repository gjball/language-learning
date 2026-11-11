import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { BUILT_IN_QUESTIONS, LEVELS, type Level, type Question } from '@/data/questions';
import { supabase } from '@/lib/supabase';

/** Give up on the database after this long and use the built-in questions. */
const LOAD_TIMEOUT_MS = 6000;

const QuestionsContext = createContext<readonly Question[]>(BUILT_IN_QUESTIONS);

/** The questions the app is using: from the database, or the built-in list. */
export function useQuestions(): readonly Question[] {
  return use(QuestionsContext);
}

async function loadQuestions(): Promise<Question[] | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('questions')
    .select('level, topic, text')
    .eq('active', true)
    // A fixed order, so every phone shuffles the same list the same way.
    .order('id');
  if (error || !data) return null;

  const questions = data.filter(
    (row): row is Question =>
      LEVELS.includes(row.level as Level) &&
      typeof row.topic === 'string' &&
      typeof row.text === 'string',
  );
  return questions.length > 0 ? questions : null;
}

/**
 * Loads the questions once when the app opens and shares them with every
 * screen. Nothing is shown until they are ready, so a screen never starts
 * with one list and then switches to another.
 */
export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<readonly Question[] | null>(
    supabase ? null : BUILT_IN_QUESTIONS,
  );

  useEffect(() => {
    if (!supabase) return;
    let settled = false;
    const settle = (loaded: Question[] | null) => {
      if (settled) return;
      settled = true;
      setQuestions(loaded ?? BUILT_IN_QUESTIONS);
    };

    const timeout = setTimeout(() => settle(null), LOAD_TIMEOUT_MS);
    loadQuestions().then(settle, () => settle(null));

    return () => {
      settled = true;
      clearTimeout(timeout);
    };
  }, []);

  if (!questions) return null;
  return <QuestionsContext value={questions}>{children}</QuestionsContext>;
}
