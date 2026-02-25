'use client';

import Link from 'next/link';
import type { RepoSearchHit } from '@/lib/types';

export interface RepoCardProps {
  repo: RepoSearchHit;
}

export function RepoCard({ repo }: RepoCardProps) {
  const fullName = `${repo.ownerLogin}/${repo.name}`;
  const contributors = repo.contributors?.edges?.map((e) => e.login).filter(Boolean) ?? [];

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <a
            href={`https://github.com/${repo.ownerLogin}/${repo.name}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600 }}
          >
            {fullName}
          </a>
          {repo.description && (
            <p className="line-clamp-2 text-muted mt-2" style={{ fontSize: '0.9375rem', lineHeight: 1.5 }}>
              {repo.description}
            </p>
          )}
          <div className="cluster mt-3 text-muted" style={{ flexWrap: 'wrap', gap: 'var(--space-3)', fontSize: '0.75rem' }}>
            {repo.language && (
              <span className="badge badge--neutral">{repo.language}</span>
            )}
            <span>★ {repo.stargazerCount}</span>
            {repo.owner?.displayName && (
              <span>Owner: {repo.owner.displayName}</span>
            )}
          </div>
        </div>
      </div>
      {contributors.length > 0 && (
        <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
          <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: 'var(--space-2)' }}>
            Contributors → developers
          </p>
          <div className="cluster" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {contributors.slice(0, 8).map((login) => (
              <Link
                key={login}
                href={`/developers/${login}`}
                style={{ fontSize: '0.9375rem' }}
              >
                @{login}
              </Link>
            ))}
            {contributors.length > 8 && (
              <span className="text-muted" style={{ fontSize: '0.9375rem' }}>+{contributors.length - 8} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
