import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchUpstream } from '../../../api-lib/kho-du-lieu-shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const qs = new URL(req.url || '', 'http://localhost').searchParams.toString();
  const result = await fetchUpstream('courses', qs);
  return res.status(result.status).json(result.body);
}
