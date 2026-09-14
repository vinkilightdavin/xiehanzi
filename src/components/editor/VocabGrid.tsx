import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Wand2 } from 'lucide-react';

export const VocabGrid: React.FC = () => {
  const { lessons, activeLessonId, updateVocab, removeVocab, addVocab, bulkAddVocab } = useStore();
  const [bulkText, setBulkText] = useState('');

  const activeLesson = lessons.find(l => l.id === activeLessonId);

  if (!activeLesson) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Vui lòng chọn hoặc tạo bài học mới
      </div>
    );
  }

  const handleBulkAdd = () => {
    if (bulkText.trim()) {
      bulkAddVocab(activeLesson.id, bulkText);
      setBulkText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-white overflow-y-auto print-hidden border-r">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Từ vựng: {activeLesson.title}</h2>
      
      {/* Smart Input (Bulk Add) */}
      <div className="mb-8 p-4 bg-gray-50 border rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Wand2 size={16} className="text-red-500" /> Nhập nhanh (Tự tách từ và sinh Pinyin)
        </label>
        <div className="flex gap-2">
          <textarea 
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            placeholder="Ví dụ: 中国 学习 朋友 我 是 学生 (cách nhau bởi khoảng trắng hoặc xuống dòng)"
            className="flex-1 border rounded-md p-2 text-sm min-h-[60px]"
          />
          <button 
            onClick={handleBulkAdd}
            className="px-4 py-2 bg-gray-800 text-white rounded-md font-medium text-sm hover:bg-gray-700 h-fit"
          >
            Thêm
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-600">
              <th className="p-2 border font-semibold w-1/4">Chữ Hán</th>
              <th className="p-2 border font-semibold w-1/4">Pinyin (có thể sửa)</th>
              <th className="p-2 border font-semibold w-2/4">Nghĩa tiếng Việt</th>
              <th className="p-2 border font-semibold w-12 text-center">Xoá</th>
            </tr>
          </thead>
          <tbody>
            {activeLesson.vocabulary.map(vocab => (
              <tr key={vocab.id} className="hover:bg-gray-50 transition-colors">
                <td className="border p-0">
                  <input 
                    type="text" 
                    value={vocab.word}
                    onChange={e => updateVocab(activeLesson.id, vocab.id, { word: e.target.value })}
                    className="w-full p-2 outline-none bg-transparent"
                    placeholder="Chữ Hán"
                  />
                </td>
                <td className="border p-0">
                  <input 
                    type="text" 
                    value={vocab.pinyin}
                    onChange={e => updateVocab(activeLesson.id, vocab.id, { pinyin: e.target.value })}
                    className="w-full p-2 outline-none bg-transparent font-medium text-red-600"
                    placeholder="Pinyin"
                  />
                </td>
                <td className="border p-0">
                  <input 
                    type="text" 
                    value={vocab.meaning}
                    onChange={e => updateVocab(activeLesson.id, vocab.id, { meaning: e.target.value })}
                    className="w-full p-2 outline-none bg-transparent text-gray-600"
                    placeholder="Nghĩa..."
                  />
                </td>
                <td className="border text-center">
                  <button 
                    onClick={() => removeVocab(activeLesson.id, vocab.id)}
                    className="text-gray-400 hover:text-red-500 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button 
          onClick={() => addVocab(activeLesson.id, "")}
          className="mt-4 flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          <Plus size={16} /> Thêm 1 dòng mới
        </button>
      </div>
    </div>
  );
};
