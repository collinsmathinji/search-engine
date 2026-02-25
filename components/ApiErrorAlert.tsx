'use client';

import { getErrorMessage } from '@/lib/api-error';

interface ApiErrorAlertProps {
  /** Response body from a failed fetch (may contain userMessage, error, resetsAt). */
  data: { error?: string; userMessage?: string; resetsAt?: string } | null;
  fallback?: string;
  className?: string;
}

/**
 * Shows a user-friendly error message. Prefers userMessage for non-technical users.
 * If resetsAt is present (e.g. credit limit), shows when the quota resets.
 */
export function ApiErrorAlert({ data, fallback = 'Something went wrong.', className = '' }: ApiErrorAlertProps) {
  const message = getErrorMessage(data, fallback);
  const resetsAt = data?.resetsAt;

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

  return (
    <div
      role="alert"
      className={`alert alert--warning ${className}`.trim()}
    >
      <p className="font-medium">{message}</p>
      {resetsText && (
        <p className="mt-2 text-dim">
          Your quota resets at <strong>{resetsText}</strong>. You can try again after that.
        </p>
      )}
    </div>
  );
}
