import { NextRequest, NextResponse } from 'next/server';
import { getBountylabClient } from '@/lib/bountylab';
import { formatApiError } from '@/lib/api-error';

// BountyLab docs: https://docs.bountylab.io/guides/searching/
type FilterOp = 'Eq' | 'NotEq' | 'In' | 'NotIn' | 'Lt' | 'Lte' | 'Gt' | 'Gte' | 'ContainsAllTokens';

function buildFilters(language?: string, location?: string, emailDomain?: string) {
  const filters: Array<{ field: string; op: FilterOp; value: string | number | string[] }> = [];
  if (language) {
    filters.push({ field: 'primaryLanguage', op: 'Eq', value: language });
  }
  // Country: per docs use ContainsAllTokens for location fields; we also post-filter so only matching country is returned
  if (location) {
    filters.push({ field: 'resolvedCountry', op: 'ContainsAllTokens', value: location.trim() });
  }
  if (emailDomain) {
    const value = emailDomain.trim().startsWith('@') ? emailDomain.trim() : `@${emailDomain.trim()}`;
    filters.push({ field: 'emails', op: 'ContainsAllTokens', value });
  }
  return filters;
}

/** Match user to selected country by resolvedCountry or raw location (case-insensitive). */
function userMatchesCountry(
  user: { resolvedCountry?: string | null; location?: string | null },
  country: string
): boolean {
  const c = country.toLowerCase().trim();
  const resolved = (user.resolvedCountry ?? '').toLowerCase();
  const loc = (user.location ?? '').toLowerCase();
  return resolved.includes(c) || loc.includes(c) || resolved === c || loc === c;
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

    const applyCountryFilter = (users: Array<{ resolvedCountry?: string | null; location?: string | null }> | undefined) => {
      const list = users?.filter(Boolean) ?? [];
      if (!location?.trim()) return list;
      return list.filter((u) => userMatchesCountry(u, location));
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
      const users = applyCountryFilter(response.users);
      return NextResponse.json({
        count: users.length,
        users,
        pageInfo: response.pageInfo,
      });
    } catch (firstErr: unknown) {
      const status = (firstErr as { status?: number })?.status;
      const errBody = (firstErr as { error?: unknown })?.error;
      const errMessage = firstErr instanceof Error ? firstErr.message : String(firstErr);
      console.warn('[API developers/search] Enriched search failed (DevRank/aggregates/contributes/followers):', {
        status,
        message: errMessage,
        backendError: errBody,
      });
      // If restricted (e.g. 403 — DevRank or enrichments not on plan), run basic search without them
      if (status === 403) {
        const response = await client.searchUsers.search({
          ...baseParams,
          includeAttributes: {},
        });
        const users = applyCountryFilter(response.users);
        return NextResponse.json({
          count: users.length,
          users,
          pageInfo: response.pageInfo,
          featuresUnavailable: {
            devrank: true,
            aggregates: true,
            contributes: true,
            followers: true,
          },
        });
      }
      throw firstErr;
    }
  } catch (err: unknown) {
    const { body, status } = formatApiError(err);
    console.error('[API developers/search] Request failed:', { status, body, raw: err });
    return NextResponse.json(body, { status });
  }
}
