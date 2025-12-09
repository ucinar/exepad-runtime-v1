// components/form/RatingField.tsx
"use client";

import React, { useState } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Label } from '@/runtime/components/ui/label';
import { RatingFieldProps } from '@/interfaces/components/common/forms/forms';
import { Star, Heart } from 'lucide-react';

/**
 * A data-driven RatingField component for star/heart ratings.
 */
export const RatingField: React.FC<RatingFieldProps> = ({
  name,
  label,
  helperText,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  count = 5,
  icon = 'star',
  allowHalf = false,
  classes,
  componentType,
  uuid,
  visibilityCondition,
  validationRules,
  ...restProps
}) => {
  const initialValue = typeof defaultValue === 'number' ? defaultValue : 0;
  const [rating, setRating] = useState<number>(initialValue);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const IconComponent = icon === 'heart' ? Heart : Star;

  const handleClick = (value: number) => {
    if (disabled || readOnly) return;
    
    setRating(value);
    
    if (required && value === 0) {
      setError('Please provide a rating');
    } else {
      setError(null);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!disabled && !readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const renderIcon = (index: number) => {
    const value = index + 1;
    const currentRating = hoverRating || rating;
    
    let fillPercent = 0;
    if (currentRating >= value) {
      fillPercent = 100;
    } else if (allowHalf && currentRating >= value - 0.5) {
      fillPercent = 50;
    }
    
    const isFilled = fillPercent === 100;
    const isHalfFilled = fillPercent === 50;

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleClick(value)}
        onMouseEnter={() => handleMouseEnter(value)}
        onMouseLeave={handleMouseLeave}
        disabled={disabled || readOnly}
        className={cn(
          'relative transition-all',
          (disabled || readOnly) ? 'cursor-default' : 'cursor-pointer hover:scale-110'
        )}
      >
        {/* Background icon */}
        <IconComponent
          className={cn(
            'h-8 w-8',
            isFilled || isHalfFilled
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-transparent text-gray-300'
          )}
        />
        {/* Half-fill overlay for half stars */}
        {isHalfFilled && (
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <IconComponent className="h-8 w-8 fill-yellow-400 text-yellow-400" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={cn('space-y-2', classes)} {...filterDOMProps(restProps)}>
      {label && (
        <Label className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
          {label}
        </Label>
      )}
      <div className="flex items-center space-x-1">
        {Array.from({ length: count }, (_, i) => renderIcon(i))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {rating} / {count}
          </span>
        )}
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

RatingField.displayName = 'RatingField';

export default RatingField;

