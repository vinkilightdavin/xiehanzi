import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';

interface ProfileRow {
  id: string;
  email: string | null;
  role: 'pending' | 'approved' | 'admin';
  created_at: string;
}

const ROLE_LABEL: Record<ProfileRow['role'], string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  admin: 'Admin',
};

export const AdminPage: React.FC = () => {
  const { session } = useAuthStore();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setProfiles(data as ProfileRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (userId: string, role: ProfileRow['role']) => {
    if (!session) return;
    setBusyId(userId);
    setError(null);
    try {
      const res = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể cập nhật');
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-800">Quản lý tài khoản</h1>
          <a href="/" className="text-sm text-blue-600 hover:underline">&larr; Về trang chính</a>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <p className="p-6 text-gray-500">Đang tải...</p>
          ) : profiles.length === 0 ? (
            <p className="p-6 text-gray-500">Chưa có tài khoản nào.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="p-3">Email</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Ngày đăng ký</th>
                  <th className="p-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.email || p.id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        p.role === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ROLE_LABEL[p.role]}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{new Date(p.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="p-3 text-right space-x-2">
                      {p.role !== 'approved' && (
                        <button
                          disabled={busyId === p.id}
                          onClick={() => changeRole(p.id, 'approved')}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-semibold disabled:opacity-50"
                        >
                          Duyệt
                        </button>
                      )}
                      {p.role !== 'pending' && (
                        <button
                          disabled={busyId === p.id}
                          onClick={() => changeRole(p.id, 'pending')}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold disabled:opacity-50"
                        >
                          Thu hồi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
