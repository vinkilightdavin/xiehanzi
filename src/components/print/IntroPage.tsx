import React from 'react';
import { useStore } from '../../store/useStore';

export const IntroPage: React.FC = () => {
  const { projectInfo } = useStore();

  if (!projectInfo.introduction.trim()) return null;

  return (
    <div 
      className="bg-white page-break-after text-gray-800"
      style={{ 
        width: '210mm', 
        minHeight: '297mm',
        padding: `${projectInfo.marginTop}mm ${projectInfo.marginRight}mm ${projectInfo.marginBottom}mm ${projectInfo.marginLeft}mm`,
        boxSizing: 'border-box'
      }}
    >
      <h2 className="text-3xl font-bold text-center mb-10 pb-4 border-b">
        Lời Giới Thiệu
      </h2>
      <div 
        className="text-lg leading-relaxed whitespace-pre-wrap"
        style={{ 
          fontFamily: `${projectInfo.introFont || "'Times New Roman', serif"}, "KaiTi", "STKaiti", "SimSun", serif`,
          textAlign: projectInfo.introAlign || 'left'
        }}
      >
        {projectInfo.introduction}
      </div>
    </div>
  );
};
