import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const KHO_DU_LIEU_BASE_URL = (process.env.KHO_DU_LIEU_BASE_URL || 'https://api.example.com').replace(/\/$/, '');
const KHO_DU_LIEU_API_KEY = process.env.KHO_DU_LIEU_API_KEY || 'fake_key';

// Nhập nội dung bài học (từ vựng thật) chỉ dành cho tài khoản đã được Admin duyệt.
// Xem danh sách giáo trình/bài học vẫn mở cho tất cả.
function isRestrictedPath(joinedPath: string) {
  return joinedPath.startsWith('lessons/') && joinedPath.endsWith('/bundle');
}

async function checkApproved(authHeader: string | undefined): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const token = (authHeader || '').replace(/^Bearer\s+/i, '');
  if (!token) return { ok: false, status: 401, error: 'Cần đăng nhập để nhập dữ liệu.' };

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false, status: 500, error: 'Server chưa cấu hình Supabase.' };
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.' };
  }

  const { data: profile } = await admin.from('profiles').select('role').eq('id', userData.user.id).single();
  if (!profile || !['approved', 'admin'].includes(profile.role)) {
    return { ok: false, status: 403, error: 'Tài khoản chưa được duyệt để nhập dữ liệu. Vui lòng liên hệ Admin.' };
  }

  return { ok: true };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { path, ...restQuery } = req.query;
  const segments = Array.isArray(path) ? path : path ? [path] : [];
  const joinedPath = segments.join('/');

  if (isRestrictedPath(joinedPath)) {
    const check = await checkApproved(req.headers.authorization);
    if (!check.ok) {
      return res.status(check.status).json({ error: check.error });
    }
  }

  const qs = new URLSearchParams(restQuery as Record<string, string>).toString();
  const url = `${KHO_DU_LIEU_BASE_URL}/api/v1/${joinedPath}${qs ? `?${qs}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${KHO_DU_LIEU_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('[Proxy Error]', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
  }
}
