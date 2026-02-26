import type { DevRankData } from '@/lib/types';

/**
 * DevRank docs: https://docs.bountylab.io/
 * crackedScore = 0-100 (main metric). API may also return legacy "devrank" field.
 */
export function getDevRankScore(devrank: DevRankData | null | undefined): number | null {
  if (!devrank) return null;
  const score = devrank.crackedScore ?? devrank.devrank;
  return score != null ? score : null;
}

/** Tier label for display (Elite, Expert, Advanced, Intermediate, Developing). */
export function getDevRankTier(devrank: DevRankData | null | undefined): string | null {
  if (!devrank?.tier) return null;
  return devrank.tier;
}
