// components/form/HeadingField.tsx
"use client";

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { HeadingFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven HeadingField component for adding headings within forms.
 */
export const HeadingField: React.FC<HeadingFieldProps> = ({
  text,
  level = 2,
  classes,
  componentType,
  uuid,
  ...restProps
}) => {
  const HeadingTag = `h${level}` as React.ElementType;
  
  const headingClasses = cn(
    'font-semibold tracking-tight',
    {
      'text-4xl': level === 1,
      'text-3xl': level === 2,
      'text-2xl': level === 3,
      'text-xl': level === 4,
      'text-lg': level === 5,
      'text-base': level === 6,
    },
    classes
  );

  return (
    <HeadingTag className={headingClasses} {...filterDOMProps(restProps)}>
      {text}
    </HeadingTag>
  );
};

HeadingField.displayName = 'HeadingField';

export default HeadingField;

