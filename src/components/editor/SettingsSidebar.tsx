import React, { useState } from 'react';
import { useStore, type GridType, type LayoutMode } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabaseClient';
import { Settings, Type, LayoutGrid, Eye, AlignLeft } from 'lucide-react';

export const SettingsSidebar: React.FC = () => {
  const { projectInfo, updateProjectInfo } = useStore();
  const { user } = useAuthStore();
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleCoverUpload = async (file: File) => {
    // Đã đăng nhập: upload lên Supabase Storage, lưu URL (nhẹ hơn nhúng base64 trực tiếp vào dữ liệu dự án).
    if (user) {
      setUploadingCover(true);
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('covers').upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from('covers').getPublicUrl(path);
        updateProjectInfo({ coverImage: data.publicUrl });
      } catch (err: any) {
        alert(`Lỗi tải ảnh bìa: ${err.message}`);
      } finally {
        setUploadingCover(false);
      }
      return;
    }

    // Chưa đăng nhập: giữ hành vi cũ (nhúng base64, chỉ lưu local).
    const reader = new FileReader();
    reader.onloadend = () => updateProjectInfo({ coverImage: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 flex flex-col gap-6 overflow-y-auto print-hidden shrink-0">
      <div className="flex items-center gap-2 font-bold text-lg text-gray-800 pb-2 border-b">
        <Settings size={20} />
        <span>Cài Đặt Vở</span>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Type size={16} /> Thông Tin Sách
        </label>
        <input 
          type="text" 
          value={projectInfo.title}
          onChange={e => updateProjectInfo({ title: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm"
          placeholder="Tiêu đề sách"
        />
        <input 
          type="text" 
          value={projectInfo.author}
          onChange={e => updateProjectInfo({ author: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm"
          placeholder="Tác giả / Trung tâm"
        />

        <div className="flex flex-col gap-1 mt-2">
          <span className="text-xs text-gray-600 font-semibold">Ảnh Bìa (Tùy chọn)</span>
          <input
            type="file"
            accept="image/*"
            disabled={uploadingCover}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverUpload(file);
            }}
            className="text-xs"
          />
          {uploadingCover && <span className="text-xs text-gray-500">Đang tải ảnh lên...</span>}
          {projectInfo.coverImage && (
            <button 
              onClick={() => updateProjectInfo({ coverImage: null })}
              className="text-xs text-red-600 text-left hover:underline"
            >
              Xóa ảnh bìa (Dùng bìa mặc định)
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <span className="text-xs text-gray-600 font-semibold">Lời Giới Thiệu (Tùy chọn)</span>
          <textarea 
            value={projectInfo.introduction}
            onChange={e => updateProjectInfo({ introduction: e.target.value })}
            className="px-3 py-2 border rounded-md text-sm h-24"
            placeholder="Viết lời giới thiệu hoặc hướng dẫn luyện chữ..."
          />
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <span className="text-xs text-gray-600 font-semibold">Font chữ Nội dung chung (Bìa, Pinyin, Nghĩa)</span>
          <select 
            value={projectInfo.headerFont}
            onChange={e => updateProjectInfo({ headerFont: e.target.value })}
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            <option value="'Times New Roman', serif">Có chân (Times New Roman)</option>
            <option value="Arial, sans-serif">Không chân (Arial)</option>
            <option value="Tahoma, sans-serif">Không chân (Tahoma)</option>
            <option value="'Courier New', monospace">Máy đánh chữ (Courier New)</option>
            <option value="'Dancing Script', 'Caveat', cursive">Viết tay mềm mại (Cursive)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 mt-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-700 font-bold mb-1">Thiết lập Lời Giới Thiệu</span>
          
          <div className="flex flex-col gap-1 mb-2">
            <span className="text-xs text-gray-600">Font chữ</span>
            <select 
              value={projectInfo.introFont}
              onChange={e => updateProjectInfo({ introFont: e.target.value })}
              className="px-3 py-2 border rounded-md text-sm bg-white"
            >
              <option value="'Times New Roman', serif">Có chân (Times New Roman)</option>
              <option value="Arial, sans-serif">Không chân (Arial)</option>
              <option value="Tahoma, sans-serif">Không chân (Tahoma)</option>
              <option value="'Courier New', monospace">Máy đánh chữ (Courier New)</option>
              <option value="'Dancing Script', 'Caveat', cursive">Viết tay mềm mại (Cursive)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-600">Căn lề</span>
            <select 
              value={projectInfo.introAlign}
              onChange={e => updateProjectInfo({ introAlign: e.target.value as 'left' | 'center' | 'justify' | 'right' })}
              className="px-3 py-2 border rounded-md text-sm bg-white"
            >
              <option value="left">Căn trái</option>
              <option value="center">Căn giữa</option>
              <option value="justify">Căn đều 2 bên</option>
              <option value="right">Căn phải</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <AlignLeft size={16} /> Header (Đầu trang)
        </label>
        
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">Font chữ Đầu trang</span>
          <select 
            value={projectInfo.pageHeaderFont}
            onChange={e => updateProjectInfo({ pageHeaderFont: e.target.value })}
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            <option value="'Times New Roman', serif">Có chân (Times New Roman)</option>
            <option value="Arial, sans-serif">Không chân (Arial)</option>
            <option value="Tahoma, sans-serif">Không chân (Tahoma)</option>
            <option value="'Courier New', monospace">Máy đánh chữ (Courier New)</option>
            <option value="'Dancing Script', 'Caveat', cursive">Viết tay mềm mại (Cursive)</option>
          </select>
        </div>

        <input 
          type="text" 
          value={projectInfo.headerLeft}
          onChange={e => updateProjectInfo({ headerLeft: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm mt-1"
          placeholder="Trái (VD: Họ tên...)"
        />
        <input 
          type="text" 
          value={projectInfo.headerCenter}
          onChange={e => updateProjectInfo({ headerCenter: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm"
          placeholder="Giữa (VD: Luyện viết...)"
        />
        <input 
          type="text" 
          value={projectInfo.headerRight}
          onChange={e => updateProjectInfo({ headerRight: e.target.value })}
          className="px-3 py-2 border rounded-md text-sm"
          placeholder="Phải (VD: Ngày...)"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-600">Khoảng cách Header (mm)</span>
          <input 
            type="number" 
            value={projectInfo.headerSpacing}
            onChange={e => updateProjectInfo({ headerSpacing: Number(e.target.value) })}
            className="w-16 px-2 py-1 border rounded-md text-sm text-center"
            min={0} max={50}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <LayoutGrid size={16} /> Bố Cục Trang & Lề (mm)
        </label>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Cân đối 2 bên (Symmetric)</span>
          <input 
            type="checkbox" 
            checked={projectInfo.marginSymmetric}
            onChange={e => {
              const sym = e.target.checked;
              updateProjectInfo({ 
                marginSymmetric: sym,
                ...(sym ? { marginRight: projectInfo.marginLeft } : {})
              });
            }}
            className="w-4 h-4"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Trên</span>
            <input type="number" min={0} max={40} className="px-2 py-1 border rounded-md text-sm" 
              value={projectInfo.marginTop} 
              onChange={e => updateProjectInfo({ marginTop: Number(e.target.value) })} 
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Dưới</span>
            <input type="number" min={0} max={40} className="px-2 py-1 border rounded-md text-sm" 
              value={projectInfo.marginBottom} 
              onChange={e => updateProjectInfo({ marginBottom: Number(e.target.value) })} 
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Trái</span>
            <input type="number" min={0} max={40} className="px-2 py-1 border rounded-md text-sm" 
              value={projectInfo.marginLeft} 
              onChange={e => {
                const val = Number(e.target.value);
                updateProjectInfo({ 
                  marginLeft: val, 
                  ...(projectInfo.marginSymmetric ? { marginRight: val } : {}) 
                });
              }} 
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Phải</span>
            <input type="number" min={0} max={40} className="px-2 py-1 border rounded-md text-sm" 
              value={projectInfo.marginRight} 
              disabled={projectInfo.marginSymmetric}
              onChange={e => updateProjectInfo({ marginRight: Number(e.target.value) })} 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <LayoutGrid size={16} /> Lưới & Kích thước
        </label>
        
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">Loại lưới</span>
          <select 
            value={projectInfo.gridType}
            onChange={e => updateProjectInfo({ gridType: e.target.value as GridType })}
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            <option value="tianzi">Ô vuông (Điền tự 田)</option>
            <option value="mizi">Ô chữ thập (Mễ tự 米)</option>
            <option value="empty">Ô trống</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">Chế độ bố cục</span>
          <select 
            value={projectInfo.layoutMode}
            onChange={e => updateProjectInfo({ layoutMode: e.target.value as LayoutMode })}
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            <option value="char">Chuẩn từng chữ (1 chữ/dòng)</option>
            <option value="word">Văn bản liên tục (Theo từ ghép)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Kích thước ô (mm)</span>
          <input 
            type="number" 
            value={projectInfo.cellSize}
            onChange={e => updateProjectInfo({ cellSize: Number(e.target.value) })}
            className="w-16 px-2 py-1 border rounded-md text-sm text-center"
            min={10} max={30}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Eye size={16} /> Hiển Thị
        </label>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Hiển thị Pinyin</span>
          <input 
            type="checkbox" 
            checked={projectInfo.showPinyin}
            onChange={e => updateProjectInfo({ showPinyin: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Hiển thị Nghĩa</span>
          <input 
            type="checkbox" 
            checked={projectInfo.showMeaning}
            onChange={e => updateProjectInfo({ showMeaning: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Hiển thị thứ tự nét</span>
          <input 
            type="checkbox" 
            checked={projectInfo.showStrokeOrder}
            onChange={e => updateProjectInfo({ showStrokeOrder: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Hiển thị chữ gợi ý (chữ mờ)</span>
          <input 
            type="checkbox" 
            checked={projectInfo.showHintChars}
            onChange={e => updateProjectInfo({ showHintChars: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Số chữ gợi ý (mờ)</span>
          <input 
            type="number" 
            value={projectInfo.hintCharsCount}
            onChange={e => updateProjectInfo({ hintCharsCount: Number(e.target.value) })}
            className="w-16 px-2 py-1 border rounded-md text-sm text-center"
            min={0} max={15}
            disabled={!projectInfo.showHintChars}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Số dòng luyện tập</span>
          <input 
            type="number" 
            value={projectInfo.practiceRowsPerWord}
            onChange={e => updateProjectInfo({ practiceRowsPerWord: Number(e.target.value) })}
            className="w-16 px-2 py-1 border rounded-md text-sm text-center"
            min={1} max={5}
          />
        </div>
      </div>
    </div>
  );
};
