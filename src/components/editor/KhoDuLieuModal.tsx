import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { listPublishedCourses, getCourseDetail, getLessonBundle } from '../../api/kho-du-lieu-client';

export const KhoDuLieuModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { importLessonBundle, updateProjectInfo } = useStore();
  const { user, role } = useAuthStore();
  const canImport = role === 'approved' || role === 'admin';
  
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await listPublishedCourses();
        setCourses(data.courses || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSelectCourse = async (slug: string) => {
    setLoading(true);
    setError(null);
    setSelectedLessons(new Set()); // Reset selections when changing course
    try {
      const data = await getCourseDetail(slug);
      setSelectedCourse(data);
      setLessons(data.lessons || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = (id: string) => {
    const next = new Set(selectedLessons);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLessons(next);
  };

  const toggleSelectAll = () => {
    if (selectedLessons.size === lessons.length) {
      setSelectedLessons(new Set());
    } else {
      setSelectedLessons(new Set(lessons.map(l => l.id)));
    }
  };

  const handleBatchImport = async () => {
    if (selectedLessons.size === 0) return;
    setImporting(true);
    setError(null);
    try {
      if (selectedCourse) {
        updateProjectInfo({ title: selectedCourse.title });
      }

      const lessonsToImport = lessons.filter(l => selectedLessons.has(l.id));
      let totalVocab = 0;

      for (const lesson of lessonsToImport) {
        const bundle = await getLessonBundle(lesson.id);
        const vocab = bundle.vocabulary || [];
        importLessonBundle(lesson.title, vocab);
        totalVocab += vocab.length;
      }
      
      alert(`Đã nhập thành công ${selectedLessons.size} bài học (${totalVocab} từ vựng) vào vở tập viết!`);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-5 flex justify-between items-center bg-gray-50 border-b">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">Kho Dữ Liệu Giáo Trình</h2>
            <p className="text-sm text-gray-500 mt-1">Chọn giáo trình và đánh dấu các bài học để tự động nhập từ vựng</p>
            {!canImport && (
              <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mt-2 inline-block">
                {user ? 'Tài khoản của bạn chưa được Admin duyệt — vẫn xem được danh sách nhưng chưa nhập được bài học.' : 'Đăng nhập và chờ Admin duyệt để nhập bài học vào vở.'}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-200 hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center font-bold">
            X
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden flex">
          {/* Courses List */}
          <div className="w-1/2 border-r p-6 overflow-y-auto bg-gray-50/50">
            <h3 className="font-bold mb-4 text-lg text-gray-700">1. Chọn Giáo trình</h3>
            {loading && !selectedCourse ? <p>Đang tải...</p> : (
              <div className="flex flex-col gap-3">
                {courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => handleSelectCourse(course.slug)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${selectedCourse?.id === course.id ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white hover:border-blue-300 border-gray-200 shadow-sm'}`}
                  >
                    <div className="font-bold text-gray-800 text-lg">{course.title}</div>
                    <div className="text-sm text-gray-500 mt-1">Cấp độ: {course.level || 'Không có'}</div>
                  </button>
                ))}
                {courses.length === 0 && !loading && <p className="text-gray-500 italic">Không tìm thấy giáo trình nào.</p>}
              </div>
            )}
          </div>

          {/* Lessons List */}
          <div className="w-1/2 flex flex-col bg-white">
            <div className="p-6 pb-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-700">2. Chọn Bài học</h3>
                {lessons.length > 0 && (
                  <button 
                    onClick={toggleSelectAll}
                    className="text-sm text-blue-600 font-semibold hover:text-blue-800"
                  >
                    {selectedLessons.size === lessons.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {loading && selectedCourse ? <p>Đang tải bài học...</p> : (
                <div className="flex flex-col gap-2">
                  {!selectedCourse && <p className="text-gray-500 italic mt-4">Vui lòng chọn giáo trình ở cột bên trái.</p>}
                  {lessons.map(lesson => (
                    <label key={lesson.id} className={`p-3 border rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${selectedLessons.has(lesson.id) ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={selectedLessons.has(lesson.id)}
                        onChange={() => toggleLesson(lesson.id)}
                      />
                      <span className="font-medium text-gray-800 select-none">{lesson.title}</span>
                    </label>
                  ))}
                  {selectedCourse && lessons.length === 0 && !loading && <p className="text-gray-500 italic">Giáo trình này chưa có bài học nào.</p>}
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                  Lỗi: {error}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-gray-50 border-t flex justify-end items-center">
              <span className="text-gray-600 text-sm font-medium mr-4">
                Đã chọn: <strong className="text-gray-900">{selectedLessons.size}</strong> bài
              </span>
              <button
                onClick={handleBatchImport}
                disabled={selectedLessons.size === 0 || importing || !canImport}
                title={!canImport ? 'Tài khoản chưa được duyệt để nhập dữ liệu' : undefined}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {importing ? "Đang tải..." : `Nhập ${selectedLessons.size > 0 ? selectedLessons.size : ''} Bài Học`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
