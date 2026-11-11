/**
 * The syllabus: each level is divided into 16 weeks, and each week has a
 * topic and a grammar focus. It normally comes from the `weeks` table in
 * Supabase (see supabase/schema.sql), where it can be edited. The plan in
 * this file is a draft, used when the database is not set up or cannot be
 * reached.
 */
import { LEVELS, type Level } from '@/data/questions';

export const WEEKS_PER_LEVEL = 16;

export type Week = {
  level: Level;
  /** 1 to 16. */
  week: number;
  topic: string;
  grammar: string;
};

const DRAFT_SYLLABUS: Record<Level, [topic: string, grammar: string][]> = {
  A1: [
    ['Greetings and introductions', 'be: am / is / are'],
    ['Countries and nationalities', 'be: questions and negatives'],
    ['Family', 'Possessive adjectives and \'s'],
    ['Everyday objects', 'a / an, plurals, this / that / these / those'],
    ['Daily routines', 'Present simple: I / you / we / they'],
    ['Free time', 'Present simple: he / she / it'],
    ['Food and drink', 'Countable and uncountable nouns, some / any'],
    ['Home', 'there is / there are'],
    ['Places in town', 'Prepositions of place'],
    ['Times and dates', 'Prepositions of time: in / on / at'],
    ['Abilities and hobbies', 'can / can\'t'],
    ['Likes and dislikes', 'like / love / hate + -ing'],
    ['Clothes and shopping', 'Present continuous'],
    ['Weather and seasons', 'Adverbs of frequency'],
    ['Yesterday', 'was / were'],
    ['Weekends and holidays', 'Past simple: regular verbs'],
  ],
  A2: [
    ['Life stories', 'Past simple: regular and irregular verbs'],
    ['Travel and transport', 'Past simple: questions and negatives'],
    ['Childhood memories', 'Past continuous'],
    ['Food and restaurants', 'Quantifiers: much / many / a lot of'],
    ['Shopping', 'Comparative adjectives'],
    ['Cities and countries', 'Superlative adjectives'],
    ['Plans and weekends', 'be going to'],
    ['Predictions and weather', 'will / won\'t'],
    ['Experiences', 'Present perfect with ever / never'],
    ['Health and the body', 'should / shouldn\'t'],
    ['Rules at work and school', 'have to / don\'t have to / must'],
    ['Technology and gadgets', 'Present perfect with just / already / yet'],
    ['Jobs', 'Verb + -ing or to + infinitive'],
    ['Entertainment and media', 'Adjectives and adverbs of manner'],
    ['Nature and animals', 'First conditional'],
    ['Invitations and arrangements', 'Present continuous for future arrangements'],
  ],
  B1: [
    ['Getting to know you', 'Present simple and continuous, state verbs'],
    ['Travel stories', 'Narrative tenses: past simple, past continuous, past perfect'],
    ['Life experiences', 'Present perfect and past simple'],
    ['Work and careers', 'Present perfect continuous with for / since'],
    ['Future plans', 'will, be going to, present continuous'],
    ['Education', 'Modals of obligation and advice'],
    ['Health and lifestyle', 'Zero and first conditionals'],
    ['Money', 'Second conditional'],
    ['Media and news', 'Passive: present and past'],
    ['Technology', 'Defining relative clauses'],
    ['The environment', 'will / may / might for predictions'],
    ['Childhood and change', 'used to / would'],
    ['Relationships', 'Reported speech: statements'],
    ['Food culture', 'Comparisons: as ... as, much / far + comparative'],
    ['Crime and rules', 'Modals of deduction: must / might / can\'t'],
    ['Entertainment', 'Gerunds and infinitives'],
  ],
  B2: [
    ['Identity and personality', 'Present habits: tend to, will, keep + -ing'],
    ['Memorable journeys', 'Narrative tenses including past perfect continuous'],
    ['Work-life balance', 'Future continuous and future perfect'],
    ['Science and discovery', 'Passive in all tenses, have something done'],
    ['Regrets and decisions', 'Third conditional'],
    ['What if?', 'Mixed conditionals'],
    ['Media and truth', 'Reported speech and reporting verbs'],
    ['Consumerism', 'Non-defining and reduced relative clauses'],
    ['Health and medicine', 'Past modals: should have / could have'],
    ['Mysteries', 'Past modals of deduction'],
    ['Sustainability', 'wish / if only'],
    ['Cities and housing', 'Articles and quantifiers'],
    ['Arts and culture', 'Gerund or infinitive with a change of meaning'],
    ['Technology and society', 'Contrast and concession: although, despite, however'],
    ['Education and learning', 'used to / be used to / get used to'],
    ['Communication and manners', 'Indirect questions and question tags'],
  ],
  C1: [
    ['Language and identity', 'Aspect: perfect and continuous forms'],
    ['Work and ambition', 'Future forms: be about to, be due to, be bound to'],
    ['Ethics and dilemmas', 'Mixed and inverted conditionals'],
    ['Media and influence', 'Passive reporting: is said to, is believed to'],
    ['Science and progress', 'Cleft sentences: What ..., It is ... that'],
    ['Memory and the past', 'Participle clauses'],
    ['Politics and power', 'Inversion after negative adverbials'],
    ['Money and inequality', 'Hedging and distancing: seem, appear, tend'],
    ['Psychology and behaviour', 'Modals of speculation, present and past'],
    ['Environment and responsibility', 'Unreal past: wish, it\'s time, would rather'],
    ['Culture and globalisation', 'Relative clauses with prepositions and quantifiers'],
    ['Art and creativity', 'Ellipsis and substitution'],
    ['Technology and privacy', 'Formal discourse markers'],
    ['Education and success', 'Perfect and passive gerunds and infinitives'],
    ['Health and well-being', 'Emphasis: do / did, intensifiers'],
    ['The future of society', 'Nominalisation'],
  ],
  C2: [
    ['Language and thought', 'Nuanced tense and aspect choices'],
    ['Truth and knowledge', 'Epistemic modality and hedging'],
    ['Justice and law', 'Subjunctive and formal mandative structures'],
    ['Power and persuasion', 'Rhetorical devices and emphatic inversion'],
    ['Ethics of technology', 'Advanced conditionals: but for, were it not for, supposing'],
    ['Identity and belonging', 'Fronting and marked word order'],
    ['Economics and value', 'Nominalisation and dense noun phrases'],
    ['Art and interpretation', 'Metaphor, idiom and connotation'],
    ['History and memory', 'Future in the past, perfect infinitives'],
    ['Science and uncertainty', 'Concession: albeit, notwithstanding, much as'],
    ['Media and manipulation', 'Reporting with stance and distancing'],
    ['Humour and irony', 'Understatement and register shifts'],
    ['Nature and humanity', 'Participle and verbless clauses'],
    ['Work and meaning', 'Ellipsis, substitution and cohesion'],
    ['Globalisation and culture', 'Complex relative and cleft structures'],
    ['The human condition', 'Style, register and precision'],
  ],
};

export const BUILT_IN_WEEKS: Week[] = LEVELS.flatMap((level) =>
  DRAFT_SYLLABUS[level].map(([topic, grammar], index) => ({
    level,
    week: index + 1,
    topic,
    grammar,
  })),
);

export function findWeek(
  weeks: readonly Week[],
  level: Level,
  week: number | null | undefined,
): Week | null {
  if (week == null) return null;
  return weeks.find((w) => w.level === level && w.week === week) ?? null;
}
