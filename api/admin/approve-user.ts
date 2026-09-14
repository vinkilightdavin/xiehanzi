import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Đổi role của một tài khoản (pending/approved/admin). Chỉ Admin mới gọi được.
// Dùng service role key trên server — không bao giờ để lộ key này ra frontend.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server chưa cấu hình Supabase.' });
  }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Thiếu token xác thực.' });

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: callerData, error: callerErr } = await admin.auth.getUser(token);
  if (callerErr || !callerData?.user) {
    return res.status(401).json({ error: 'Token không hợp lệ.' });
  }

  const { data: callerProfile } = await admin.from('profiles').select('role').eq('id', callerData.user.id).single();
  if (callerProfile?.role !== 'admin') {
    return res.status(403).json({ error: 'Chỉ Admin mới được duyệt tài khoản.' });
  }

  const { userId, role } = (req.body || {}) as { userId?: string; role?: string };
  if (!userId || !role || !['pending', 'approved', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Thiếu userId hoặc role không hợp lệ.' });
  }

  const { error } = await admin.from('profiles').update({ role }).eq('id', userId);
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true });
}
