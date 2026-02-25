/**
 * BountyLab API error body (e.g. 429 CREDITS_EXHAUSTED, 401, etc.).
 */
interface BountyLabErrorBody {
  error?: string;
  code?: string;
  details?: { resetsAt?: string; organizationId?: string };
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  resetsAt?: string;
  /** Plain-language message for non-technical users */
  userMessage?: string;
}

/**
 * Format a caught BountyLab/API error into a response shape with a user-friendly message.
 * Only shows "quota reset" when we actually receive 429 with CREDITS_EXHAUSTED.
 */
export function formatApiError(err: unknown): { body: ApiErrorResponse; status: number } {
  const status = (err as { status?: number })?.status ?? 500;
  const body = (err as { error?: BountyLabErrorBody })?.error as BountyLabErrorBody | undefined;
  const rawMessage = body?.error ?? (err instanceof Error ? err.message : 'Something went wrong');

  // Only treat as credit limit when we have 429 AND the API body says so (code or resetsAt)
  const isCreditsExhausted =
    status === 429 &&
    (body?.code === 'CREDITS_EXHAUSTED' || body?.details?.resetsAt != null);

  if (isCreditsExhausted) {
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

  // Specific messages per status — show one clear message per error type
  let userMessage: string;
  const statusToUse = status >= 400 ? status : 500;

  switch (statusToUse) {
    case 400:
      userMessage = 'The request was invalid. Try changing your search or filters.';
      break;
    case 401:
      userMessage = 'Your API key is missing or invalid. Please check your setup.';
      break;
    case 403:
      // Show the API's own message when present (e.g. "SEARCH service not enabled") so users with credits see the real restriction
      userMessage = typeof rawMessage === 'string' && rawMessage.length > 0 && rawMessage !== 'Forbidden'
        ? rawMessage
        : "You don't have permission to use this feature. Your plan may not include developer search — check your BountyLab account or API key.";
      break;
    case 404:
      userMessage = "We couldn't find what you're looking for.";
      break;
    case 409:
      userMessage = 'A conflict occurred. Please refresh and try again.';
      break;
    case 422:
      userMessage = 'The request could not be processed. Check your input and try again.';
      break;
    case 429:
      userMessage = 'Too many requests. Please wait a moment and try again.';
      break;
    case 500:
    case 502:
    case 503:
    default:
      if (statusToUse >= 500) {
        userMessage = "Something went wrong on our side. Please try again in a few minutes.";
      } else {
        userMessage = rawMessage;
      }
      break;
  }

  // Connection/network errors (no status from API)
  if (!(err as { status?: number }).status && err instanceof Error) {
    const msg = err.message || '';
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('Connection')) {
      userMessage = "We couldn't reach the server. Check your connection and try again.";
    }
  }

  return {
    status: statusToUse,
    body: {
      error: rawMessage,
      code: body?.code,
      userMessage,
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
