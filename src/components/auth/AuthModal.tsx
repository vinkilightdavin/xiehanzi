import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

export const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { signIn, signUp } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) setError(error);
        else onClose();
      } else {
        const { error } = await signUp(email, password);
        if (error) setError(error);
        else setSignedUp(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-5 flex justify-between items-center bg-gray-50 border-b">
          <h2 className="text-xl font-extrabold text-gray-800">
            {mode === 'signin' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-gray-200 hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center font-bold">
            X
          </button>
        </div>

        <div className="p-6">
          {signedUp ? (
            <div className="text-center">
              <p className="text-green-700 font-semibold mb-2">Đăng ký thành công!</p>
              <p className="text-sm text-gray-600">
                Tài khoản của bạn đang ở trạng thái <strong>chờ duyệt</strong>. Bạn có thể dùng app và lưu vở ngay,
                nhưng cần Admin duyệt mới nhập được dữ liệu từ Kho Dữ Liệu.
              </p>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
                Đã hiểu
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
              <button
                type="button"
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                className="text-sm text-blue-600 hover:underline mt-1"
              >
                {mode === 'signin' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
