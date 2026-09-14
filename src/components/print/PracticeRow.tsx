import React from 'react';
import { useStore, type VocabItem } from '../../store/useStore';
import { HanziCell } from './HanziCell';
import { StrokeOrderBox } from './StrokeOrderBox';

interface PracticeRowProps {
  vocab: VocabItem;
}

export const PracticeRow: React.FC<PracticeRowProps> = ({ vocab }) => {
  const { projectInfo } = useStore();
  const { 
    cellSize, 
    gridType, 
    showStrokeOrder, 
    hintCharsCount, 
    showHintChars,
    showPinyin, 
    showMeaning,
    practiceRowsPerWord,
    layoutMode,
    marginLeft,
    marginRight
  } = projectInfo;

  const contentWidth = 210 - marginLeft - marginRight;
  const estimatedCellsPerRow = Math.floor(contentWidth / cellSize);
  const actualHintCount = showHintChars ? hintCharsCount : 0;

  // Header showing pinyin and meaning
  const renderHeader = () => {
    return (
      <div className="flex items-end gap-4 text-sm mb-1 mt-2">
        <span 
          className="font-bold text-xl text-black" 
          style={{ fontFamily: '"KaiTi", "STKaiti", "SimSun", "PingFang SC", serif' }}
        >
          {vocab.word}
        </span>
        {showPinyin && <span className="font-medium text-gray-700">{vocab.pinyin}</span>}
        {showMeaning && <span className="text-gray-500 italic">{vocab.meaning}</span>}
      </div>
    );
  };

  if (layoutMode === 'char') {
    // 1 char per block of rows
    return (
      <div className="mb-4 flex flex-col">
        {vocab.chars.map((char, charIdx) => {
          return Array.from({ length: practiceRowsPerWord }).map((_, rowIdx) => (
            <div key={`${charIdx}-${rowIdx}`} className="flex flex-col w-full page-break-avoid">
              
              {charIdx === 0 && rowIdx === 0 && renderHeader()}

              {showStrokeOrder && rowIdx === 0 && (
                <div className="mb-2 mt-1">
                  <StrokeOrderBox char={char} size={cellSize * 3.78 * 0.8} />
                </div>
              )}

              <div className="flex flex-wrap gap-0 w-full" style={{ borderLeft: '1px solid #fca5a5', borderTop: '1px solid #fca5a5', borderRight: '1px solid #fca5a5', borderBottom: rowIdx === practiceRowsPerWord - 1 ? '1px solid #fca5a5' : 'none' }}>
                {Array.from({ length: estimatedCellsPerRow }).map((_, colIdx) => {
                  let opacity = 0;
                  if (rowIdx === 0) {
                    if (colIdx === 0) opacity = 1;
                    else if (colIdx <= actualHintCount) opacity = 0.3;
                  }

                  return (
                    <div key={colIdx} style={{ width: `${cellSize}mm`, height: `${cellSize}mm`, borderRight: colIdx < estimatedCellsPerRow - 1 ? '1px dashed #fca5a5' : 'none', borderBottom: rowIdx < practiceRowsPerWord - 1 ? '1px dashed #fca5a5' : 'none' }} className="shrink-0">
                      <HanziCell char={char} size={cellSize * 3.78} gridType={gridType} opacity={opacity} showOutline={opacity > 0} />
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })}
      </div>
    );
  }

  // layoutMode === 'word'
  // Repeatedly draw the word in the row
  return (
    <div className="mb-4 flex flex-col">
      {Array.from({ length: practiceRowsPerWord }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex flex-col w-full page-break-avoid">
          {rowIdx === 0 && renderHeader()}

          {/* Stroke Order: For words, we might show stroke order for each char sequentially */}
          {showStrokeOrder && rowIdx === 0 && (
            <div className="mb-2 mt-1 flex flex-wrap gap-4">
              {vocab.chars.map((char, i) => (
                <StrokeOrderBox key={i} char={char} size={cellSize * 3.78 * 0.8} />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-0 w-full" style={{ borderLeft: '1px solid #fca5a5', borderTop: '1px solid #fca5a5', borderRight: '1px solid #fca5a5', borderBottom: rowIdx === practiceRowsPerWord - 1 ? '1px solid #fca5a5' : 'none' }}>
            {Array.from({ length: estimatedCellsPerRow }).map((_, colIdx) => {
              const charIndex = colIdx % vocab.chars.length;
              const char = vocab.chars[charIndex];
              const wordRepeatIndex = Math.floor(colIdx / vocab.chars.length);
              
              let opacity = 0;
              if (rowIdx === 0) {
                if (wordRepeatIndex === 0) opacity = 1;
                else if (wordRepeatIndex <= actualHintCount) opacity = 0.3;
              }

              return (
                <div key={colIdx} style={{ width: `${cellSize}mm`, height: `${cellSize}mm`, borderRight: colIdx < estimatedCellsPerRow - 1 ? '1px dashed #fca5a5' : 'none', borderBottom: rowIdx < practiceRowsPerWord - 1 ? '1px dashed #fca5a5' : 'none' }} className="shrink-0">
                  <HanziCell char={char} size={cellSize * 3.78} gridType={gridType} opacity={opacity} showOutline={opacity > 0} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
