// components/common/Spinner.tsx
import * as React from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ComponentProps } from '@/interfaces/components/common/core'; // Adjust path

/**
 * Loading indicator with size and color
 */
export interface SpinnerProps extends ComponentProps {
  /** Spinner size in pixels */
  size: number;
  /** Spinner color */
  color: string;
}

/**
 * A data-driven component that displays a spinning loading indicator.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size,
  color,
  classes,
  ...restProps
}) => {
  // Inline styles are used to apply the dynamic size and color from the props.
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    color: color,
  };

  return (
    <Loader2
      className={cn('animate-spin', classes)}
      style={style}
      {...filterDOMProps(restProps)}
    />
  );
};

export default Spinner;
