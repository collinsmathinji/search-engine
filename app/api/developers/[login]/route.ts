import { NextRequest, NextResponse } from 'next/server';
import { getBountylabClient } from '@/lib/bountylab';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ login: string }> }
) {
  try {
    const { login } = await params;
    if (!login) {
      return NextResponse.json({ error: 'Missing login' }, { status: 400 });
    }

    const client = getBountylabClient();
    const response = await client.rawUsers.byLogin({
      logins: [login],
      includeAttributes: {
        aggregates: true,
        devrank: true,
        contributes: { first: 10 },
        followers: { first: 1 },
        owns: { first: 10 },
        stars: { first: 5 },
      },
    });

    const user = response.users?.[0] ?? null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user';
    const status = (err as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status: status >= 400 ? status : 500 });
  }
}
