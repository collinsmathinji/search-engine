'use client';

import { useCallback, useEffect, useState } from 'react';
import { DeveloperCard } from '@/components/DeveloperCard';
import { ScoreWeightsSlider } from '@/components/ScoreWeights';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { FeatureUnavailableBanner } from '@/components/FeatureUnavailableBanner';
import { DEFAULT_SCORE_WEIGHTS, type DeveloperSearchHit, type ScoreWeights } from '@/lib/types';
import type { DeveloperFeaturesUnavailable } from '@/lib/features-unavailable';

type ViewMode = 'cards' | 'table';

export default function DevelopersPage() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [location, setLocation] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [users, setUsers] = useState<DeveloperSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorData, setErrorData] = useState<{ error?: string; userMessage?: string; resetsAt?: string } | null>(null);
  const [pageInfo, setPageInfo] = useState<{ endCursor?: string; hasNextPage?: boolean } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [scoreWeights, setScoreWeights] = useState<ScoreWeights>(DEFAULT_SCORE_WEIGHTS);
  const [savedLogins, setSavedLogins] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);
  const [featuresUnavailable, setFeaturesUnavailable] = useState<DeveloperFeaturesUnavailable | null>(null);
  const [languagesList, setLanguagesList] = useState<string[]>([]);
  const [countriesList, setCountriesList] = useState<string[]>([]);

  const search = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setErrorData(null);
      setFeaturesUnavailable(null);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (language) params.set('language', language);
        if (location) params.set('location', location);
        if (emailDomain) params.set('emailDomain', emailDomain);
        if (cursor) params.set('after', cursor);
        params.set('maxResults', '10');
        const res = await fetch(`/api/developers/search?${params}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErrorData(data);
          if (!cursor) setUsers([]);
          return;
        }
        if (cursor) {
          setUsers((prev) => [...prev, ...(data.users ?? [])]);
        } else {
          setUsers(data.users ?? []);
        }
        setPageInfo(data.pageInfo ?? null);
        setFeaturesUnavailable(data.featuresUnavailable ?? null);
      } catch (e) {
        setErrorData({ error: e instanceof Error ? e.message : 'Search failed' });
        if (!cursor) setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [query, language, location, emailDomain]
  );

  useEffect(() => {
    const saved = localStorage.getItem('bountylab_saved_developers');
    if (saved) {
      try {
        const logins = JSON.parse(saved) as string[];
        setSavedLogins(new Set(logins));
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/data/languages.json').then((r) => r.json() as Promise<string[]>),
      fetch('/data/countries.json').then((r) => r.json() as Promise<string[]>),
    ]).then(([langs, countries]) => {
      setLanguagesList(langs ?? []);
      setCountriesList(countries ?? []);
    }).catch(() => {});
  }, []);

  const handleSave = useCallback(async (user: DeveloperSearchHit) => {
    setSaveError(null);
    const next = new Set(savedLogins);
    next.add(user.login);
    setSavedLogins(next);
    localStorage.setItem('bountylab_saved_developers', JSON.stringify([...next]));
    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: user.login,
          github_id: user.githubId,
          display_name: user.displayName ?? null,
          avatar_url: `https://github.com/${user.login}.png`,
          bio: user.bio ?? null,
          company: user.company ?? null,
          location: user.location ?? null,
          top_languages: user.contributes?.edges?.map((e) => e.language).filter(Boolean) ?? [],
          devrank_score: user.devrank?.devrank ?? null,
          follower_count: user.followers?.pageInfo?.totalCount ?? null,
          total_stars: user.aggregates?.totalStars ?? null,
          notes: null,
          tags: [],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || 'Could not save to pipeline');
        next.delete(user.login);
        setSavedLogins(new Set(next));
      }
    } catch {
      setSaveError('Could not save to pipeline');
      next.delete(user.login);
      setSavedLogins(new Set(next));
    }
  }, [savedLogins]);

  const handleRemove = useCallback((login: string) => {
    const next = new Set(savedLogins);
    next.delete(login);
    setSavedLogins(next);
    localStorage.setItem('bountylab_saved_developers', JSON.stringify([...next]));
    fetch(`/api/pipeline/${encodeURIComponent(login)}`, { method: 'DELETE' }).catch(() => {});
  }, [savedLogins]);

  const loadMore = () => {
    if (pageInfo?.endCursor && !loading) search(pageInfo.endCursor);
  };

  const sorted = [...users].sort((a, b) => {
    const sa = scoreWeights.devrank * ((a.devrank?.devrank ?? 0) / 100) +
      scoreWeights.stars * Math.min((a.aggregates?.totalStars ?? 0) / 5000, 1) +
      scoreWeights.activity * Math.min((a.contributes?.pageInfo?.totalCount ?? 0) / 50, 1) +
      scoreWeights.followers * Math.min((a.followers?.pageInfo?.totalCount ?? 0) / 500, 1);
    const sb = scoreWeights.devrank * ((b.devrank?.devrank ?? 0) / 100) +
      scoreWeights.stars * Math.min((b.aggregates?.totalStars ?? 0) / 5000, 1) +
      scoreWeights.activity * Math.min((b.contributes?.pageInfo?.totalCount ?? 0) / 50, 1) +
      scoreWeights.followers * Math.min((b.followers?.pageInfo?.totalCount ?? 0) / 500, 1);
    return sb - sa;
  });

  return (
    <div className="container page">
      <div className="card mb-4">
        <p>
          <strong>Developer search.</strong> Full-text search by name, bio, skills, company, or location. Filter, save to pipeline, and export.
        </p>
      </div>

      <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 'var(--space-1)' }}>
        Search
      </h2>
      <p className="text-muted mt-2" style={{ fontSize: '0.9375rem' }}>
        Enter a query and optional filters, then run search.
      </p>

      <div className="sidebar-layout mt-6">
        <div className="stack">
          <div className="card">
            <div className="input-group input-group--col">
              <input
                type="search"
                placeholder="Search developers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                className="input"
                style={{ flex: 1, minWidth: 0 }}
              />
              <div className="input-group">
                <select
                  aria-label="Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input"
                  style={{ minWidth: '11rem' }}
                >
                  <option value="">All languages</option>
                  {languagesList.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input"
                  style={{ minWidth: '11rem' }}
                >
                  <option value="">All countries</option>
                  {countriesList.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Email domain"
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  className="input input--md"
                />
                <button type="button" onClick={() => search()} className="btn btn--primary">
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="cluster cluster--between">
            <div className="toggle-group">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`toggle-group__btn ${viewMode === 'cards' ? 'toggle-group__btn--active' : ''}`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`toggle-group__btn ${viewMode === 'table' ? 'toggle-group__btn--active' : ''}`}
              >
                Table
              </button>
            </div>
          </div>

          {errorData && (
            <ApiErrorAlert data={errorData} fallback="Search failed." className="mt-4" />
          )}
          <FeatureUnavailableBanner kind="developer" features={featuresUnavailable ?? undefined} />
          {saveError && <div className="alert alert--warning">{saveError}</div>}

          {loading && users.length === 0 && (
            <div className="text-center text-muted mt-6" style={{ padding: '3rem 0' }}>
              Loading...
            </div>
          )}

          {!loading && users.length === 0 && !errorData && query && (
            <div className="text-center text-muted mt-6" style={{ padding: '3rem 0' }}>
              No results. Try a different query or filters.
            </div>
          )}

          {viewMode === 'cards' && (
            <>
              <h3 className="section-title" style={{ textAlign: 'left', marginTop: 'var(--space-6)' }}>
                Results
              </h3>
              <div className="stack stack--sm mt-4">
                {sorted.map((user) => (
                  <DeveloperCard
                    key={user.id}
                    user={user}
                    scoreWeights={scoreWeights}
                    isSaved={savedLogins.has(user.login)}
                    onSave={handleSave}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </>
          )}

          {viewMode === 'table' && sorted.length > 0 && (
            <div className="table-wrap mt-6">
              <table className="table">
                <thead>
                  <tr>
                    <th>Developer</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>DevRank</th>
                    <th>Stars</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <a href={`/developers/${user.login}`} style={{ fontWeight: 600 }}>
                          {user.displayName || user.login}
                        </a>
                        <div className="text-dim" style={{ fontSize: '0.75rem' }}>@{user.login}</div>
                      </td>
                      <td className="text-muted">{user.company ?? '—'}</td>
                      <td className="text-muted">{user.location ?? '—'}</td>
                      <td>{user.devrank?.devrank ?? '—'}</td>
                      <td>{user.aggregates?.totalStars ?? '—'}</td>
                      <td>
                        <a href={`https://github.com/${user.login}`} target="_blank" rel="noopener noreferrer">
                          GitHub
                        </a>
                        {savedLogins.has(user.login) ? (
                          <button type="button" onClick={() => handleRemove(user.login)} className="btn btn--danger mt-2">
                            Remove
                          </button>
                        ) : (
                          <button type="button" onClick={() => handleSave(user)} className="btn btn--secondary mt-2" style={{ marginLeft: '0.5rem' }}>
                            Save
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pageInfo?.hasNextPage && (
            <div className="text-center mt-8">
              <button type="button" onClick={loadMore} disabled={loading} className="btn btn--secondary">
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>

        <div className="sticky-sidebar">
          <ScoreWeightsSlider weights={scoreWeights} onChange={setScoreWeights} />
        </div>
      </div>
    </div>
  );
}
