/**
 * Client-side: get or create an anonymous pipeline owner id (no login).
 * Stored in localStorage so the same browser always gets the same pipeline.
 */

const STORAGE_KEY = 'bountylab_pipeline_owner_id';
const HEADER_NAME = 'x-pipeline-owner-id';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getPipelineOwnerId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return generateId();
  }
}

/** Headers to add to pipeline API requests so the backend scopes data to this browser/user. */
export function pipelineOwnerHeaders(): Record<string, string> {
  const id = getPipelineOwnerId();
  return id ? { [HEADER_NAME]: id } : {};
}
