// components/form/TextAreaField.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Textarea } from '@/runtime/components/ui/textarea';
import { Label } from '@/runtime/components/ui/label';
import { TextAreaFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven TextAreaField component for multi-line text inputs.
 * Supports validation, character limits, and helper text.
 */
export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  name,
  label,
  placeholder,
  helperText,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  validationRules,
  rows = 4,
  minLength,
  maxLength,
  classes,
  componentType,
  uuid,
  visibilityCondition,
  ...restProps
}) => {
  // Convert defaultValue to string for text area fields
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
      }
    }
    setError(null);
    return true;
  }, [validationRules]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        rows={rows}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive',
          readOnly && 'bg-muted cursor-default'
        )}
      />
      {maxLength && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{helperText}</span>
          <span>{value.length}/{maxLength}</span>
        </div>
      )}
      {!maxLength && helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};

TextAreaField.displayName = 'TextAreaField';

export default TextAreaField;

