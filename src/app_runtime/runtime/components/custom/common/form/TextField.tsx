// components/form/TextField.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Input } from '@/runtime/components/ui/input';
import { Label } from '@/runtime/components/ui/label';
import { TextFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven TextField component for single-line text inputs.
 * Supports various input types, validation, and helper text.
 */
export const TextField: React.FC<TextFieldProps> = ({
  name,
  label,
  placeholder,
  helperText,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  validationRules,
  inputType = 'text',
  minLength,
  maxLength,
  classes,
  componentType,
  uuid,
  visibilityCondition,
  ...restProps
}) => {
  // Convert defaultValue to string for text fields
  const initialValue = defaultValue != null ? String(defaultValue) : '';
  const [value, setValue] = useState<string>(initialValue);
  const [error, setError] = useState<string | null>(null);

  // Validate the field value
  const validateField = useCallback((val: string) => {
    if (!validationRules) return true;

    for (const rule of validationRules) {
      switch (rule.type) {
        case 'required':
          if (!val || val.trim() === '') {
            setError(rule.errorMessage);
            return false;
          }
          break;
        case 'minLength':
          if (val.length < (rule.value as number)) {
            setError(rule.errorMessage);
            return false;
          }
          break;
        case 'maxLength':
          if (val.length > (rule.value as number)) {
            setError(rule.errorMessage);
            return false;
          }
          break;
        case 'pattern':
          const regex = new RegExp(rule.value as string);
          if (!regex.test(val)) {
            setError(rule.errorMessage);
            return false;
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            setError(rule.errorMessage);
            return false;
          }
          break;
      }
    }
    setError(null);
    return true;
  }, [validationRules]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    validateField(newValue);
  };

  const handleBlur = () => {
    validateField(value);
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
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
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

TextField.displayName = 'TextField';

export default TextField;

