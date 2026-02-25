// Shared types for API responses and UI

export interface DeveloperSearchHit {
  id: string;
  githubId: string;
  login: string;
  displayName?: string | null;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  resolvedCountry?: string | null;
  resolvedCity?: string | null;
  score?: number;
  devrank?: { devrank?: number } | null;
  aggregates?: { totalStars?: number } | null;
  contributes?: { edges?: Array<{ language?: string | null }>; pageInfo?: { totalCount?: number } } | null;
  followers?: { pageInfo?: { totalCount?: number } } | null;
  emails?: string[] | null;
}

export interface RepoSearchHit {
  id: string;
  githubId: string;
  name: string;
  ownerLogin: string;
  stargazerCount: number;
  description?: string | null;
  language?: string | null;
  score?: number;
  contributors?: { edges?: Array<{ login?: string }>; pageInfo?: { totalCount?: number } } | null;
  owner?: { login?: string; displayName?: string | null } | null;
}

export interface ScoreWeights {
  devrank: number;
  stars: number;
  activity: number;
  followers: number;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  devrank: 0.4,
  stars: 0.25,
  activity: 0.2,
  followers: 0.15,
};
