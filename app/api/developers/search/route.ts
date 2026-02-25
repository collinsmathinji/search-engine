import { NextRequest, NextResponse } from 'next/server';
import { getBountylabClient, isDevRankEnabled } from '@/lib/bountylab';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') ?? '';
    const language = searchParams.get('language') || undefined;
    const location = searchParams.get('location') || undefined;
    const emailDomain = searchParams.get('emailDomain') || undefined;
    const after = searchParams.get('after') || undefined;
    const maxResults = Math.min(parseInt(searchParams.get('maxResults') || '20', 10), 100);

    const client = getBountylabClient();

    type FilterOp = 'Eq' | 'NotEq' | 'In' | 'NotIn' | 'Lt' | 'Lte' | 'Gt' | 'Gte';
    const filters: Array<{ field: string; op: FilterOp; value: string | number | string[] }> = [];
    if (language) filters.push({ field: 'primaryLanguage', op: 'Eq', value: language });
    if (location) filters.push({ field: 'resolvedCountry', op: 'Eq', value: location });
    if (emailDomain) filters.push({ field: 'emailDomain', op: 'Eq', value: emailDomain });

    const response = await client.searchUsers.search({
      query: query || null,
      maxResults,
      after,
      enablePagination: true,
      includeAttributes: {
        aggregates: true,
        ...(isDevRankEnabled() && { devrank: true }),
        contributes: { first: 5 },
        followers: { first: 1 },
      },
      ...(filters.length > 0 && { filters: { filters, op: 'And' as const } }),
    });

    return NextResponse.json({
      count: response.count,
      users: response.users?.filter(Boolean) ?? [],
      pageInfo: response.pageInfo,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Search failed';
    const status = (err as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status: status >= 400 ? status : 500 });
  }
}
