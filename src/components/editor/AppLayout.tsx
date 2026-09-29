import React, { useEffect, useState } from 'react';
import { LessonSidebar } from './LessonSidebar';
import { VocabGrid } from './VocabGrid';
import { SettingsSidebar } from './SettingsSidebar';
import { PrintLayout } from '../print/PrintLayout';
import { TopNavbar } from './TopNavbar';
import { ZoomIn, ZoomOut, Printer } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const AppLayout: React.FC = () => {
  const [scale, setScale] = useState(0.4);
  const { activeLessonId } = useStore();

  // scale chỉ để xem trước trên màn hình; khi in/xuất PDF thật (window.print())
  // luôn dùng tỷ lệ 100%, không phụ thuộc mức zoom đang xem.
  const [isPrinting, setIsPrinting] = useState(false);
  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);
  const displayScale = isPrinting ? 1 : scale;

  return (
    <div className="flex flex-col h-screen w-full bg-gray-200 overflow-hidden print:overflow-visible print:h-auto text-gray-800 font-sans">
      <TopNavbar />
      
      <div className="flex flex-1 overflow-hidden print:overflow-visible">
        <LessonSidebar />
        
        {activeLessonId ? (
          <VocabGrid />
        ) : (
          <div className="w-80 border-r border-gray-200 bg-white p-4 flex flex-col print-hidden shrink-0 items-center justify-center text-gray-500 text-center px-8">
            <p className="font-semibold text-lg mb-2">Chưa chọn bài học</p>
            <p className="text-sm">Vui lòng chọn một bài học ở cột bên trái hoặc tạo bài học mới.</p>
          </div>
        )}
        
        {/* Right side: Print Preview + Settings Sidebar */}
        <div className="flex-1 flex flex-col bg-gray-300 print:bg-white print:m-0 print:p-0 print:overflow-visible print:h-auto overflow-hidden">
          
          {/* Editor Top Bar for Print Preview */}
          <div className="h-14 bg-white border-b flex items-center justify-between px-4 print-hidden shadow-sm shrink-0 z-10 relative">
            <div className="font-bold text-gray-700">Xem Trước (Print Preview)</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-md p-1 border">
                <button 
                  onClick={() => setScale(s => Math.max(0.2, s - 0.1))}
                  className="p-1 hover:bg-white rounded text-gray-600 shadow-sm"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-medium w-10 text-center">{Math.round(scale * 100)}%</span>
                <button 
                  onClick={() => setScale(s => Math.min(2, s + 0.1))}
                  className="p-1 hover:bg-white rounded text-gray-600 shadow-sm"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
              
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded-md font-medium text-sm hover:bg-red-700 shadow-sm"
              >
                <Printer size={16} /> Xuất PDF / In
              </button>
            </div>
          </div>

          {/* Print Preview Canvas Area */}
          <div className="flex-1 overflow-auto p-8 flex justify-center print:p-0 print:overflow-visible print:h-auto print:block">
            <div 
              className="origin-top shadow-2xl print:shadow-none print:transform-none"
              style={{
                transform: `scale(${displayScale})`,
                height: 'fit-content',
                marginBottom: `${(1 - displayScale) * 297}mm` // rough compensation for scaling
              }}
            >
              <PrintLayout />
            </div>
          </div>
        </div>

        <SettingsSidebar />
      </div>
    </div>
  );
};
