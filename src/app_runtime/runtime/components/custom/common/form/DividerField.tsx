// components/form/DividerField.tsx
"use client";

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Separator } from '@/runtime/components/ui/separator';
import { DividerProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven DividerField component for separating form sections.
 */
export const DividerField: React.FC<DividerProps> = ({
  text,
  classes,
  componentType,
  uuid,
  ...restProps
}) => {
  if (text) {
    return (
      <div className={cn('relative my-4', classes)} {...filterDOMProps(restProps)}>
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{text}</span>
        </div>
      </div>
    );
  }

  return (
    <Separator className={cn('my-4', classes)} {...filterDOMProps(restProps)} />
  );
};

DividerField.displayName = 'DividerField';

export default DividerField;

