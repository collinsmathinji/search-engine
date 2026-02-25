import { NextRequest, NextResponse } from 'next/server';
import { getBountylabClient } from '@/lib/bountylab';
import { formatApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') ?? '';
    const naturalLanguage = searchParams.get('natural') === 'true';
    const language = searchParams.get('language') || undefined;
    const minStars = searchParams.get('minStars') || undefined;
    const after = searchParams.get('after') || undefined;
    const maxResults = Math.min(parseInt(searchParams.get('maxResults') || '10', 10), 100);

    const client = getBountylabClient();

    type FilterOp = 'Eq' | 'Gte';
    const filters: Array<{ field: string; op: FilterOp; value: string | number }> = [];
    if (language) filters.push({ field: 'language', op: 'Eq', value: language });
    if (minStars) filters.push({ field: 'stargazerCount', op: 'Gte', value: parseInt(minStars, 10) });

    const baseParams = {
      maxResults,
      after,
      enablePagination: true,
      ...(filters.length > 0 && { filters: { filters, op: 'And' as const } }),
    };

    const runSearch = (includeAttributes: Record<string, unknown>) => {
      const params = { ...baseParams, includeAttributes };
      if (naturalLanguage && query) {
        return client.searchRepos.naturalLanguage({ query, ...params });
      }
      return client.searchRepos.search({ query: query || null, ...params });
    };

    try {
      const response = await runSearch({
        contributors: { first: 10 },
        owner: true,
      });
      if (naturalLanguage && query) {
        return NextResponse.json({
          count: response.count,
          repositories: response.repositories ?? [],
          pageInfo: response.pageInfo,
          searchQuery: (response as { searchQuery?: string }).searchQuery,
        });
      }
      return NextResponse.json({
        count: response.count,
        repositories: response.repositories ?? [],
        pageInfo: response.pageInfo,
      });
    } catch (firstErr: unknown) {
      if ((firstErr as { status?: number })?.status === 403) {
        const response = await runSearch({});
        const payload = {
          count: response.count,
          repositories: response.repositories ?? [],
          pageInfo: response.pageInfo,
          featuresUnavailable: { contributors: true, owner: true } as const,
        };
        if (naturalLanguage && query) {
          return NextResponse.json({
            ...payload,
            searchQuery: (response as { searchQuery?: string }).searchQuery,
          });
        }
        return NextResponse.json(payload);
      }
      throw firstErr;
    }
  } catch (err: unknown) {
    const { body, status } = formatApiError(err);
    return NextResponse.json(body, { status });
  }
}
