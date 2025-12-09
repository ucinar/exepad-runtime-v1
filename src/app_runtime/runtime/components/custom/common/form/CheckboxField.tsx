// components/form/CheckboxField.tsx
"use client";

import React, { useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Checkbox } from '@/runtime/components/ui/checkbox';
import { Label } from '@/runtime/components/ui/label';
import { CheckboxFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven CheckboxField component for binary (true/false) choices.
 */
export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  helperText,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  classes,
  componentType,
  uuid,
  visibilityCondition,
  validationRules,
  ...restProps
}) => {
  const [checked, setChecked] = useState<boolean>(
    defaultValue === true || defaultValue === 'true'
  );
  const [error, setError] = useState<string | null>(null);

  const handleCheckedChange = (newChecked: boolean) => {
    if (readOnly) return;
    
    setChecked(newChecked);
    
    // Validate if required
    if (required && !newChecked) {
      setError('This field is required');
    } else {
      setError(null);
    }
  };

  return (
    <div className={cn('space-y-2', classes)} {...filterDOMProps(restProps)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          name={name}
          checked={checked}
          onCheckedChange={handleCheckedChange}
          disabled={disabled || readOnly}
          required={required}
          className={cn(
            error && 'border-destructive',
            readOnly && 'cursor-default'
          )}
        />
        {label && (
          <Label
            htmlFor={name}
            className={cn(
              'cursor-pointer',
              required && 'after:content-["*"] after:ml-0.5 after:text-destructive',
              (disabled || readOnly) && 'cursor-default opacity-50'
            )}
          >
            {label}
          </Label>
        )}
      </div>
      {helperText && !error && (
        <p className="text-sm text-muted-foreground pl-6">{helperText}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive pl-6">{error}</p>
      )}
    </div>
  );
};

CheckboxField.displayName = 'CheckboxField';

export default CheckboxField;

