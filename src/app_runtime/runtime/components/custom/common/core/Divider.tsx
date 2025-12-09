// components/common/Divider.tsx
import * as React from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { DividerProps } from '@/interfaces/components/common/core'; // Adjust path


/**
 * A data-driven component that renders a horizontal or vertical line divider,
 * often used to separate content.
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = '1px',
  color = 'hsl(var(--border))', // Defaults to the shadcn/ui border color
  classes,
  ...restProps
}) => {
  const isHorizontal = orientation === 'horizontal';

  // Base classes for the divider element
  const dividerClasses = cn(
    'shrink-0', // Prevents the divider from shrinking in a flex container
    isHorizontal ? 'h-[1px] w-full' : 'h-full w-[1px]',
    classes
  );

  // Inline styles are used for dynamic thickness and color from the JSON config
  const style = {
    backgroundColor: color,
    ...(isHorizontal ? { height: thickness } : { width: thickness }),
  };

  return (
    <div
      className={dividerClasses}
      style={style}
      role="separator"
      // The `orientation` prop now has the correct type, resolving the error.
      aria-orientation={orientation}
      {...filterDOMProps(restProps)}
    />
  );
};

export default Divider;
