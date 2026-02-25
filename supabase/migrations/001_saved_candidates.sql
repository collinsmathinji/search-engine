-- Saved candidates pipeline table
create table if not exists saved_candidates (
  id uuid primary key default gen_random_uuid(),
  login text not null unique,
  github_id text not null,
  display_name text,
  avatar_url text,
  bio text,
  company text,
  location text,
  top_languages text[] default '{}',
  devrank_score numeric,
  follower_count integer,
  total_stars integer,
  notes text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_saved_candidates_login on saved_candidates(login);
create index if not exists idx_saved_candidates_created_at on saved_candidates(created_at desc);

-- Allow anonymous read/write for demo; restrict in production with RLS
alter table saved_candidates enable row level security;

create policy "Allow all for anon" on saved_candidates
  for all using (true) with check (true);
