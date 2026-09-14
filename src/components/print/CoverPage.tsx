import React from 'react';
import { useStore } from '../../store/useStore';

export const CoverPage: React.FC = () => {
  const { projectInfo } = useStore();

  return (
    <div 
      className="flex flex-col items-center justify-center bg-white page-break-after"
      style={{ width: '210mm', height: '297mm' }}
    >
      {projectInfo.coverImage ? (
        <img 
          src={projectInfo.coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-20 border-8 border-double border-red-800 rounded-xl m-10 w-4/5 h-4/5">
          <h1 className="text-5xl font-bold text-red-800 mb-8 text-center leading-tight">
            {projectInfo.title}
          </h1>
          <div className="text-2xl text-gray-700 italic">
            {projectInfo.author}
          </div>
        </div>
      )}
    </div>
  );
};
