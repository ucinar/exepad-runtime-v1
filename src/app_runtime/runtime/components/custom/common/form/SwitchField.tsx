// components/form/SwitchField.tsx
"use client";

import React, { useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Switch } from '@/runtime/components/ui/switch';
import { Label } from '@/runtime/components/ui/label';
import { SwitchFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven SwitchField component for toggle switches.
 * A modern alternative to checkboxes for binary on/off states.
 */
export const SwitchField: React.FC<SwitchFieldProps> = ({
  name,
  label,
  helperText,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  onLabel,
  offLabel,
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
      setError('This field must be enabled');
    } else {
      setError(null);
    }
  };

  return (
    <div className={cn('space-y-2', classes)} {...filterDOMProps(restProps)}>
      <div className="flex items-center justify-between space-x-2">
        <div className="flex-1">
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
          {helperText && !error && (
            <p className="text-sm text-muted-foreground mt-1">{helperText}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {offLabel && !checked && (
            <span className="text-sm text-muted-foreground">{offLabel}</span>
          )}
          <Switch
            id={name}
            name={name}
            checked={checked}
            onCheckedChange={handleCheckedChange}
            disabled={disabled || readOnly}
            className={cn(
              error && 'border-destructive',
              readOnly && 'cursor-default'
            )}
          />
          {onLabel && checked && (
            <span className="text-sm text-muted-foreground">{onLabel}</span>
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};

SwitchField.displayName = 'SwitchField';

export default SwitchField;

