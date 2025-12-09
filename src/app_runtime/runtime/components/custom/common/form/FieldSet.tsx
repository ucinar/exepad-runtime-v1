// components/form/FieldSet.tsx
"use client";

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { DynamicRenderer } from '@/components/DynamicRenderer';
import { FieldSetProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven FieldSet component for grouping related form fields.
 */
export const FieldSet: React.FC<FieldSetProps> = ({
  legend,
  content,
  classes,
  componentType,
  uuid,
  ...restProps
}) => {
  return (
    <fieldset
      className={cn('border border-border rounded-lg p-4 space-y-4', classes)}
      {...filterDOMProps(restProps)}
    >
      <legend className="text-lg font-semibold px-2">{legend}</legend>
      <div className="space-y-4">
        {content.map((field) => (
          <DynamicRenderer key={field.uuid} component={field} />
        ))}
      </div>
    </fieldset>
  );
};

FieldSet.displayName = 'FieldSet';

export default FieldSet;

