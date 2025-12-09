// components/form/DateTimeField.tsx
"use client";

import React, { useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Input } from '@/runtime/components/ui/input';
import { Label } from '@/runtime/components/ui/label';
import { DateTimeFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven DateTimeField component for date and time selection.
 * Uses native browser date/time pickers.
 */
export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  name,
  label,
  placeholder,
  helperText,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  pickerType = 'date',
  min,
  max,
  classes,
  componentType,
  uuid,
  visibilityCondition,
  validationRules,
  ...restProps
}) => {
  // Ensure value is always a string for the input element
  const [value, setValue] = useState(
    typeof defaultValue === 'string' || typeof defaultValue === 'number'
      ? String(defaultValue)
      : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Basic validation
    if (required && !newValue) {
      setError('This field is required');
    } else if (min && newValue < min) {
      setError(`Date must be after ${min}`);
    } else if (max && newValue > max) {
      setError(`Date must be before ${max}`);
    } else {
      setError(null);
    }
  };

  return (
    <div className={cn('space-y-2', classes)} {...filterDOMProps(restProps)}>
      {label && (
        <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
          {label}
        </Label>
      )}
      <Input
        id={name}
        name={name}
        type={pickerType}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        min={min}
        max={max}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive',
          readOnly && 'bg-muted cursor-default'
        )}
      />
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};

DateTimeField.displayName = 'DateTimeField';

export default DateTimeField;

