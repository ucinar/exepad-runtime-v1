// components/common/Skeleton.tsx
import * as React from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Skeleton as ShadcnSkeleton } from "@/runtime/components/ui/skeleton"; // Adjust path
import { SkeletonProps } from '@/interfaces/components/common/core'; // Adjust path

/**
 * A helper function to format a string value into a valid CSS unit.
 * If the value is a number, it appends 'px'.
 * @param value The string value from the JSON config.
 * @returns A valid CSS size string.
 */
const formatCssValue = (value: string): string => {
  // If the value is a number string (e.g., "200"), append 'px'.
  if (!isNaN(Number(value))) {
    return `${value}px`;
  }
  // Otherwise, return the value as is (e.g., "200px", "50%").
  return value;
};

/**
 * A data-driven component that displays a placeholder skeleton,
 * typically used to indicate that content is loading.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  classes,
  ...restProps
}) => {
  // Create an inline style object to handle arbitrary width and height values.
  const style: React.CSSProperties = {
    width: formatCssValue(width),
    height: formatCssValue(height),
  };

  return (
    <ShadcnSkeleton
      className={cn(classes)}
      style={style}
      {...filterDOMProps(restProps)}
    />
  );
};

export default Skeleton;
