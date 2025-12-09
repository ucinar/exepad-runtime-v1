// components/form/ColorPickerField.tsx
"use client";

import React, { useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Label } from '@/runtime/components/ui/label';
import { Input } from '@/runtime/components/ui/input';
import { ColorPickerFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven ColorPickerField component for color selection.
 * Uses native HTML5 color picker.
 */
export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
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
  const [color, setColor] = useState<string>(
    (defaultValue as string) || '#000000'
  );
  const [error, setError] = useState<string | null>(null);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    
    if (required && !newColor) {
      setError('Please select a color');
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
      <div className="flex items-center space-x-2">
        <input
          id={name}
          name={name}
          type="color"
          value={color}
          onChange={handleColorChange}
          disabled={disabled || readOnly}
          required={required}
          className={cn(
            'h-10 w-20 rounded-md border border-input cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
            readOnly && 'cursor-default'
          )}
        />
        <Input
          type="text"
          value={color}
          onChange={handleColorChange}
          disabled={disabled || readOnly}
          readOnly={readOnly}
          placeholder="#000000"
          className={cn(
            'flex-1',
            error && 'border-destructive focus-visible:ring-destructive',
            readOnly && 'bg-muted'
          )}
        />
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

ColorPickerField.displayName = 'ColorPickerField';

export default ColorPickerField;

