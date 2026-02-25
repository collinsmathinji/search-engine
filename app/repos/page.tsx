'use client';

import { useCallback, useState } from 'react';
import { RepoCard } from '@/components/RepoCard';
import type { RepoSearchHit } from '@/lib/types';

export default function ReposPage() {
  const [query, setQuery] = useState('');
  const [naturalLanguage, setNaturalLanguage] = useState(true);
  const [language, setLanguage] = useState('');
  const [minStars, setMinStars] = useState('');
  const [repos, setRepos] = useState<RepoSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<{ endCursor?: string; hasNextPage?: boolean } | null>(null);

  const search = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        params.set('natural', naturalLanguage ? 'true' : 'false');
        if (language) params.set('language', language);
        if (minStars) params.set('minStars', minStars);
        if (cursor) params.set('after', cursor);
        params.set('maxResults', '20');
        const res = await fetch(`/api/repos/search?${params}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Search failed');
        }
        const data = await res.json();
        if (cursor) {
          setRepos((prev) => [...prev, ...(data.repositories ?? [])]);
        } else {
          setRepos(data.repositories ?? []);
        }
        setPageInfo(data.pageInfo ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Search failed');
        if (!cursor) setRepos([]);
      } finally {
        setLoading(false);
      }
    },
    [query, naturalLanguage, language, minStars]
  );

  const loadMore = () => {
    if (pageInfo?.endCursor && !loading) search(pageInfo.endCursor);
  };

  return (
    <div className="container container--medium page">
      <div className="card mb-4">
        <p>
          <strong>Repository discovery.</strong> Semantic search for repos. Filter by language and stars; open contributors to find developers.
        </p>
      </div>

      <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 'var(--space-1)' }}>
        Search repositories
      </h2>
      <p className="text-muted mt-2" style={{ fontSize: '0.9375rem' }}>
        e.g. &quot;payment processing microservice in Go&quot;
      </p>

      <div className="card mt-6">
        <div className="stack input-group--col">
          <input
            type="search"
            placeholder="e.g. payment processing microservice in Go"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            className="input"
          />
          <div className="input-group">
            <label className="cluster" style={{ cursor: 'pointer', fontSize: '0.9375rem', color: 'var(--color-text-muted)' }}>
              <input
                type="checkbox"
                checked={naturalLanguage}
                onChange={(e) => setNaturalLanguage(e.target.checked)}
                style={{ accentColor: 'var(--color-accent)' }}
              />
              Natural language
            </label>
            <input
              type="text"
              placeholder="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input input--sm"
            />
            <input
              type="number"
              placeholder="Min stars"
              value={minStars}
              onChange={(e) => setMinStars(e.target.value)}
              className="input input--sm"
            />
            <button type="button" onClick={() => search()} className="btn btn--primary">
              Search
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert--error mt-4">{error}</div>}

      {loading && repos.length === 0 && (
        <div className="text-center text-muted mt-6" style={{ padding: '3rem 0' }}>
          Loading...
        </div>
      )}

      {!loading && repos.length === 0 && !error && query && (
        <div className="text-center text-muted mt-6" style={{ padding: '3rem 0' }}>
          No repositories found. Try a different query.
        </div>
      )}

      <div className="stack mt-8">
        {repos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>

      {pageInfo?.hasNextPage && (
        <div className="text-center mt-8">
          <button type="button" onClick={loadMore} disabled={loading} className="btn btn--secondary">
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
