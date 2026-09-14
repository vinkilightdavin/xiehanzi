import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Book, Plus, Trash2, Edit2, Check } from 'lucide-react';

export const LessonSidebar: React.FC = () => {
  const { 
    lessons, activeLessonId, addLesson, removeLesson, updateLessonTitle, setActiveLesson
  } = useStore();
  
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addLesson(newTitle.trim());
      setNewTitle('');
    }
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col print-hidden shrink-0 h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
          <Book size={20} />
          <span>Danh sách Bài học</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {lessons.map(lesson => (
          <div 
            key={lesson.id}
            className={`p-3 rounded-md cursor-pointer border ${
              activeLessonId === lesson.id 
                ? 'bg-red-50 border-red-200' 
                : 'bg-white border-transparent hover:border-gray-200'
            }`}
            onClick={() => setActiveLesson(lesson.id)}
          >
            {editingId === lesson.id ? (
              <div className="flex items-center gap-2">
                <input 
                  autoFocus
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && editTitle.trim()) {
                      updateLessonTitle(lesson.id, editTitle.trim());
                      setEditingId(null);
                    }
                  }}
                />
                <button onClick={() => {
                  if (editTitle.trim()) {
                    updateLessonTitle(lesson.id, editTitle.trim());
                    setEditingId(null);
                  }
                }} className="text-green-600 p-1 hover:bg-green-100 rounded">
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <span className={`font-semibold text-sm ${activeLessonId === lesson.id ? 'text-red-700' : 'text-gray-700'}`}>
                  {lesson.title}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTitle(lesson.title);
                      setEditingId(lesson.id);
                    }}
                    className="text-blue-500 p-1 hover:bg-blue-100 rounded"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Xóa bài học này?')) removeLesson(lesson.id);
                    }}
                    className="text-red-500 p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Tên bài học mới..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
