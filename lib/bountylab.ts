import Bountylab from '@bountylab/bountylab';

function getApiKey(): string {
  const key = process.env.BOUNTYLAB_API_KEY;
  if (!key) {
    throw new Error('BOUNTYLAB_API_KEY is not set. Add it to .env.local');
  }
  return key;
}

export function getBountylabClient(): Bountylab {
  return new Bountylab({ apiKey: getApiKey() });
}
