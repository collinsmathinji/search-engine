# BountyLab Recruit

A developer recruiting web app built with **Next.js** and **Supabase**, powered by the [BountyLab API](https://bountylab.io). Search developers by skills and activity, discover repositories with semantic search, and manage a saved candidate pipeline—with a UI inspired by [BountyBot](https://bountybot.com).

## Features

- **Developer search** — Full-text search by name, bio, skills, company, or location. Filter by programming language, location, and email domain. Results in card or table layout with pagination.
- **Developer profile** — Detailed profile view: avatar, bio, company, location, top repos, languages, follower/star counts, DevRank. Link out to GitHub.
- **Repository discovery** — Semantic search for repos (e.g. “payment processing microservice in Go”). Filter by language and star count. See contributors and open their profiles.
- **Saved candidates (pipeline)** — Save developers to a pipeline (stored in Supabase). Add notes and tags (e.g. “Strong React”, “Reached out 2/22”).
- **Export** — Export the pipeline to CSV (name, GitHub URL, location, top languages, notes, tags, etc.).
- **Ranking** — Composite recruiter score from DevRank, stars, recent activity, and followers. Adjust weights with sliders on the developer search page.

## Tech stack

- **Next.js 15** (App Router)
- **BountyLab** — `@bountylab/bountylab` for all API calls
- **Supabase** — Saved candidates and notes/tags
- **TypeScript**

## Setup

### 1. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `BOUNTYLAB_API_KEY` | **Yes** | BountyLab API key from [app.bountylab.io](https://app.bountylab.io) |
| `NEXT_PUBLIC_SUPABASE_URL` | For pipeline | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For pipeline | Supabase anonymous key |

- **Without Supabase**: Developer and repo search work. Saving candidates will show a “Supabase not configured” message; pipeline list stays empty.
- **With Supabase**: Run the migration below so the pipeline table exists.

### 3. Supabase migration (optional)

In the Supabase SQL editor, run:

```sql
-- See supabase/migrations/001_saved_candidates.sql
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
```

## Project structure

```
├── app/
│   ├── api/
│   │   ├── developers/   # search, [login] profile
│   │   ├── repos/        # search
│   │   └── pipeline/     # GET/POST, [login] PATCH/DELETE
│   ├── developers/       # search page, [login] profile page
│   ├── repos/            # repo discovery page
│   ├── pipeline/         # saved candidates page
│   ├── layout.tsx
│   ├── page.tsx          # home
│   └── globals.css
├── components/           # Header, DeveloperCard, RepoCard, ScoreWeights
├── lib/                  # bountylab client, supabase, types
├── supabase/migrations/  # saved_candidates table
└── README.md
```

## Deployment

- **Vercel**: Connect the repo, set `BOUNTYLAB_API_KEY` and (optionally) Supabase env vars, deploy.
- **Netlify**: Use the Next.js build; set the same env vars.

No API keys are hardcoded; they are read from the environment.

## Screenshots / demo

- **Home**: Hero section and “How it works” (Find developers → Discover repos → Build pipeline).
- **Developers**: Search bar, filters (language, country, email domain), card/table toggle, ranking weight sliders, pagination.
- **Profile**: Avatar, bio, company, location, DevRank, stars, followers, top repos, link to GitHub.
- **Repos**: Natural-language search, language/min-stars filters, repo cards with contributor links.
- **Pipeline**: List of saved candidates, notes/tags, edit, remove, Export CSV.

## License

ISC
# search-engine
