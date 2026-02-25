import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json([]);
    }
    const { data, error } = await supabase.from('saved_candidates').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch pipeline';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to save candidates.' }, { status: 503 });
    }
    const db = supabase;
    const body = await req.json();
    const {
      login,
      github_id,
      display_name,
      avatar_url,
      bio,
      company,
      location,
      top_languages,
      devrank_score,
      follower_count,
      total_stars,
      notes,
      tags,
    } = body;

    if (!login || !github_id) {
      return NextResponse.json({ error: 'login and github_id required' }, { status: 400 });
    }

    const { data, error } = await db
      .from('saved_candidates')
      .upsert(
        {
          login,
          github_id,
          display_name: display_name ?? null,
          avatar_url: avatar_url ?? null,
          bio: bio ?? null,
          company: company ?? null,
          location: location ?? null,
          top_languages: Array.isArray(top_languages) ? top_languages : [],
          devrank_score: devrank_score ?? null,
          follower_count: follower_count ?? null,
          total_stars: total_stars ?? null,
          notes: notes ?? null,
          tags: Array.isArray(tags) ? tags : [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'login', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save candidate';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
