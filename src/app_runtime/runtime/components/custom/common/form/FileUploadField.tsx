// components/form/FileUploadField.tsx
"use client";

import React, { useState, useRef } from 'react';
import { cn, filterDOMProps } from '@/lib/utils';
import { Label } from '@/runtime/components/ui/label';
import { Button } from '@/runtime/components/ui/button';
import { FileUploadFieldProps } from '@/interfaces/components/common/forms/forms';
import { Upload, X, File } from 'lucide-react';

/**
 * A data-driven FileUploadField component for file uploads.
 * Supports single/multiple file selection with size validation.
 */
export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  name,
  label,
  helperText,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  accept,
  isMulti = false,
  maxFileSizeMB = 10,
  classes,
  componentType,
  uuid,
  visibilityCondition,
  validationRules,
  ...restProps
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file sizes
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSizeBytes);
    
    if (oversizedFiles.length > 0) {
      setError(`Files must be smaller than ${maxFileSizeMB}MB`);
      return;
    }
    
    if (required && selectedFiles.length === 0) {
      setError('Please select at least one file');
    } else {
      setError(null);
    }
    
    setFiles(selectedFiles);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    if (required && newFiles.length === 0) {
      setError('Please select at least one file');
    }
    
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-2', classes)} {...filterDOMProps(restProps)}>
      {label && (
        <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
          {label}
        </Label>
      )}
      
      <div className="space-y-2">
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="file"
          accept={accept}
          multiple={isMulti}
          onChange={handleFileChange}
          disabled={disabled || readOnly}
          required={required}
          className="sr-only"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={disabled || readOnly}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {files.length > 0 ? `${files.length} file(s) selected` : 'Choose file(s)'}
        </Button>
        
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <File className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-muted-foreground flex-shrink-0">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                {!readOnly && !disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 flex-shrink-0"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">
          {helperText} {maxFileSizeMB && `(Max size: ${maxFileSizeMB}MB)`}
        </p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};

FileUploadField.displayName = 'FileUploadField';

export default FileUploadField;

