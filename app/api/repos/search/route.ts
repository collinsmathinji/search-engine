import { NextRequest, NextResponse } from 'next/server';
import { getBountylabClient } from '@/lib/bountylab';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') ?? '';
    const naturalLanguage = searchParams.get('natural') === 'true';
    const language = searchParams.get('language') || undefined;
    const minStars = searchParams.get('minStars') || undefined;
    const after = searchParams.get('after') || undefined;
    const maxResults = Math.min(parseInt(searchParams.get('maxResults') || '20', 10), 100);

    const client = getBountylabClient();

    type FilterOp = 'Eq' | 'Gte';
    const filters: Array<{ field: string; op: FilterOp; value: string | number }> = [];
    if (language) filters.push({ field: 'language', op: 'Eq', value: language });
    if (minStars) filters.push({ field: 'stargazerCount', op: 'Gte', value: parseInt(minStars, 10) });

    const baseParams = {
      maxResults,
      after,
      enablePagination: true,
      includeAttributes: {
        contributors: { first: 10 },
        owner: true,
      },
      ...(filters.length > 0 && { filters: { filters, op: 'And' as const } }),
    };

    if (naturalLanguage && query) {
      const response = await client.searchRepos.naturalLanguage({
        query,
        ...baseParams,
      });
      return NextResponse.json({
        count: response.count,
        repositories: response.repositories ?? [],
        pageInfo: response.pageInfo,
        searchQuery: response.searchQuery,
      });
    }

    const response = await client.searchRepos.search({
      query: query || null,
      ...baseParams,
    });

    return NextResponse.json({
      count: response.count,
      repositories: response.repositories ?? [],
      pageInfo: response.pageInfo,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Search failed';
    const status = (err as { status?: number })?.status ?? 500;
    return NextResponse.json({ error: message }, { status: status >= 400 ? status : 500 });
  }
}
