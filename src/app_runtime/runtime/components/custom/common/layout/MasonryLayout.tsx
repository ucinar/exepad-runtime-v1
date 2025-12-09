// components/layout/MasonryLayout.tsx
"use client";

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import Masonry from 'react-masonry-css';
import { DynamicRendererList } from '@/components/DynamicRenderer'; // Adjust path
import { MasonryLayoutProps } from '@/interfaces/components/common/layout/layout'; // Adjust path

// --- The MasonryLayout Component Implementation ---

export const MasonryLayout: React.FC<MasonryLayoutProps> = ({
  content,
  columnCount = 3, // Defaulting to 3 columns
  gutter = '1rem', // Defaulting to 1rem gutter
  classes,
  ...restProps
}) => {

  // The react-masonry-css library requires a breakpointCols object.
  // For a fixed column count as defined in the interface, we can use a simple default.
  // This could be expanded later to use the BreakpointConfigProps from your interfaces
  // for a fully responsive masonry grid.
  const breakpointColumnsObj = {
    default: columnCount,
    // Example for responsiveness (can be configured via props later)
    // 1100: 3,
    // 700: 2,
    // 500: 1
  };

  return (
    <div className={cn(classes)} {...filterDOMProps(restProps)}>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid flex"
        columnClassName="my-masonry-grid_column bg-clip-padding"
        // The gutter is applied as padding on the column, so we need a wrapper div
        // inside the column to create the visual spacing.
        style={{ marginLeft: `-${gutter}`, marginRight: `-${gutter}` }}
      >
        {/*
          The react-masonry-css library works by cloning the direct children.
          Therefore, we can't use DynamicRendererList directly. We must first
          render the children and then pass them to Masonry.
          
          This is a common pattern when integrating with libraries that manipulate
          their children directly.
        */}
        {content.map((component, index) => (
          <div key={component.uuid || `masonry-item-${index}`} style={{ paddingLeft: gutter, paddingRight: gutter, marginBottom: gutter }}>
             <DynamicRendererList components={[component]} />
          </div>
        ))}
      </Masonry>
    </div>
  );
};

/*
  IMPORTANT: You will need to add the following CSS to your global stylesheet
  (e.g., globals.css) for the masonry layout to work correctly.
  This is a requirement of the react-masonry-css library.

  .my-masonry-grid {
    display: -webkit-box; // Older Safari
    display: -ms-flexbox; // IE 10
    display: flex;
    width: auto;
  }
  .my-masonry-grid_column {
    padding-left: 1rem; // This is your gutter. Match the 'gutter' prop default.
    background-clip: padding-box;
  }

  // Style your items as needed
  .my-masonry-grid_column > div { 
    margin-bottom: 1rem; // This is your gutter.
  }
*/


MasonryLayout.displayName = 'MasonryLayout';

export default MasonryLayout;
