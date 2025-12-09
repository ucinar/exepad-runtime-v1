// components/form/RadioGroupField.tsx
"use client";

import React, { useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Label } from '@/runtime/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/runtime/components/ui/radio-group';
import { RadioGroupFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven RadioGroupField component for selecting a single option from a list.
 */
export const RadioGroupField: React.FC<RadioGroupFieldProps> = ({
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
  const [value, setValue] = useState<string>(
    defaultValue ? String(defaultValue) : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleValueChange = (newValue: string) => {
    if (readOnly) return;
    
    setValue(newValue);
    
    // Validate if required
    if (required && !newValue) {
      setError('Please select an option');
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
      <RadioGroup
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled || readOnly}
        className={cn(
          'space-y-2',
          orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0'
        )}
      >
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          
          return (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                id={optionId}
                value={String(option.value)}
                disabled={option.disabled}
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
      </RadioGroup>
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};

RadioGroupField.displayName = 'RadioGroupField';

export default RadioGroupField;

