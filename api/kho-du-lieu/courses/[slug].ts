import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchUpstream } from '../../../api-lib/kho-du-lieu-shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Lấy slug trực tiếp từ req.url thay vì req.query['slug'] — tên khóa query mà Vercel
  // gán cho tham số động không đáng tin cậy giữa các lần deploy trên project này
  // (đã thấy catch-all "[...path]" bị gán khóa "...path" thay vì "path").
  const pathname = new URL(req.url || '', 'http://localhost').pathname;
  const slugStr = decodeURIComponent(pathname.replace(/^\/api\/kho-du-lieu\/courses\/?/, ''));
  if (!slugStr) {
    return res.status(400).json({ error: 'Thiếu slug giáo trình.' });
  }

  const result = await fetchUpstream(`courses/${encodeURIComponent(slugStr)}`, '');
  return res.status(result.status).json(result.body);
}
