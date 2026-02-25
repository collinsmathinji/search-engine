'use client';

import Link from 'next/link';
import type { DeveloperSearchHit } from '@/lib/types';
import { ScoreWeights } from './ScoreWeights';

const GITHUB_AVATAR = (login: string) => `https://github.com/${login}.png`;

function compositeScore(user: DeveloperSearchHit, weights: ScoreWeights): number {
  const devrank = (user.devrank?.devrank ?? 0) / 100;
  const stars = Math.min(((user.aggregates?.totalStars ?? 0) / 5000), 1);
  const activity = user.contributes?.pageInfo?.totalCount ? Math.min(user.contributes.pageInfo.totalCount / 50, 1) : 0;
  const followers = user.followers?.pageInfo?.totalCount ? Math.min(user.followers.pageInfo.totalCount / 500, 1) : 0;
  return (
    weights.devrank * devrank +
    weights.stars * stars +
    weights.activity * activity +
    weights.followers * followers
  );
}

export interface DeveloperCardProps {
  user: DeveloperSearchHit;
  scoreWeights: ScoreWeights;
  isSaved?: boolean;
  onSave?: (user: DeveloperSearchHit) => void;
  onRemove?: (login: string) => void;
}

export function DeveloperCard({ user, scoreWeights, isSaved, onSave, onRemove }: DeveloperCardProps) {
  const score = compositeScore(user, scoreWeights);
  const languages = user.contributes?.edges?.map((e) => e.language).filter(Boolean) ?? [];

  return (
    <div className="card">
      <div className="card-row">
        <div className="cluster shrink-0" style={{ gap: 'var(--space-4)' }}>
          <img
            src={GITHUB_AVATAR(user.login)}
            alt=""
            className="shrink-0"
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              border: '2px solid var(--color-border)',
              objectFit: 'cover',
              background: 'var(--color-surface-elevated)',
            }}
          />
          <div style={{ minWidth: 0 }}>
            <Link
              href={`/developers/${encodeURIComponent(user.login)}`}
              style={{ fontWeight: 600, color: 'var(--color-text)' }}
            >
              {user.displayName || user.login}
            </Link>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>@{user.login}</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {user.bio && (
            <p className="line-clamp-2 text-muted" style={{ fontSize: '0.9375rem', lineHeight: 1.5 }}>
              {user.bio}
            </p>
          )}
          <div className="cluster mt-2 text-muted" style={{ flexWrap: 'wrap', fontSize: '0.75rem' }}>
            {user.company && <span>{user.company}</span>}
            {user.location && <span>· {user.location}</span>}
            {languages.length > 0 && (
              <span>· {[...new Set(languages)].slice(0, 3).join(', ')}</span>
            )}
          </div>
          <div className="cluster mt-3" style={{ flexWrap: 'wrap', gap: 'var(--space-3)', fontSize: '0.75rem' }}>
            {user.devrank?.devrank != null && (
              <span className="badge badge--accent">DevRank {user.devrank.devrank}</span>
            )}
            {user.aggregates?.totalStars != null && (
              <span className="text-muted">★ {user.aggregates.totalStars}</span>
            )}
            {user.followers?.pageInfo?.totalCount != null && (
              <span className="text-muted">Followers {user.followers.pageInfo.totalCount}</span>
            )}
            <span className="badge badge--gold">Score {(score * 100).toFixed(0)}</span>
          </div>
        </div>
        <div className="cluster shrink-0" style={{ gap: 'var(--space-2)' }}>
          <Link
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--secondary"
            style={{ fontSize: '0.875rem' }}
          >
            GitHub
          </Link>
          {onSave && !isSaved && (
            <button type="button" onClick={() => onSave(user)} className="btn btn--primary" style={{ fontSize: '0.875rem' }}>
              Save
            </button>
          )}
          {onRemove && isSaved && (
            <button type="button" onClick={() => onRemove(user.login)} className="btn btn--danger" style={{ fontSize: '0.875rem' }}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

