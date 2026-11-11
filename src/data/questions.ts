/**
 * Placeholder question bank. Replace or extend this list with your own
 * questions — each one needs a level and a category.
 */

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Level = (typeof LEVELS)[number];

export const CATEGORIES = ['Daily life', 'Travel', 'Work & study', 'Opinions'] as const;
export type Category = (typeof CATEGORIES)[number];

export type Question = {
  text: string;
  level: Level;
  category: Category;
};

export const QUESTIONS: Question[] = [
  // A1
  { level: 'A1', category: 'Daily life', text: 'What do you usually eat for breakfast?' },
  { level: 'A1', category: 'Daily life', text: 'Who is in your family?' },
  { level: 'A1', category: 'Travel', text: 'Which city or town are you from? What is it like?' },
  { level: 'A1', category: 'Travel', text: 'How do you get to class?' },
  { level: 'A1', category: 'Work & study', text: 'What is your job, or what do you study?' },
  { level: 'A1', category: 'Work & study', text: 'What time do you start work or school?' },
  { level: 'A1', category: 'Opinions', text: 'What is your favourite food? Why do you like it?' },
  { level: 'A1', category: 'Opinions', text: 'Do you like cats or dogs more?' },

  // A2
  { level: 'A2', category: 'Daily life', text: 'What did you do last weekend?' },
  { level: 'A2', category: 'Daily life', text: 'Describe your typical day from morning to night.' },
  { level: 'A2', category: 'Travel', text: 'Tell your partner about a trip you enjoyed.' },
  { level: 'A2', category: 'Travel', text: 'What do you always take with you when you travel?' },
  { level: 'A2', category: 'Work & study', text: 'What was your favourite subject at school? Why?' },
  { level: 'A2', category: 'Work & study', text: 'What are you going to do after this class?' },
  { level: 'A2', category: 'Opinions', text: 'Is it better to live in a city or in the countryside?' },
  { level: 'A2', category: 'Opinions', text: 'What makes a good friend?' },

  // B1
  { level: 'B1', category: 'Daily life', text: 'How has your daily routine changed in the last five years?' },
  { level: 'B1', category: 'Daily life', text: 'What do you do to relax after a stressful day?' },
  { level: 'B1', category: 'Travel', text: 'If you could visit any country next month, where would you go and why?' },
  { level: 'B1', category: 'Travel', text: 'Describe a time when something went wrong on a journey.' },
  { level: 'B1', category: 'Work & study', text: 'What would your ideal job be like?' },
  { level: 'B1', category: 'Work & study', text: 'What is the most useful thing you have ever learned?' },
  { level: 'B1', category: 'Opinions', text: 'Do people spend too much time on their phones?' },
  { level: 'B1', category: 'Opinions', text: 'Should children have homework every day?' },

  // B2
  { level: 'B2', category: 'Daily life', text: 'Which habit would you most like to change, and what has stopped you so far?' },
  { level: 'B2', category: 'Daily life', text: 'How do you balance what you have to do with what you want to do?' },
  { level: 'B2', category: 'Travel', text: 'Does tourism do more good or more harm to the places people visit?' },
  { level: 'B2', category: 'Travel', text: 'Would you rather travel alone or with others? What are the trade-offs?' },
  { level: 'B2', category: 'Work & study', text: 'Is working from home better for employees, for employers, or for neither?' },
  { level: 'B2', category: 'Work & study', text: 'What skills will matter most at work in ten years?' },
  { level: 'B2', category: 'Opinions', text: 'Should voting be compulsory?' },
  { level: 'B2', category: 'Opinions', text: 'Is it ever acceptable to tell a lie?' },

  // C1
  { level: 'C1', category: 'Daily life', text: 'To what extent do the things we own shape who we are?' },
  { level: 'C1', category: 'Daily life', text: 'How has the meaning of "community" changed in your lifetime?' },
  { level: 'C1', category: 'Travel', text: 'Can you really understand a culture without speaking its language?' },
  { level: 'C1', category: 'Travel', text: 'Is the idea of "authentic" travel a myth?' },
  { level: 'C1', category: 'Work & study', text: 'Should universities prepare people for jobs or teach them how to think?' },
  { level: 'C1', category: 'Work & study', text: 'What are the hidden costs of a culture that glorifies being busy?' },
  { level: 'C1', category: 'Opinions', text: 'Where should the line be drawn between free speech and causing harm?' },
  { level: 'C1', category: 'Opinions', text: 'Is economic growth compatible with protecting the environment?' },

  // C2
  { level: 'C2', category: 'Daily life', text: 'Is convenience eroding our capacity for patience, and does it matter if it is?' },
  { level: 'C2', category: 'Daily life', text: 'In what ways do everyday rituals quietly hold a society together?' },
  { level: 'C2', category: 'Travel', text: 'Does ease of travel homogenise the world or deepen our appreciation of difference?' },
  { level: 'C2', category: 'Travel', text: 'Is there an ethical obligation to stay away from fragile destinations?' },
  { level: 'C2', category: 'Work & study', text: 'If machines could do all necessary work, what would give human effort its value?' },
  { level: 'C2', category: 'Work & study', text: 'Is meritocracy an achievable ideal or a comforting fiction?' },
  { level: 'C2', category: 'Opinions', text: 'Can moral progress be measured, and if so, by whose standards?' },
  { level: 'C2', category: 'Opinions', text: 'Are we responsible for the unintended consequences of our good intentions?' },
];

export function findQuestions(level: Level, categories: readonly Category[]): Question[] {
  return QUESTIONS.filter((q) => q.level === level && categories.includes(q.category));
}
