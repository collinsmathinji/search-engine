import { NextRequest } from 'next/server';

const HEADER_NAME = 'x-pipeline-owner-id';
const FALLBACK_OWNER_ID = 'legacy';

/**
 * Reads the pipeline owner id from the request.
 * Sent by the client (e.g. from localStorage). No login required — each browser gets its own id.
 * If missing, returns 'legacy' so old clients still see pre-migration data.
 */
export function getPipelineOwnerId(req: NextRequest): string {
  const id = req.headers.get(HEADER_NAME)?.trim();
  return id && id.length > 0 ? id : FALLBACK_OWNER_ID;
}
