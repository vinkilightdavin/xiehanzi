import { createClient } from '@supabase/supabase-js';

export const KHO_DU_LIEU_BASE_URL = (process.env.KHO_DU_LIEU_BASE_URL || 'https://api.example.com').replace(/\/$/, '');
export const KHO_DU_LIEU_API_KEY = process.env.KHO_DU_LIEU_API_KEY || 'fake_key';

export async function fetchUpstream(upstreamPath: string, qs: string) {
  const url = `${KHO_DU_LIEU_BASE_URL}/api/v1/${upstreamPath}${qs ? `?${qs}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${KHO_DU_LIEU_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const rawBody = await response.text().catch(() => '');
      let errorData: Record<string, unknown>;
      try {
        errorData = JSON.parse(rawBody);
      } catch {
        errorData = { error: rawBody ? rawBody.slice(0, 300) : `Upstream trả về ${response.status} không có nội dung.` };
      }
      console.error('[Proxy Error] upstream không ok', { url, status: response.status, rawBody: rawBody.slice(0, 500) });
      return { ok: false as const, status: response.status, body: { ...errorData, upstream_url: url, upstream_status: response.status } };
    }

    return { ok: true as const, status: 200, body: await response.json() };
  } catch (error) {
    console.error('[Proxy Error] fetch thất bại', { url, error });
    return {
      ok: false as const,
      status: 500,
      body: { error: error instanceof Error ? error.message : 'Internal Server Error', upstream_url: url },
    };
  }
}

export async function checkApproved(authHeader: string | undefined): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
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
