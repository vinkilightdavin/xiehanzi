import React, { useEffect, useState } from 'react';

interface StrokeOrderBoxProps {
  char: string;
  size?: number;
}

interface CharData {
  strokes: string[];
}

export const StrokeOrderBox: React.FC<StrokeOrderBoxProps> = ({ char, size = 40 }) => {
  const [data, setData] = useState<CharData | null>(null);

  useEffect(() => {
    fetch(`/data/${char}.json`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(console.error);
  }, [char]);

  if (!data) return null;

  // Render a single box showing the character up to `strokeIndex`
  const renderBox = (strokeIndex: number) => {
    return (
      <div 
        key={strokeIndex} 
        style={{ width: size, height: size }} 
        className="border border-red-300 relative bg-white shrink-0"
      >
        <svg 
          viewBox="0 0 1024 1024" 
          width="100%" 
          height="100%"
        >
          <g transform="translate(0, 900) scale(1, -1)">
            {/* Draw previous strokes in black */}
            {data.strokes.slice(0, strokeIndex).map((path, i) => (
              <path key={i} d={path} fill="#000" />
            ))}
            {/* Draw current stroke in red to highlight */}
            <path d={data.strokes[strokeIndex]} fill="#ef4444" />
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-wrap gap-1">
      {data.strokes.map((_, i) => renderBox(i))}
    </div>
  );
};
