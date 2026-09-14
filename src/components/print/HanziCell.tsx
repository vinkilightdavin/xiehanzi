import React, { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

interface HanziCellProps {
  char: string;
  size?: number;
  gridType?: 'tianzi' | 'mizi' | 'empty';
  opacity?: number;
  showOutline?: boolean;
}

export const HanziCell: React.FC<HanziCellProps> = ({ 
  char, 
  size = 60, 
  gridType = 'tianzi', 
  opacity = 1,
  showOutline = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || opacity === 0 || !char) {
      if (containerRef.current) containerRef.current.innerHTML = '';
      return;
    }

    // Clean up previous instance if character changes
    containerRef.current.innerHTML = '';

    const writer = HanziWriter.create(containerRef.current, char, {
      width: size,
      height: size,
      padding: 0, // Fill the cell
      showOutline: showOutline,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 15,
      charDataLoader: (c: string, onComplete: (data: any) => void, onError: (err: any) => void) => {
        fetch(`/data/${c}.json`)
          .then(res => {
            if (!res.ok) throw new Error("Not found");
            return res.json();
          })
          .then(onComplete)
          .catch(onError);
      },
      strokeColor: `rgba(0, 0, 0, ${opacity})`,
      outlineColor: `rgba(0, 0, 0, ${opacity * 0.2})`,
    });

    writerRef.current = writer;

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [char, size, opacity, showOutline]);

  // SVG for grid background
  const renderGrid = () => {
    if (gridType === 'empty') return null;
    
    return (
      <svg 
        width="100%" 
        height="100%" 
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
      >
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
        {gridType === 'mizi' && (
          <>
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
          </>
        )}
      </svg>
    );
  };

  return (
    <div 
      style={{ width: size, height: size, position: 'relative' }} 
      className="border border-red-300 bg-white"
    >
      {renderGrid()}
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }} 
      />
    </div>
  );
};
