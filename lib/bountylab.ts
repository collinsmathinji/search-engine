import Bountylab from '@bountylab/bountylab';

function getApiKey(): string {
  const key = process.env.BOUNTYLAB_API_KEY;
  if (!key) {
    throw new Error('BOUNTYLAB_API_KEY is not set. Add it to .env.local');
  }
  return key;
}

/** Set BOUNTYLAB_DEVRANK_ENABLED=true only if your BountyLab account has the DEVRANK service (otherwise you get 403). */
export function isDevRankEnabled(): boolean {
  const v = process.env.BOUNTYLAB_DEVRANK_ENABLED;
  return v === 'true' || v === '1';
}

export function getBountylabClient(): Bountylab {
  return new Bountylab({ apiKey: getApiKey() });
}
