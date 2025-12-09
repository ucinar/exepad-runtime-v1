"use client";

import React from 'react';
import { ComponentProps } from '@/app_runtime/interfaces/components/common/core';
import { LayoutOption } from '@/app_runtime/interfaces/apps/core';
import { DynamicRendererList } from './DynamicRenderer';
import { StickyHeader } from './StickyHeader';
import { areComponentsEqual } from '../utils/componentComparison';

interface PersistentHeaderProps {
  components: ComponentProps[];
  isSticky: boolean;
  layoutClasses: string;
  pageLayout: LayoutOption;
}

// Memoized header component that only re-renders when props actually change
const PersistentHeader = React.memo(({ 
  components, 
  isSticky, 
  layoutClasses, 
  pageLayout 
}: PersistentHeaderProps) => {
  return (
    <StickyHeader isSticky={isSticky}>
      <div className={layoutClasses}>
        <DynamicRendererList
          components={components}
          pageLayout={pageLayout}
          isInHeader={true}
        />
      </div>
    </StickyHeader>
  );
}, (prevProps, nextProps) => {
  // Optimized comparison using epoch-based detection instead of JSON.stringify
  return (
    prevProps.isSticky === nextProps.isSticky &&
    prevProps.layoutClasses === nextProps.layoutClasses &&
    prevProps.pageLayout === nextProps.pageLayout &&
    areComponentsEqual(prevProps.components, nextProps.components)
  );
});

PersistentHeader.displayName = 'PersistentHeader';

export default PersistentHeader;