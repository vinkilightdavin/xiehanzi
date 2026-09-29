import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchUpstream, checkApproved } from '../../../../api-lib/kho-du-lieu-shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const check = await checkApproved(req.headers.authorization);
  if (!check.ok) {
    return res.status(check.status).json({ error: check.error });
  }

  // Lấy id trực tiếp từ req.url — xem ghi chú tương tự ở courses/[slug].ts.
  const pathname = new URL(req.url || '', 'http://localhost').pathname;
  const match = pathname.match(/^\/api\/kho-du-lieu\/lessons\/([^/]+)\/bundle\/?$/);
  const id = match ? decodeURIComponent(match[1]) : '';
  if (!id) {
    return res.status(400).json({ error: 'Thiếu id bài học.' });
  }

  const result = await fetchUpstream(`lessons/${encodeURIComponent(id)}/bundle`, '');
  return res.status(result.status).json(result.body);
}
