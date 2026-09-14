import React from 'react';
import { type Lesson, useStore } from '../../store/useStore';
import { PracticeRow } from './PracticeRow';

interface LessonPageProps {
  lesson: Lesson;
}

export const LessonPage: React.FC<LessonPageProps> = ({ lesson }) => {
  const { projectInfo } = useStore();

  return (
    <div 
      className="bg-white page-break-after"
      style={{
        width: '210mm',
        paddingLeft: `${projectInfo.marginLeft}mm`,
        paddingRight: `${projectInfo.marginRight}mm`,
        boxSizing: 'border-box'
      }}
    >
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <thead style={{ fontFamily: `${projectInfo.pageHeaderFont || "'Times New Roman', serif"}, "KaiTi", "STKaiti", "SimSun", serif` }}>
          <tr>
            <td style={{ 
              paddingTop: `${projectInfo.marginTop}mm`,
              paddingBottom: `${projectInfo.headerSpacing}mm` 
            }}>
              {/* Header section */}
              <div className="flex justify-between items-center text-sm text-gray-700 border-b pb-2">
                <div className="flex-1 text-left">{projectInfo.headerLeft}</div>
                <div className="flex-1 text-center font-bold text-base">{projectInfo.headerCenter}</div>
                <div className="flex-1 text-right">{projectInfo.headerRight}</div>
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="mt-8 mb-12">
                <h2 className="text-4xl font-extrabold text-center text-red-800 pb-6 border-b-4 border-double border-red-800">
                  {lesson.title}
                </h2>
              </div>
              <div className="flex flex-col">
                {lesson.vocabulary.map((vocab) => (
                  <PracticeRow key={vocab.id} vocab={vocab} />
                ))}
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style={{ height: `${projectInfo.marginBottom}mm` }}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
