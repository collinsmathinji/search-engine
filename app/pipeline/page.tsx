'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { SavedCandidate } from '@/lib/supabase';
import { pipelineOwnerHeaders } from '@/lib/pipeline-owner-client';

const GITHUB_URL = (login: string) => `https://github.com/${login}`;

function downloadCsv(candidates: SavedCandidate[]) {
  const headers = [
    'name',
    'login',
    'github_url',
    'location',
    'company',
    'top_languages',
    'devrank_score',
    'follower_count',
    'total_stars',
    'notes',
    'tags',
    'email_domain',
  ];
  const rows = candidates.map((c) => [
    c.display_name ?? c.login,
    c.login,
    GITHUB_URL(c.login),
    c.location ?? '',
    c.company ?? '',
    (c.top_languages ?? []).join('; '),
    c.devrank_score ?? '',
    c.follower_count ?? '',
    c.total_stars ?? '',
    c.notes ?? '',
    (c.tags ?? []).join('; '),
    '',
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bountylab-candidates-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<SavedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLogin, setEditingLogin] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pipeline', { headers: pipelineOwnerHeaders() });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load pipeline');
      }
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pipeline unavailable');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const startEdit = (c: SavedCandidate) => {
    setEditingLogin(c.login);
    setEditNotes(c.notes ?? '');
    setEditTags(Array.isArray(c.tags) ? c.tags.join(', ') : '');
  };

  const saveEdit = async () => {
    if (!editingLogin) return;
    try {
      const res = await fetch(`/api/pipeline/${encodeURIComponent(editingLogin)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...pipelineOwnerHeaders() },
        body: JSON.stringify({
          notes: editNotes,
          tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchPipeline();
      setEditingLogin(null);
    } catch (_) {
      setError('Failed to update notes/tags');
    }
  };

  const remove = async (login: string) => {
    try {
      const res = await fetch(`/api/pipeline/${encodeURIComponent(login)}`, {
        method: 'DELETE',
        headers: pipelineOwnerHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setCandidates((prev) => prev.filter((c) => c.login !== login));
      setEditingLogin((l) => (l === login ? null : l));
    } catch (_) {
      setError('Failed to remove candidate');
    }
  };

  const handleExport = () => {
    if (candidates.length === 0) return;
    downloadCsv(candidates);
  };

  if (loading) {
    return (
      <div className="container container--medium page text-center text-muted">
        Loading pipeline...
      </div>
    );
  }

  return (
    <div className="container container--medium page">
      <div className="card mb-4">
        <p>
          <strong>Saved candidates.</strong> Your recruiter pipeline. Add notes and tags, then export to CSV.
        </p>
      </div>

      <div className="cluster cluster--between mt-4" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 'var(--space-1)' }}>
            Pipeline
          </h2>
          <p className="text-muted mt-2" style={{ fontSize: '0.9375rem' }}>
            Add notes and tags; export when ready.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={candidates.length === 0}
          className="btn btn--primary shrink-0"
        >
          Export CSV
        </button>
      </div>

      {error && (
        <div className="alert alert--warning mt-4">
          {error}. Configure Supabase in .env.local for a persisted pipeline.
        </div>
      )}

      {candidates.length === 0 && !error && (
        <div className="card mt-8 text-center card--padded">
          <p className="text-muted">No saved candidates yet.</p>
          <p className="text-muted mt-2">
            Search <Link href="/developers">developers</Link> or find repos and add contributors to your pipeline.
          </p>
        </div>
      )}

      <div className="stack mt-8">
        {candidates.map((c) => (
          <div key={c.id} className="card">
            <div className="stack stack--md" style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div className="cluster shrink-0" style={{ gap: 'var(--space-3)' }}>
                <img
                  src={c.avatar_url ?? `https://github.com/${c.login}.png`}
                  alt=""
                  style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', border: '2px solid var(--color-border)', objectFit: 'cover' }}
                />
                <div>
                  <Link href={`/developers/${c.login}`} style={{ fontWeight: 600 }}>
                    {c.display_name ?? c.login}
                  </Link>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>@{c.login}</div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingLogin === c.login ? (
                  <div className="stack stack--sm">
                    <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={2}
                      className="input"
                      placeholder="e.g. Strong React, Reached out 2/22"
                    />
                    <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="input"
                      placeholder="Strong React, Reached out 2/22"
                    />
                    <div className="cluster">
                      <button type="button" onClick={saveEdit} className="btn btn--primary" style={{ fontSize: '0.875rem' }}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingLogin(null)} className="btn btn--secondary" style={{ fontSize: '0.875rem' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {c.notes && <p style={{ fontSize: '0.9375rem' }}>{c.notes}</p>}
                    {(c.tags?.length ?? 0) > 0 && (
                      <div className="cluster mt-2" style={{ flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                        {c.tags?.map((tag) => (
                          <span key={tag} className="badge badge--accent">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="cluster mt-2 text-muted" style={{ flexWrap: 'wrap', fontSize: '0.75rem' }}>
                      {c.location && <span>{c.location}</span>}
                      {c.company && <span>{c.company}</span>}
                      {(c.top_languages?.length ?? 0) > 0 && (
                        <span>{(c.top_languages ?? []).join(', ')}</span>
                      )}
                      {c.devrank_score != null && <span>DevRank {c.devrank_score}</span>}
                    </div>
                  </>
                )}
              </div>
              <div className="cluster shrink-0" style={{ gap: 'var(--space-2)' }}>
                <a href={GITHUB_URL(c.login)} target="_blank" rel="noopener noreferrer" className="btn btn--secondary" style={{ fontSize: '0.875rem' }}>
                  GitHub
                </a>
                {editingLogin !== c.login && (
                  <button type="button" onClick={() => startEdit(c)} className="btn btn--secondary" style={{ fontSize: '0.875rem' }}>
                    Edit
                  </button>
                )}
                <button type="button" onClick={() => remove(c.login)} className="btn btn--danger">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
