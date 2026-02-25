'use client';

import {
  getDeveloperUnavailableMessages,
  getRepoUnavailableMessages,
  hasAnyUnavailable,
  type DeveloperFeaturesUnavailable,
  type RepoFeaturesUnavailable,
} from '@/lib/features-unavailable';

type Props =
  | { kind: 'developer'; features: DeveloperFeaturesUnavailable | undefined }
  | { kind: 'repo'; features: RepoFeaturesUnavailable | undefined };

/**
 * Shows a clear message when the API ran with limited features (e.g. 403 fallback).
 * Tells the user which features have not been activated on their plan.
 */
export function FeatureUnavailableBanner({ kind, features }: Props) {
  if (!hasAnyUnavailable(features)) return null;

  const messages = kind === 'developer'
    ? getDeveloperUnavailableMessages(features as DeveloperFeaturesUnavailable)
    : getRepoUnavailableMessages(features as RepoFeaturesUnavailable);

  if (messages.length === 0) return null;

  return (
    <div
      role="status"
      className="alert alert--warning"
      style={{ marginTop: '1rem' }}
    >
      <p className="font-medium">
        The following {kind === 'developer' ? 'developer' : 'repository'} features have not been activated on your plan:
      </p>
      <ul className="mt-2 list-disc list-inside text-dim" style={{ fontSize: '0.9375rem' }}>
        {messages.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
      <p className="mt-2 text-dim" style={{ fontSize: '0.875rem' }}>
        Results are still shown, but scores and some details may be missing. Check your BountyLab plan or API key to enable these features.
      </p>
    </div>
  );
}
