import { NextRequest, NextResponse } from 'next/server';
import { getBountylabClient } from '@/lib/bountylab';
import { formatApiError } from '@/lib/api-error';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ login: string }> }
) {
  try {
    const { login } = await params;
    if (!login) {
      return NextResponse.json({
        error: 'Missing login',
        userMessage: 'Please open a developer from the search list.',
      }, { status: 400 });
    }

    const client = getBountylabClient();

    const fetchUser = (includeAttributes: Record<string, unknown>) =>
      client.rawUsers.byLogin({ logins: [login], includeAttributes });

    let response: Awaited<ReturnType<typeof fetchUser>>;
    try {
      response = await fetchUser({
        aggregates: true,
        devrank: true,
        contributes: { first: 10 },
        followers: { first: 1 },
        owns: { first: 10 },
        stars: { first: 5 },
      });
    } catch (firstErr: unknown) {
      if ((firstErr as { status?: number })?.status === 403) {
        response = await fetchUser({});
      } else {
        throw firstErr;
      }
    }

    const user = response.users?.[0] ?? null;
    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        userMessage: "This developer wasn't found. They may have changed their username.",
      }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err: unknown) {
    const { body, status } = formatApiError(err);
    return NextResponse.json(body, { status });
  }
}
