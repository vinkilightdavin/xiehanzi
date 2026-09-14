import React, { useState } from 'react';
import { useStore, PROJECT_LIMIT } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { FolderOpen, Download, Upload, Plus, Trash2, Home, Check, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { KhoDuLieuModal } from './KhoDuLieuModal';
import { AuthModal } from '../auth/AuthModal';

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
  admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700' },
};

export const TopNavbar: React.FC = () => {
  const {
    projectInfo,
    savedProjects,
    activeProjectId,
    saveCurrentProject,
    loadProject,
    createNewProject,
    deleteProject
  } = useStore();
  const { user, role, signOut } = useAuthStore();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showKhoDuLieuModal, setShowKhoDuLieuModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Giới hạn số vở chỉ áp dụng khi đã đăng nhập (dữ liệu được đồng bộ lên Supabase, tốn dung lượng server).
  const atProjectLimit = !!user && savedProjects.length >= PROJECT_LIMIT;

  const handleExport = () => {
    saveCurrentProject();
    const state = useStore.getState();
    const data = JSON.stringify({ projectInfo: state.projectInfo, lessons: state.lessons }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.projectInfo?.title || 'HanziBuilder'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.projectInfo && data.lessons) {
          useStore.setState({ 
            projectInfo: data.projectInfo, 
            lessons: data.lessons, 
            activeLessonId: data.lessons[0]?.id || null 
          });
        } else {
          alert('File không đúng định dạng HanziBuilder!');
        }
      } catch (err) {
        alert('Lỗi đọc file!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateNew = () => {
    if (atProjectLimit) {
      alert(`Tài khoản của bạn đã đạt giới hạn ${PROJECT_LIMIT} vở dự án. Hãy xoá bớt vở cũ để tạo vở mới.`);
      return;
    }
    const title = window.prompt('Nhập tên dự án mới:');
    if (title !== null && title.trim() !== '') {
      createNewProject(title.trim());
      setShowProjectModal(false);
    }
  };

  return (
    <>
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 print-hidden shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white p-1.5 rounded-md">
            <Home size={20} />
          </div>
          <span className="font-extrabold text-xl text-red-800 tracking-tight">HanziBuilder</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              saveCurrentProject();
              setShowProjectModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-semibold text-sm transition-colors"
          >
            <FolderOpen size={16} />
            Dự án: {projectInfo.title || "Chưa đặt tên"}
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <div className="flex gap-2">
            <button 
              title="Nhập từ Kho Dữ Liệu" 
              onClick={() => setShowKhoDuLieuModal(true)} 
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded shadow-sm font-semibold mr-2"
            >
              <Upload size={14} /> Từ Kho Dữ Liệu
            </button>
            <button 
              title="Xuất file dự án (.json)" 
              onClick={handleExport} 
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded shadow-sm"
            >
              <Download size={14} /> Xuất File
            </button>
            <label
              title="Nhập file dự án (.json)"
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded shadow-sm cursor-pointer"
            >
              <Upload size={14} /> Mở File
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {user ? (
            <div className="flex items-center gap-2">
              {role && (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[role].className}`}>
                  {ROLE_BADGE[role].label}
                </span>
              )}
              {role === 'admin' && (
                <a href="/admin" title="Quản lý tài khoản" className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-md">
                  <ShieldCheck size={16} />
                </a>
              )}
              <button
                title={`Đăng xuất (${user.email})`}
                onClick={() => signOut()}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded shadow-sm font-semibold"
            >
              <LogIn size={14} /> Đăng nhập
            </button>
          )}
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {showKhoDuLieuModal && <KhoDuLieuModal onClose={() => setShowKhoDuLieuModal(false)} />}

      {/* Project Manager Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 flex justify-between items-center bg-gray-50 border-b">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                  <FolderOpen className="text-blue-600" size={24} />
                  Quản Lý Dự Án
                </h2>
                <p className="text-sm text-gray-500 mt-1">Lưu trữ và mở lại các cuốn vở tập viết bạn đã thiết kế</p>
                {user && (
                  <p className={`text-xs font-semibold mt-1 ${atProjectLimit ? 'text-red-600' : 'text-gray-400'}`}>
                    Đã dùng {savedProjects.length}/{PROJECT_LIMIT} vở
                  </p>
                )}
              </div>
              <button onClick={() => setShowProjectModal(false)} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-200 hover:bg-red-50 rounded-full p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedProjects.map(proj => (
                  <div key={proj.id} className={`bg-white p-5 rounded-xl border-2 transition-all shadow-sm flex flex-col justify-between h-36 ${activeProjectId === proj.id ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 truncate" title={proj.name}>{proj.name}</h3>
                      <div className="text-xs text-gray-500 mt-2 space-y-1">
                        <p>🕒 {new Date(proj.lastModified).toLocaleString('vi-VN')}</p>
                        <p>📚 {proj.lessons.length} bài học</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      {activeProjectId !== proj.id ? (
                        <button 
                          onClick={() => {
                            loadProject(proj.id);
                            setShowProjectModal(false);
                          }}
                          className="px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors font-semibold rounded-lg text-sm"
                        >
                          Mở dự án này
                        </button>
                      ) : (
                        <span className="px-4 py-1.5 bg-green-100 text-green-700 font-semibold rounded-lg text-sm flex items-center gap-1">
                          <Check size={14} /> Đang mở
                        </span>
                      )}
                      
                      <button 
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa dự án "${proj.name}"? Dữ liệu không thể khôi phục.`)) {
                            deleteProject(proj.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa dự án"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Create New Card */}
                <div
                  onClick={handleCreateNew}
                  className={`bg-white border-2 border-dashed p-5 rounded-xl flex flex-col items-center justify-center h-36 transition-all group ${
                    atProjectLimit
                      ? 'border-gray-200 opacity-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  <div className="bg-gray-100 group-hover:bg-blue-100 p-3 rounded-full mb-2 transition-colors">
                    <Plus size={24} className="text-gray-500 group-hover:text-blue-600" />
                  </div>
                  <span className="font-bold text-gray-600 group-hover:text-blue-700">
                    {atProjectLimit ? `Đã đạt giới hạn ${PROJECT_LIMIT} vở` : 'Tạo dự án mới'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
