/**
 * Questions normally come from the `questions` table in Supabase (see
 * supabase/schema.sql), where they can be edited without touching the code.
 * The list in this file is the built-in fallback, used when the database is
 * not set up or cannot be reached.
 */

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Level = (typeof LEVELS)[number];

export type Question = {
  text: string;
  level: Level;
  /** A loose label, e.g. "Travel". Questions tied to a week take its topic. */
  topic: string;
  /** The week (1 to 16) this question belongs to; none means a general question. */
  week?: number | null;
};

export const BUILT_IN_QUESTIONS: Question[] = [
  // A1
  { level: 'A1', topic: 'Daily life', text: 'What do you usually eat for breakfast?' },
  { level: 'A1', topic: 'Daily life', text: 'Who is in your family?' },
  { level: 'A1', topic: 'Travel', text: 'Which city or town are you from? What is it like?' },
  { level: 'A1', topic: 'Travel', text: 'How do you get to class?' },
  { level: 'A1', topic: 'Work & study', text: 'What is your job, or what do you study?' },
  { level: 'A1', topic: 'Work & study', text: 'What time do you start work or school?' },
  { level: 'A1', topic: 'Opinions', text: 'What is your favourite food? Why do you like it?' },
  { level: 'A1', topic: 'Opinions', text: 'Do you like cats or dogs more?' },

  // A2
  { level: 'A2', topic: 'Daily life', text: 'What did you do last weekend?' },
  { level: 'A2', topic: 'Daily life', text: 'Describe your typical day from morning to night.' },
  { level: 'A2', topic: 'Travel', text: 'Tell your partner about a trip you enjoyed.' },
  { level: 'A2', topic: 'Travel', text: 'What do you always take with you when you travel?' },
  { level: 'A2', topic: 'Work & study', text: 'What was your favourite subject at school? Why?' },
  { level: 'A2', topic: 'Work & study', text: 'What are you going to do after this class?' },
  { level: 'A2', topic: 'Opinions', text: 'Is it better to live in a city or in the countryside?' },
  { level: 'A2', topic: 'Opinions', text: 'What makes a good friend?' },

  // B1
  { level: 'B1', topic: 'Daily life', text: 'How has your daily routine changed in the last five years?' },
  { level: 'B1', topic: 'Daily life', text: 'What do you do to relax after a stressful day?' },
  { level: 'B1', topic: 'Travel', text: 'If you could visit any country next month, where would you go and why?' },
  { level: 'B1', topic: 'Travel', text: 'Describe a time when something went wrong on a journey.' },
  { level: 'B1', topic: 'Work & study', text: 'What would your ideal job be like?' },
  { level: 'B1', topic: 'Work & study', text: 'What is the most useful thing you have ever learned?' },
  { level: 'B1', topic: 'Opinions', text: 'Do people spend too much time on their phones?' },
  { level: 'B1', topic: 'Opinions', text: 'Should children have homework every day?' },

  // B2
  { level: 'B2', topic: 'Daily life', text: 'Which habit would you most like to change, and what has stopped you so far?' },
  { level: 'B2', topic: 'Daily life', text: 'How do you balance what you have to do with what you want to do?' },
  { level: 'B2', topic: 'Travel', text: 'Does tourism do more good or more harm to the places people visit?' },
  { level: 'B2', topic: 'Travel', text: 'Would you rather travel alone or with others? What are the trade-offs?' },
  { level: 'B2', topic: 'Work & study', text: 'Is working from home better for employees, for employers, or for neither?' },
  { level: 'B2', topic: 'Work & study', text: 'What skills will matter most at work in ten years?' },
  { level: 'B2', topic: 'Opinions', text: 'Should voting be compulsory?' },
  { level: 'B2', topic: 'Opinions', text: 'Is it ever acceptable to tell a lie?' },

  // C1
  { level: 'C1', topic: 'Daily life', text: 'To what extent do the things we own shape who we are?' },
  { level: 'C1', topic: 'Daily life', text: 'How has the meaning of "community" changed in your lifetime?' },
  { level: 'C1', topic: 'Travel', text: 'Can you really understand a culture without speaking its language?' },
  { level: 'C1', topic: 'Travel', text: 'Is the idea of "authentic" travel a myth?' },
  { level: 'C1', topic: 'Work & study', text: 'Should universities prepare people for jobs or teach them how to think?' },
  { level: 'C1', topic: 'Work & study', text: 'What are the hidden costs of a culture that glorifies being busy?' },
  { level: 'C1', topic: 'Opinions', text: 'Where should the line be drawn between free speech and causing harm?' },
  { level: 'C1', topic: 'Opinions', text: 'Is economic growth compatible with protecting the environment?' },

  // C2
  { level: 'C2', topic: 'Daily life', text: 'Is convenience eroding our capacity for patience, and does it matter if it is?' },
  { level: 'C2', topic: 'Daily life', text: 'In what ways do everyday rituals quietly hold a society together?' },
  { level: 'C2', topic: 'Travel', text: 'Does ease of travel homogenise the world or deepen our appreciation of difference?' },
  { level: 'C2', topic: 'Travel', text: 'Is there an ethical obligation to stay away from fragile destinations?' },
  { level: 'C2', topic: 'Work & study', text: 'If machines could do all necessary work, what would give human effort its value?' },
  { level: 'C2', topic: 'Work & study', text: 'Is meritocracy an achievable ideal or a comforting fiction?' },
  { level: 'C2', topic: 'Opinions', text: 'Can moral progress be measured, and if so, by whose standards?' },
  { level: 'C2', topic: 'Opinions', text: 'Are we responsible for the unintended consequences of our good intentions?' },
];

/**
 * The questions for a level and week. With no week chosen, or when the week
 * has no questions of its own yet, this is every question at the level, so a
 * round is never left without a question if the level has any.
 */
export function findQuestions(
  questions: readonly Question[],
  level: Level,
  week: number | null | undefined,
): Question[] {
  const atLevel = questions.filter((q) => q.level === level);
  if (week == null) return atLevel;

  const forWeek = atLevel.filter((q) => q.week === week);
  return forWeek.length > 0 ? forWeek : atLevel;
}

/** How many questions are written specifically for a level and week. */
export function countForWeek(questions: readonly Question[], level: Level, week: number): number {
  return questions.filter((q) => q.level === level && q.week === week).length;
}
