// components/layout/ResizableBox.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import { DynamicRendererList } from '@/components/DynamicRenderer'; // Adjust path
import { ResizableBoxProps } from '@/interfaces/components/common/layout/layout'; // Adjust path

// --- The ResizableBox Component Implementation ---

export const ResizableBox: React.FC<ResizableBoxProps> = ({
  content,
  minWidth = '100px',
  minHeight = '100px',
  maxWidth = '100%',
  maxHeight = '100%',
  classes,
  ...restProps
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({ width: 300, height: 200 }); // Initial default size
  const boxRef = useRef<HTMLDivElement>(null);

  // This function will be called when the user starts dragging a handle.
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // This function handles the resizing logic as the mouse moves.
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && boxRef.current) {
      const newWidth = e.clientX - boxRef.current.getBoundingClientRect().left;
      const newHeight = e.clientY - boxRef.current.getBoundingClientRect().top;
      
      // Note: A full implementation would parse min/max props properly.
      // For simplicity, we are using fixed pixel values here.
      const minW = parseInt(minWidth, 10) || 100;
      const minH = parseInt(minHeight, 10) || 100;

      setSize({
        width: Math.max(newWidth, minW),
        height: Math.max(newHeight, minH),
      });
    }
  }, [isResizing, minWidth, minHeight]);

  // This function will be called when the user releases the mouse button.
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // We use useEffect to add and remove global event listeners for mouse move and mouse up.
  // This ensures we can track the mouse even if it moves outside the component's boundaries.
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    // Cleanup function to remove listeners when the component unmounts.
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={boxRef}
      className={cn(
        'relative border rounded-lg overflow-hidden',
        classes
      )}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
      }}
      {...filterDOMProps(restProps)}
    >
      {/* The content is rendered inside a scrollable container */}
      <div className="h-full w-full overflow-auto p-4">
        {content && content.length > 0 && (
          <DynamicRendererList components={content} />
        )}
      </div>

      {/* This is the handle for resizing, positioned at the bottom-right corner. */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-tl-lg cursor-se-resize"
        title="Resize"
      />
    </div>
  );
};

ResizableBox.displayName = 'ResizableBox';

export default ResizableBox;
