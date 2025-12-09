"use client";

import * as React from 'react';
import { cn } from '@/lib/utils'; // Assuming a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer'; // Assuming this is the correct path

// Assuming interfaces are imported from their respective files in your project
import { ProcessStepItemProps } from '@/interfaces/components/website/content/content';
import { IconProps } from '@/interfaces/components/common/core';


/**
 * Renders a single step in a process, displaying an icon, an optional step
 * number, a title, and a description. This component is designed to be
 * composed within a layout component like Flex or Grid.
 */
export const ProcessStepItem = ({
  icon,
  title,
  text,
  number,
  classes,
}: ProcessStepItemProps) => {
  return (
    <div className={cn("relative flex items-start gap-6", classes)}>
      {/* Container for the step number and icon */}
      <div className="flex flex-col items-center flex-shrink-0">
        {number && (
          <div className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold text-sm z-10 mb-2 ring-4 ring-background">
            {number}
          </div>
        )}
        
        {/* The icon prop is a full component configuration object.
            We pass it directly to the DynamicRenderer to handle its rendering. */}
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
            <DynamicRenderer component={icon} />
        </div>
      </div>

      {/* Container for the text content */}
      <div className="flex-grow pt-1">
        <DynamicRenderer component={{ ...title, classes: cn("text-lg font-semibold text-gray-900", title.classes) }} />
        <div className="mt-1 text-gray-600">
          <DynamicRenderer component={text} />
        </div>
      </div>
    </div>
  );
};
