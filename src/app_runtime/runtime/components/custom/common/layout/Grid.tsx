// components/layout/Grid.tsx
// No "use client" directive - this is a Server Component by default.

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer'; // Adjust path
import { GridProps } from '@/interfaces/components/common/layout/layout'; // Adjust path
import { ComponentProps } from '@/interfaces/components/common/core';

// --- The Grid Component Implementation (SSR-Friendly) ---

export const Grid: React.FC<GridProps> = (props) => {
  const {
    content,
    columns,
    rows,
    gapX = '0',
    gapY = '0',
    gap,
    classes,
    // Destructure component-specific props to prevent them from being spread to DOM
    componentType,
    uuid,
    // Also destructure any alternative CSS-style prop names that might come from JSON
    gridTemplateColumns: _gridTemplateColumns,
    gridTemplateRows: _gridTemplateRows,
    gridGap: _gridGap,
    columnGap: _columnGap,
    rowGap: _rowGap,
    // Destructure any other props that shouldn't go to DOM
    ...restProps
  } = props as any;

  // A mapping is used to ensure Tailwind's JIT compiler can find the full class names.
  const columnClasses: { [key: number]: string } = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12',
  };

  const rowClasses: { [key: number]: string } = {
    1: 'grid-rows-1',
    2: 'grid-rows-2',
    3: 'grid-rows-3',
    4: 'grid-rows-4',
    5: 'grid-rows-5',
    6: 'grid-rows-6',
  };
  
  const gapXClasses: { [key: string]: string } = {
    '0': 'gap-x-0', '1': 'gap-x-1', '2': 'gap-x-2', '3': 'gap-x-3', '4': 'gap-x-4', '5': 'gap-x-5', '6': 'gap-x-6', '8': 'gap-x-8', '10': 'gap-x-10', '12': 'gap-x-12', '16': 'gap-x-16', '20': 'gap-x-20', '24': 'gap-x-24', '32': 'gap-x-32'
  };

  const gapYClasses: { [key: string]: string } = {
    '0': 'gap-y-0', '1': 'gap-y-1', '2': 'gap-y-2', '3': 'gap-y-3', '4': 'gap-y-4', '5': 'gap-y-5', '6': 'gap-y-6', '8': 'gap-y-8', '10': 'gap-y-10', '12': 'gap-y-12', '16': 'gap-y-16', '20': 'gap-y-20', '24': 'gap-y-24', '32': 'gap-y-32'
  };

  const gapClasses: { [key: string]: string } = {
    '0': 'gap-0', '1': 'gap-1', '2': 'gap-2', '3': 'gap-3', '4': 'gap-4', '5': 'gap-5', '6': 'gap-6', '8': 'gap-8', '10': 'gap-10', '12': 'gap-12', '16': 'gap-16', '20': 'gap-20', '24': 'gap-24', '32': 'gap-32'
  };

  // Use unified gap if provided, otherwise use separate gapX/gapY
  const actualGapX = gap ? gap : gapX;
  const actualGapY = gap ? gap : gapY;

  const gridClasses = cn(
    'grid',
    columns && columnClasses[columns],
    rows && rowClasses[rows],
    // If unified gap is provided, use gap-* class, otherwise use gap-x-* and gap-y-*
    gap ? gapClasses[gap] : (
      actualGapX && gapXClasses[actualGapX]
    ),
    gap ? null : (
      actualGapY && gapYClasses[actualGapY]
    ),
    classes
  );

  return (
    <div className={gridClasses} {...filterDOMProps(restProps)}>
      {/* FIX: Render each child component directly using a map.
        This ensures that the items in the `content` array are direct children
        of the grid container, which is required for CSS Grid to work correctly.
        The previous implementation wrapped them in a <DynamicRendererList />,
        which broke the parent-child relationship for the grid.
      */}
      {content && content.map((component: ComponentProps) => (
        <DynamicRenderer key={component.uuid} component={component} />
      ))}
    </div>
  );
};

Grid.displayName = 'Grid';

export default Grid;
