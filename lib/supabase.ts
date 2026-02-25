import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export type SavedCandidate = {
  id: string;
  owner_id: string;
  login: string;
  github_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  top_languages: string[];
  devrank_score: number | null;
  follower_count: number | null;
  total_stars: number | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};
