"use client";

import * as React from 'react';
import { cn } from '@/lib/utils'; // Assuming a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer'; // Assuming this path

// Interfaces like TimelineEventProps, IconProps, etc., are assumed to be
// imported from their respective definition files in your project.
import { TimelineEventProps } from '@/interfaces/components/website/content/content';


/**
 * Renders a single event for a timeline, displaying a date, title,
 * description, icon, and associated media.
 */
export const TimelineEvent = ({
  date,
  title,
  text,
  icon,
  media,
  classes,
}: TimelineEventProps) => {
  return (
    <div className={cn("relative flex items-start gap-x-6", classes)}>
      {/* Icon and vertical line */}
      <div className="relative flex h-full flex-col items-center">
        <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <DynamicRenderer component={icon} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow pt-1">
        <p className="text-sm font-semibold text-gray-500">{date}</p>
        <div className="mt-1">
          <DynamicRenderer component={{ ...title, classes: cn("text-lg font-bold text-gray-900", title.classes) }} />
        </div>
        <div className="mt-2 text-base text-gray-600">
          <DynamicRenderer component={text} />
        </div>
        
        {/* Media (Image) */}
        <div className="mt-4 overflow-hidden rounded-lg border">
          <DynamicRenderer component={media} />
        </div>
      </div>
    </div>
  );
};
