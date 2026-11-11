import { useState } from 'react';

import { CATEGORIES, findQuestions } from '@/data/questions';
import { shuffle, type Session, type SessionSettings } from '@/lib/session';
import { FinishedScreen } from '@/screens/finished-screen';
import { RoundScreen } from '@/screens/round-screen';
import { SetupScreen } from '@/screens/setup-screen';

type Phase =
  | { name: 'setup' }
  | { name: 'playing'; session: Session; round: number; questionIndex: number }
  | { name: 'finished'; roundsPlayed: number };

const DEFAULT_SETTINGS: SessionSettings = {
  participants: [],
  level: 'B1',
  categories: [...CATEGORIES],
  roundMinutes: 3,
  roundCount: 3,
  autoAdvance: false,
};

export default function HomeScreen() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<Phase>({ name: 'setup' });

  if (phase.name === 'setup') {
    return (
      <SetupScreen
        settings={settings}
        onChange={setSettings}
        onStart={() =>
          setPhase({
            name: 'playing',
            session: {
              ...settings,
              questions: shuffle(findQuestions(settings.level, settings.categories)),
            },
            round: 0,
            questionIndex: 0,
          })
        }
      />
    );
  }

  if (phase.name === 'finished') {
    return (
      <FinishedScreen
        roundsPlayed={phase.roundsPlayed}
        studentCount={settings.participants.length}
        onRestart={() => setPhase({ name: 'setup' })}
      />
    );
  }

  const { session, round, questionIndex } = phase;
  const finish = () => setPhase({ name: 'finished', roundsPlayed: round + 1 });

  return (
    <RoundScreen
      // A new key per round gives each round a fresh timer.
      key={round}
      session={session}
      round={round}
      question={session.questions[questionIndex % session.questions.length]}
      onChangeQuestion={() => setPhase({ ...phase, questionIndex: questionIndex + 1 })}
      onNext={() =>
        round + 1 >= session.roundCount
          ? finish()
          : setPhase({ ...phase, round: round + 1, questionIndex: questionIndex + 1 })
      }
      onEnd={finish}
    />
  );
}
