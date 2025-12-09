// components/feedback/CircularProgress.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import { ComponentProps } from '@/interfaces/components/common/core'; // Adjust path
import { CircularProgressProps } from '@/interfaces/components/common/feedback/feedback'; // Adjust path
// --- The CircularProgressProps Interface ---
// This is based on the interface you provided.


// --- The CircularProgress Component Implementation ---

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  thickness = 10,
  showValue = false,
  variant = 'default',
  classes,
  ...restProps
}) => {
  const [progress, setProgress] = useState(0);

  // Animate the progress value when the 'value' prop changes.
  useEffect(() => {
    // This creates a smooth transition from the old value to the new value.
    setProgress(value);
  }, [value]);

  // SVG and circle calculations
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? (progress / max) * 100 : 0;
  const offset = circumference - (percentage / 100) * circumference;

  // A map to get the appropriate color classes for the progress ring.
  const variantClasses: Record<string, string> = {
    default: 'text-primary',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-600',
  };

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", classes)}
      style={{ width: size, height: size }}
      {...filterDOMProps(restProps)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <circle
          className="text-muted/20"
          stroke="currentColor"
          strokeWidth={thickness}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className={cn("transition-all duration-500 ease-out", variantClasses[variant])}
          stroke="currentColor"
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>
      {showValue && (
        <span className="absolute text-xl font-bold" style={{ color: variantClasses[variant] }}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

CircularProgress.displayName = 'CircularProgress';

export default CircularProgress;
