export type Participant = {
  /** Stable guest ID, e.g. "G-01". */
  id: string;
  name: string;
};

/** Two people normally; three when there is an odd number of participants. */
export type Group = Participant[];

/**
 * How many rounds can be played before anyone meets the same partner twice.
 */
export function uniqueRoundCount(participantCount: number): number {
  if (participantCount < 2) return 0;
  return participantCount % 2 === 0 ? participantCount - 1 : participantCount;
}

/**
 * Pairs everyone up for the given round (0-based) using the "circle method":
 * the first seat stays fixed and everyone else rotates one seat per round, so
 * each person meets a new partner every round until the cycle repeats.
 *
 * With an odd number of participants nobody sits out: the person without a
 * partner joins one of the pairs, making a group of three.
 */
export function groupsForRound(participants: Participant[], round: number): Group[] {
  if (participants.length < 2) return [];

  const seats: (Participant | null)[] = [...participants];
  if (seats.length % 2 === 1) seats.push(null);

  const count = seats.length;
  const [fixed, ...rest] = seats;
  const shift = round % (count - 1);
  const order = [fixed, ...rest.slice(shift), ...rest.slice(0, shift)];

  const groups: Group[] = [];
  let unpaired: Participant | null = null;

  for (let i = 0; i < count / 2; i++) {
    const a = order[i];
    const b = order[count - 1 - i];
    if (a && b) groups.push([a, b]);
    else unpaired = a ?? b;
  }

  if (unpaired) {
    if (groups.length === 0) return [[unpaired]];
    groups[round % groups.length].push(unpaired);
  }

  return groups;
}
