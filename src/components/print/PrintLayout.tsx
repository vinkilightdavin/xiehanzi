import React from 'react';
import { useStore } from '../../store/useStore';
import { CoverPage } from './CoverPage';
import { IntroPage } from './IntroPage';
import { LessonPage } from './LessonPage';

export const PrintLayout: React.FC = () => {
  const { lessons, projectInfo } = useStore();

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 0 !important;
        }
        .print-container {
          width: 210mm;
          min-height: 297mm;
        }
        @media print {
          .print-container {
            width: 210mm !important;
          }
        }
      `}</style>
      <div 
        className="bg-white text-gray-800 print-container mx-auto" 
        style={{ 
          fontFamily: `${projectInfo.headerFont || "'Times New Roman', serif"}, "KaiTi", "STKaiti", "SimSun", "PingFang SC", serif`
        }}
      >
        <CoverPage />
        <IntroPage />
        {lessons.map(lesson => (
          <LessonPage key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </>
  );
};
