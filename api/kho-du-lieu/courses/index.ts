import type { VercelRequest, VercelResponse } from '@vercel/node';

const KHO_DU_LIEU_BASE_URL = (process.env.KHO_DU_LIEU_BASE_URL || 'https://api.example.com').replace(/\/$/, '');
const KHO_DU_LIEU_API_KEY = process.env.KHO_DU_LIEU_API_KEY || 'fake_key';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const qs = new URL(req.url || '', 'http://localhost').searchParams.toString();
  const url = `${KHO_DU_LIEU_BASE_URL}/api/v1/courses${qs ? `?${qs}` : ''}`;

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
      console.error('[courses] upstream không ok', { url, status: response.status, rawBody: rawBody.slice(0, 500) });
      return res.status(response.status).json({ ...errorData, upstream_url: url, upstream_status: response.status });
    }

    return res.status(200).json(await response.json());
  } catch (error) {
    console.error('[courses] handler crash', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error', upstream_url: url });
  }
}
