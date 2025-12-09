// components/form/SignatureField.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Label } from '@/runtime/components/ui/label';
import { Button } from '@/runtime/components/ui/button';
import { SignatureFieldProps } from '@/interfaces/components/common/forms/forms';

/**
 * A data-driven SignatureField component for capturing digital signatures.
 * Uses HTML5 canvas for drawing.
 */
export const SignatureField: React.FC<SignatureFieldProps> = ({
  name,
  label,
  helperText,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  clearButtonText = 'Clear',
  promptText = 'Sign here',
  classes,
  componentType,
  uuid,
  visibilityCondition,
  validationRules,
  ...restProps
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Set drawing styles
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || readOnly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    setError(null);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || readOnly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);

    if (required) {
      setError('Signature is required');
    }
  };

  return (
    <div className={cn('space-y-2', classes)} {...filterDOMProps(restProps)}>
      {label && (
        <Label className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
          {label}
        </Label>
      )}
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={cn(
            'w-full h-[200px] border-2 border-input rounded-md bg-background cursor-crosshair',
            (disabled || readOnly) && 'cursor-not-allowed opacity-50',
            error && 'border-destructive'
          )}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-muted-foreground">{promptText}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {helperText && !error && (
            <p className="text-sm text-muted-foreground">{helperText}</p>
          )}
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
        </div>
        {hasSignature && !disabled && !readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
          >
            {clearButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};

SignatureField.displayName = 'SignatureField';

export default SignatureField;

