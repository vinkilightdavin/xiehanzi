import { supabase } from '../lib/supabaseClient';

const BASE_URL = import.meta.env.DEV ? 'http://localhost:3009' : '';

export const listPublishedCourses = async (level?: string) => {
  const res = await fetch(`${BASE_URL}/api/kho-du-lieu/courses${level ? `?level=${level}` : ""}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ? `Không thể lấy danh sách giáo trình: ${data.error}` : 'Không thể lấy danh sách giáo trình');
  }
  return res.json();
};

export const getCourseDetail = async (slug: string) => {
  const res = await fetch(`${BASE_URL}/api/kho-du-lieu/courses/${slug}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ? `Không thể lấy chi tiết giáo trình: ${data.error}` : 'Không thể lấy chi tiết giáo trình');
  }
  return res.json();
};

// Endpoint này yêu cầu tài khoản đã được Admin duyệt (kiểm tra ở serverless function phía server).
export const getLessonBundle = async (lessonId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${BASE_URL}/api/kho-du-lieu/lessons/${lessonId}/bundle`, {
    headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Không thể lấy dữ liệu bài học');
  }
  return res.json();
};
