// components/form/SliderField.tsx
"use client";

import React, { useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Slider } from '@/runtime/components/ui/slider';
import { Label } from '@/runtime/components/ui/label';
import { SliderFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven SliderField component for selecting numeric values.
 */
export const SliderField: React.FC<SliderFieldProps> = ({
  name,
  label,
  helperText,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  min,
  max,
  step = 1,
  classes,
  componentType,
  uuid,
  visibilityCondition,
  validationRules,
  ...restProps
}) => {
  const initialValue = typeof defaultValue === 'number' ? defaultValue : min;
  const [value, setValue] = useState<number[]>([initialValue]);

  const handleValueChange = (newValue: number[]) => {
    if (!readOnly) {
      setValue(newValue);
    }
  };

  return (
    <div className={cn('space-y-2', classes)} {...filterDOMProps(restProps)}>
      <div className="flex items-center justify-between">
        {label && (
          <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
            {label}
          </Label>
        )}
        <span className="text-sm font-medium text-muted-foreground">
          {value[0]}
        </span>
      </div>
      <Slider
        id={name}
        name={name}
        value={value}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled || readOnly}
        className={cn('py-4', readOnly && 'cursor-default')}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};

SliderField.displayName = 'SliderField';

export default SliderField;

