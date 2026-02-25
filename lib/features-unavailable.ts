/**
 * Feature keys returned by API when a feature is not activated (e.g. 403 fallback).
 * Used to show the user which capabilities are missing on their plan.
 */

export type DeveloperFeaturesUnavailable = {
  devrank?: boolean;
  aggregates?: boolean;
  contributes?: boolean;
  followers?: boolean;
};

export type RepoFeaturesUnavailable = {
  contributors?: boolean;
  owner?: boolean;
};

const DEVELOPER_LABELS: Record<keyof DeveloperFeaturesUnavailable, string> = {
  devrank: 'DevRank',
  aggregates: 'Total stars',
  contributes: 'Activity & top languages',
  followers: 'Follower count',
};

const REPO_LABELS: Record<keyof RepoFeaturesUnavailable, string> = {
  contributors: 'Contributor list',
  owner: 'Owner details',
};

export function getDeveloperUnavailableMessages(features: DeveloperFeaturesUnavailable | undefined): string[] {
  if (!features) return [];
  return (Object.keys(features) as Array<keyof DeveloperFeaturesUnavailable>)
    .filter((k) => features[k])
    .map((k) => DEVELOPER_LABELS[k]);
}

export function getRepoUnavailableMessages(features: RepoFeaturesUnavailable | undefined): string[] {
  if (!features) return [];
  return (Object.keys(features) as Array<keyof RepoFeaturesUnavailable>)
    .filter((k) => features[k])
    .map((k) => REPO_LABELS[k]);
}

export function hasAnyUnavailable(
  features: DeveloperFeaturesUnavailable | RepoFeaturesUnavailable | undefined
): boolean {
  if (!features) return false;
  return Object.values(features).some(Boolean);
}
