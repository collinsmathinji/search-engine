-- Scope pipeline to a per-user owner (anonymous id when no login).
-- Each browser gets a unique owner_id so saved candidates are isolated per "user".

-- Add owner_id column (default 'legacy' for existing rows)
alter table saved_candidates
  add column if not exists owner_id text not null default 'legacy';

-- Drop old unique constraint on login only
alter table saved_candidates
  drop constraint if exists saved_candidates_login_key;

-- One row per (owner, login)
create unique index if not exists idx_saved_candidates_owner_login
  on saved_candidates (owner_id, login);

create index if not exists idx_saved_candidates_owner_id
  on saved_candidates (owner_id);

-- RLS: keep policy; filtering by owner_id is done in the API using the client-supplied header
comment on column saved_candidates.owner_id is 'Anonymous user/browser id (e.g. from localStorage). No login required.';
