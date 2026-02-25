import { NextRequest, NextResponse } from 'next/server';
import { getBountylabClient } from '@/lib/bountylab';
import { formatApiError } from '@/lib/api-error';

type FilterOp = 'Eq' | 'NotEq' | 'In' | 'NotIn' | 'Lt' | 'Lte' | 'Gt' | 'Gte';

function buildFilters(language?: string, location?: string, emailDomain?: string) {
  const filters: Array<{ field: string; op: FilterOp; value: string | number | string[] }> = [];
  if (language) filters.push({ field: 'primaryLanguage', op: 'Eq', value: language });
  if (location) filters.push({ field: 'resolvedCountry', op: 'Eq', value: location });
  if (emailDomain) filters.push({ field: 'emailDomain', op: 'Eq', value: emailDomain });
  return filters;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') ?? '';
    const language = searchParams.get('language') || undefined;
    const location = searchParams.get('location') || undefined;
    const emailDomain = searchParams.get('emailDomain') || undefined;
    const after = searchParams.get('after') || undefined;
    const maxResults = Math.min(parseInt(searchParams.get('maxResults') || '10', 10), 100);

    const client = getBountylabClient();
    const filters = buildFilters(language, location, emailDomain);
    const baseParams = {
      query: query || null,
      maxResults,
      after,
      enablePagination: true,
      ...(filters.length > 0 && { filters: { filters, op: 'And' as const } }),
    };

    // Try full search first (devrank, aggregates, contributes, followers)
    try {
      const response = await client.searchUsers.search({
        ...baseParams,
        includeAttributes: {
          aggregates: true,
          devrank: true,
          contributes: { first: 5 },
          followers: { first: 1 },
        },
      });
      return NextResponse.json({
        count: response.count,
        users: response.users?.filter(Boolean) ?? [],
        pageInfo: response.pageInfo,
      });
    } catch (firstErr: unknown) {
      const status = (firstErr as { status?: number })?.status;
      // If restricted (e.g. 403 — DevRank or enrichments not on plan), run basic search without them
      if (status === 403) {
        const response = await client.searchUsers.search({
          ...baseParams,
          includeAttributes: {},
        });
        return NextResponse.json({
          count: response.count,
          users: response.users?.filter(Boolean) ?? [],
          pageInfo: response.pageInfo,
        });
      }
      throw firstErr;
    }
  } catch (err: unknown) {
    const { body, status } = formatApiError(err);
    return NextResponse.json(body, { status });
  }
}
