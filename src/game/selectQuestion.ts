import type { Question } from './types';

export function pickRandomUnused(pool: Question[], usedIds: string[]): Question | null {
  const used = new Set(usedIds);
  const remaining = pool.filter(q => !used.has(q.id));
  if (remaining.length === 0) return null;
  return remaining[Math.floor(Math.random() * remaining.length)];
}

/**
 * Leitner-style weighted pick. Higher weight when:
 *  - never seen (lastSeen === 0)
 *  - more wrong than correct
 *  - long time since last seen (when seen at all)
 */
export interface QuestionStatsLike {
  correctCount: number;
  wrongCount: number;
  lastSeen: number;
}

export function pickWeightedForLearning(
  pool: Question[],
  usedIds: string[],
  statsFor: (id: string) => QuestionStatsLike | undefined,
  now: number = Date.now(),
): Question | null {
  const used = new Set(usedIds);
  const remaining = pool.filter(q => !used.has(q.id));
  if (remaining.length === 0) return null;

  const weights = remaining.map(q => {
    const s = statsFor(q.id);
    if (!s || s.lastSeen === 0) return 5;                    // unseen → high
    const errorBias = 1 + s.wrongCount - s.correctCount;     // can be negative; clamp below
    const recencyBias = Math.min(5, (now - s.lastSeen) / (1000 * 60 * 60)); // hours since seen, capped at 5
    return Math.max(0.5, errorBias) + recencyBias;
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < remaining.length; i++) {
    r -= weights[i];
    if (r <= 0) return remaining[i];
  }
  return remaining[remaining.length - 1];
}
