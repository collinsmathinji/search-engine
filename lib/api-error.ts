/**
 * BountyLab API error body (e.g. 429 CREDITS_EXHAUSTED).
 */
interface BountyLabErrorBody {
  error?: string;
  code?: string;
  details?: { resetsAt?: string; organizationId?: string };
}

interface ApiErrorResponse {
  error: string;
  code?: string;
  resetsAt?: string;
  /** Plain-language message for non-technical users */
  userMessage?: string;
}

/**
 * Format a caught BountyLab/API error into a response shape with a user-friendly message.
 * Call from API route catch blocks and return NextResponse.json(..., { status }).
 */
export function formatApiError(err: unknown): { body: ApiErrorResponse; status: number } {
  const status = (err as { status?: number })?.status ?? 500;
  const body = (err as { error?: BountyLabErrorBody })?.error as BountyLabErrorBody | undefined;
  const code = body?.code ?? (err as Error)?.message?.includes('CREDITS') ? 'CREDITS_EXHAUSTED' : undefined;
  const rawMessage = body?.error ?? (err instanceof Error ? err.message : 'Something went wrong');

  // Credit limit exceeded — friendly message and when it resets
  if (status === 429 || code === 'CREDITS_EXHAUSTED') {
    const resetsAt = body?.details?.resetsAt;
    let resetsText = '';
    if (resetsAt) {
      try {
        const date = new Date(resetsAt);
        resetsText = date.toLocaleString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      } catch {
        resetsText = resetsAt;
      }
    }
    const userMessage = resetsText
      ? `You've used your search quota for this hour. It resets at ${resetsText}. Please try again after that.`
      : "You've used your search quota for this hour. Please try again in a little while.";
    return {
      status: 429,
      body: {
        error: rawMessage,
        code: 'CREDITS_EXHAUSTED',
        resetsAt: body?.details?.resetsAt,
        userMessage,
      },
    };
  }

  // Generic fallback
  return {
    status: status >= 400 ? status : 500,
    body: {
      error: rawMessage,
      code,
      userMessage: status >= 500 ? "Something went wrong on our side. Please try again in a few minutes." : rawMessage,
    },
  };
}

/**
 * From a fetch response + parsed JSON, get the message to show in the UI.
 * Prefers userMessage for non-technical users.
 */
export function getErrorMessage(data: { error?: string; userMessage?: string } | null, fallback: string): string {
  if (!data) return fallback;
  if (data.userMessage) return data.userMessage;
  if (data.error) return data.error;
  return fallback;
}
