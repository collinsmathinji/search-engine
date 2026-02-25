import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPipelineOwnerId } from '@/lib/pipeline-owner';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ login: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({
        error: 'Supabase not configured',
        userMessage: 'Saving candidates is not set up. Add your Supabase URL and key in settings to use the pipeline.',
      }, { status: 503 });
    }
    const { login } = await params;
    const ownerId = getPipelineOwnerId(req);
    const db = supabase;
    const body = await req.json();
    const { notes, tags } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (notes !== undefined) updates.notes = notes;
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];

    const { data, error } = await db
      .from('saved_candidates')
      .update(updates)
      .eq('owner_id', ownerId)
      .eq('login', login)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update candidate';
    return NextResponse.json({
      error: message,
      userMessage: "We couldn't update the notes or tags. Please try again.",
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ login: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({
        error: 'Supabase not configured',
        userMessage: 'Saving candidates is not set up. Add your Supabase URL and key in settings to use the pipeline.',
      }, { status: 503 });
    }
    const { login } = await params;
    const ownerId = getPipelineOwnerId(req);
    const db = supabase;
    const { error } = await db
      .from('saved_candidates')
      .delete()
      .eq('owner_id', ownerId)
      .eq('login', login);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove candidate';
    return NextResponse.json({
      error: message,
      userMessage: "We couldn't remove this candidate. Please try again.",
    }, { status: 500 });
  }
}
