// components/form/SelectField.tsx
"use client";

import React, { useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Label } from '@/runtime/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/runtime/components/ui/select';
import { SelectFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven SelectField component for dropdown selections.
 * Currently supports single selection (multi-select would need additional UI library).
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  placeholder,
  helperText,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  options,
  isMulti = false,
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
    setValue(newValue);
    
    // Validate if required
    if (required && !newValue) {
      setError('This field is required');
    } else {
      setError(null);
    }
  };

  // Note: Multi-select would require a different component like a Combobox or Multi-Select
  if (isMulti) {
    console.warn('Multi-select is not yet implemented for SelectField');
  }

  return (
    <div className={cn('space-y-2', classes)} {...filterDOMProps(restProps)}>
      {label && (
        <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
          {label}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled || readOnly}
        required={required}
      >
        <SelectTrigger
          id={name}
          className={cn(
            error && 'border-destructive focus:ring-destructive',
            readOnly && 'bg-muted cursor-default'
          )}
        >
          <SelectValue placeholder={placeholder || 'Select an option...'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};

SelectField.displayName = 'SelectField';

export default SelectField;

