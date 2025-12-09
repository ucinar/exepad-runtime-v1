'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useEditMode } from '@/context/EditModeContext';
import { Loader2, PencilLine, Image as ImageIcon } from 'lucide-react';

interface ComponentWrapperProps {
  componentId: string;
  componentType: string;
  children: React.ReactNode;
}

export function ComponentWrapper({ componentId, componentType, children }: ComponentWrapperProps) {
  const { 
    isEditMode, 
    selectedComponentId, 
    selectComponent,
    processingComponentIds,
    sendWebSocketMessage 
  } = useEditMode();
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const isSelected = selectedComponentId === componentId;
  const isProcessing = processingComponentIds.has(componentId);
  
  // Determine if component has text content (for Rewrite button)
  const hasTextContent = () => {
    if (!wrapperRef.current) return false;
    const text = wrapperRef.current.innerText?.trim();
    return text && text.length > 0;
  };
  
  // Always show rewrite for text/heading components, check content for others
  // DISABLED: Hide Rewrite button (reserved for future use)
  // const isTextComponent = componentType === 'TextProps' || componentType === 'HeadingProps';
  // const shouldShowRewrite = isTextComponent || (isSelected && hasTextContent());
  const shouldShowRewrite = false;
  
  const isImageComponent = componentType === 'ImageProps';
  
  // Handle rewrite action
  const handleRewrite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Extract text content for context
    const textContent = wrapperRef.current?.innerText?.trim() || '';
    
    console.log('[ComponentWrapper] Rewrite clicked for component:', componentId);
    
    // Send rewrite request to frontend via WebSocket
    sendWebSocketMessage({
      type: 'action_request',
      data: {
        action: 'rewrite',
        componentId: componentId,
        componentType: componentType,
        payload: {
          textContent: textContent.slice(0, 200)
        }
      }
    });
  };
  
  // Handle replace action
  const handleReplace = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log('[ComponentWrapper] Replace clicked for component:', componentId);
    
    // Send replace request to frontend via WebSocket
    sendWebSocketMessage({
      type: 'action_request',
      data: {
        action: 'replace',
        componentId: componentId,
        componentType: componentType,
        payload: {}
      }
    });
  };
  
  useEffect(() => {
    if (!isEditMode) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (isSelected && wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        const clickedElement = event.target as HTMLElement;
        // Don't deselect if clicking on another component wrapper
        if (!clickedElement.closest('[data-component-wrapper]')) {
          selectComponent(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSelected, selectComponent, isEditMode]);
  
  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode || isProcessing) return; // Don't allow selection when processing
    
    e.stopPropagation();
    
    // Extract text content for display in chat panel
    const textContent = wrapperRef.current?.innerText?.trim().slice(0, 100) || '';
    
    selectComponent(componentId, {
      componentType,
      textPreview: textContent
    });
  };
  
  // Always render the wrapper to prevent layout shifts, but conditionally apply styling
  return (
    <div
      ref={wrapperRef}
      data-component-wrapper={isEditMode ? 'true' : undefined}
      data-component-id={isEditMode ? componentId : undefined}
      data-component-type={isEditMode ? componentType : undefined}
      className={cn(
        'relative transition-all duration-200',
        isEditMode && 'group/component',
        isEditMode && isSelected && !isProcessing && 'ring-2 ring-blue-500 ring-offset-2 rounded-md',
        isEditMode && isProcessing && 'ring-2 ring-gray-400 ring-offset-2 rounded-md shadow-lg',
        isEditMode && !isSelected && !isProcessing && 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1 hover:rounded-md cursor-pointer',
        isProcessing && 'pointer-events-none' // Disable interactions when processing
      )}
      onClick={handleClick}
    >
      {/* Processing Indicator */}
      {isEditMode && isProcessing && (
        <>
          {/* Animated spinner badge with Apple-style gray */}
          <div className="absolute -top-8 left-2 flex items-center gap-2 px-3 py-1.5 rounded-full transition-opacity duration-200 z-20 bg-gradient-to-br from-gray-700 to-gray-800 text-white border border-gray-600 shadow-xl backdrop-blur-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-200" />
            <span className="text-xs font-medium tracking-wide text-gray-100">Working on...</span>
          </div>
          
          {/* Subtle animated overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-md bg-gray-500/5 z-10 animate-pulse" />
          
          {/* Elegant animated border pulse effect */}
          <div className="absolute inset-0 rounded-md z-10">
            <div className="absolute inset-0 rounded-md border-2 border-gray-400/60 opacity-75 animate-pulse" />
          </div>
        </>
      )}
      
      {/* Action Buttons - Show when selected and not processing */}
      {isEditMode && isSelected && !isProcessing && (
        <div className="absolute -top-2 right-2 flex items-center gap-1 z-20">
          {/* DISABLED: Rewrite button (reserved for future use)
          {shouldShowRewrite && (
            <button
              onClick={handleRewrite}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 text-white border border-gray-600 shadow-lg hover:shadow-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 backdrop-blur-sm"
            >
              <PencilLine className="h-3.5 w-3.5" />
              <span className="text-xs font-medium tracking-wide">Rewrite</span>
            </button>
          )}
          */}
          {isImageComponent && (
            <button
              onClick={handleReplace}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 text-white border border-gray-600 shadow-lg hover:shadow-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 backdrop-blur-sm"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium tracking-wide">Replace</span>
            </button>
          )}
        </div>
      )}
      
      {/* Selection Indicator - Only visible when selected and not processing */}
      {isEditMode && isSelected && !isProcessing && (
        <div className="absolute inset-0 pointer-events-none rounded-md bg-blue-500/5 z-10" />
      )}
      
      {/* Actual Component - Subtly dimmed when processing */}
      <div className={cn(isProcessing && 'opacity-70 select-none')}>
        {children}
      </div>
    </div>
  );
}

export default ComponentWrapper;