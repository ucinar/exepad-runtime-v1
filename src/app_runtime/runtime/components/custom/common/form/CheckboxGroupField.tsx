// components/form/CheckboxGroupField.tsx
"use client";

import React, { useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Checkbox } from '@/runtime/components/ui/checkbox';
import { Label } from '@/runtime/components/ui/label';
import { CheckboxGroupFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven CheckboxGroupField component for selecting multiple options.
 */
export const CheckboxGroupField: React.FC<CheckboxGroupFieldProps> = ({
  name,
  label,
  helperText,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  options,
  orientation = 'vertical',
  classes,
  componentType,
  uuid,
  visibilityCondition,
  validationRules,
  ...restProps
}) => {
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
    Array.isArray(defaultValue) ? defaultValue : []
  );
  const [error, setError] = useState<string | null>(null);

  const handleCheckboxChange = (optionValue: string | number, checked: boolean) => {
    if (readOnly) return;

    let newValues: (string | number)[];
    if (checked) {
      newValues = [...selectedValues, optionValue];
    } else {
      newValues = selectedValues.filter((v) => v !== optionValue);
    }
    
    setSelectedValues(newValues);
    
    // Validate if required
    if (required && newValues.length === 0) {
      setError('Please select at least one option');
    } else {
      setError(null);
    }
  };

  return (
    <div className={cn('space-y-2', classes)} {...filterDOMProps(restProps)}>
      {label && (
        <Label className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
          {label}
        </Label>
      )}
      <div
        className={cn(
          'space-y-2',
          orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0'
        )}
      >
        {options.map((option) => {
          const isChecked = selectedValues.includes(option.value);
          const optionId = `${name}-${option.value}`;
          
          return (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={optionId}
                name={name}
                checked={isChecked}
                onCheckedChange={(checked) => handleCheckboxChange(option.value, checked as boolean)}
                disabled={disabled || readOnly || option.disabled}
                className={cn(
                  error && 'border-destructive',
                  readOnly && 'cursor-default'
                )}
              />
              <Label
                htmlFor={optionId}
                className={cn(
                  'cursor-pointer font-normal',
                  (disabled || readOnly || option.disabled) && 'cursor-default opacity-50'
                )}
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};

CheckboxGroupField.displayName = 'CheckboxGroupField';

export default CheckboxGroupField;

