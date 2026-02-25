'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { FeatureUnavailableBanner } from '@/components/FeatureUnavailableBanner';
import type { DeveloperFeaturesUnavailable } from '@/lib/features-unavailable';

const GITHUB_AVATAR = (login: string) => `https://github.com/${login}.png`;

interface ProfileUser {
  id: string;
  githubId: string;
  login: string;
  displayName?: string | null;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  devrank?: { devrank?: number } | null;
  aggregates?: { totalStars?: number } | null;
  contributes?: {
    edges?: Array<{
      name?: string;
      ownerLogin?: string;
      language?: string | null;
      stargazerCount?: number;
    }>;
    pageInfo?: { totalCount?: number };
  } | null;
  followers?: { pageInfo?: { totalCount?: number } } | null;
  following?: { pageInfo?: { totalCount?: number } } | null;
  owns?: {
    edges?: Array<{
      name?: string;
      ownerLogin?: string;
      language?: string | null;
      stargazerCount?: number;
    }>;
  } | null;
  emails?: string[] | null;
  featuresUnavailable?: DeveloperFeaturesUnavailable;
}

export default function DeveloperProfilePage() {
  const params = useParams();
  const login = typeof params.login === 'string' ? params.login : '';
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState<{ error?: string; userMessage?: string; resetsAt?: string } | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!login) return;
    setLoading(true);
    setErrorData(null);
    try {
      const res = await fetch(`/api/developers/${encodeURIComponent(login)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorData(data);
        setUser(null);
        return;
      }
      setUser(data);
    } catch (e) {
      setErrorData({ error: e instanceof Error ? e.message : 'Failed to load profile' });
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [login]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="container container--narrow page text-center text-muted">
        Loading profile...
      </div>
    );
  }

  if (errorData || !user) {
    return (
      <div className="container container--narrow page">
        <div className="card card--padded text-center">
          {errorData ? (
            <ApiErrorAlert data={errorData} fallback="Could not load this profile." />
          ) : (
            <p style={{ color: 'var(--color-danger)' }}>User not found</p>
          )}
          <Link href="/developers" className="mt-4 inline-block">
            ← Back to search
          </Link>
        </div>
      </div>
    );
  }

  const topRepos = user.contributes?.edges ?? user.owns?.edges ?? [];
  const languages = new Set(
    topRepos.map((r) => r.language).filter(Boolean) as string[]
  );
  const followerCount = user.followers?.pageInfo?.totalCount ?? 0;
  const followingCount = user.following?.pageInfo?.totalCount ?? 0;

  return (
    <div className="container container--narrow page">
      <Link href="/developers" className="text-muted" style={{ fontSize: '0.9375rem' }}>
        ← Back to search
      </Link>

      <FeatureUnavailableBanner kind="developer" features={user.featuresUnavailable} />

      <div className="card mt-6">
        <div className="stack stack--md" style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <img
            src={GITHUB_AVATAR(user.login)}
            alt=""
            className="shrink-0"
            style={{ width: '7rem', height: '7rem', borderRadius: '50%', border: '2px solid var(--color-border)', objectFit: 'cover' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)' }}>
              {user.displayName || user.login}
            </h1>
            <p className="text-muted">@{user.login}</p>
            {user.bio && (
              <p className="mt-4" style={{ lineHeight: 1.6 }}>{user.bio}</p>
            )}
            <div className="cluster mt-4 text-muted" style={{ fontSize: '0.9375rem' }}>
              {user.company && <span>{user.company}</span>}
              {user.location && <span>· {user.location}</span>}
              {user.websiteUrl && (
                <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              )}
            </div>
            <div className="cluster mt-5" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <span className="badge badge--accent">
                DevRank {user.devrank?.devrank ?? '—'}
                {user.featuresUnavailable?.devrank && (
                  <span className="text-dim" style={{ fontSize: '0.75rem', fontWeight: 'normal', marginLeft: '0.25rem' }}>(not activated)</span>
                )}
              </span>
              {user.aggregates?.totalStars != null && (
                <span className="text-muted" style={{ fontSize: '0.9375rem' }}>★ {user.aggregates.totalStars} total stars</span>
              )}
              {user.featuresUnavailable?.aggregates && user.aggregates?.totalStars == null && (
                <span className="text-dim" style={{ fontSize: '0.875rem' }}>Total stars (not activated)</span>
              )}
              <span className="text-muted" style={{ fontSize: '0.9375rem' }}>Followers {followerCount}</span>
              <span className="text-muted" style={{ fontSize: '0.9375rem' }}>Following {followingCount}</span>
            </div>
            <a
              href={`https://github.com/${user.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary mt-5"
            >
              View GitHub profile
            </a>
          </div>
        </div>
      </div>

      {languages.size > 0 && (
        <div className="card mt-6">
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-3)' }}>Top languages</h2>
          <div className="cluster" style={{ flexWrap: 'wrap' }}>
            {[...languages].map((lang) => (
              <span key={lang} className="badge badge--neutral">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {topRepos.length > 0 && (
        <div className="card mt-6">
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)' }}>Top repositories</h2>
          <ul className="stack stack--sm" style={{ listStyle: 'none' }}>
            {topRepos.slice(0, 10).map((repo) => (
              <li
                key={`${repo.ownerLogin}/${repo.name}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-2) 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <a
                  href={`https://github.com/${repo.ownerLogin}/${repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted"
                  style={{ fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {repo.ownerLogin}/{repo.name}
                </a>
                <span className="text-dim shrink-0" style={{ fontSize: '0.75rem' }}>
                  {repo.language ?? ''} · ★ {repo.stargazerCount ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {user.emails?.length ? (
        <div className="card mt-6">
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-2)' }}>Email (obfuscated)</h2>
          <p className="text-muted" style={{ fontSize: '0.9375rem' }}>{user.emails.join(', ')}</p>
        </div>
      ) : null}
    </div>
  );
}
