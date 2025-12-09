// components/form/HiddenField.tsx
"use client";

import React from 'react';
import { filterDOMProps } from '@/lib/utils';
import { HiddenFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven HiddenField component for storing hidden form values.
 */
export const HiddenField: React.FC<HiddenFieldProps> = ({
  name,
  value,
  componentType,
  uuid,
  classes,
  ...restProps
}) => {
  return (
    <input
      type="hidden"
      name={name}
      value={value}
      {...filterDOMProps(restProps)}
    />
  );
};

HiddenField.displayName = 'HiddenField';

export default HiddenField;

