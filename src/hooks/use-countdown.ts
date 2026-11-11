import { useEffect, useEffectEvent, useState } from 'react';

type CountdownOptions = {
  /** Start counting immediately instead of waiting for `start()`. */
  autoStart?: boolean;
  /** Called once when the countdown reaches zero. */
  onFinish?: () => void;
};

/**
 * A pausable countdown. Unless `autoStart` is set it begins paused, so the
 * host can let people find their partners before the clock runs.
 */
export function useCountdown(durationSeconds: number, options: CountdownOptions = {}) {
  const [remainingMs, setRemainingMs] = useState(durationSeconds * 1000);
  const [running, setRunning] = useState(options.autoStart ?? false);

  const finished = remainingMs <= 0;
  const ticking = running && !finished;

  useEffect(() => {
    if (!ticking) return;

    let last = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - last;
      last = now;
      setRemainingMs((ms) => Math.max(0, ms - elapsed));
    }, 200);

    return () => clearInterval(interval);
  }, [ticking]);

  const notifyFinished = useEffectEvent(() => options.onFinish?.());
  useEffect(() => {
    if (finished) notifyFinished();
  }, [finished]);

  return {
    remainingSeconds: Math.ceil(remainingMs / 1000),
    running: ticking,
    finished,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => {
      setRunning(options.autoStart ?? false);
      setRemainingMs(durationSeconds * 1000);
    },
  };
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
