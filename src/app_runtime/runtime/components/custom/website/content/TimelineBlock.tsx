"use client";

import * as React from 'react';
import { cn } from '@/lib/utils'; // Assuming a utility for class names

// Assuming interfaces are imported from their respective files in your project.
import { 
    TimelineBlockProps,
    TimelineEventProps 
} from '@/interfaces/components/website/content/content';

// Import the atomic TimelineEvent component you created earlier
import { TimelineEvent } from './TimelineEvent'; // Adjust path as needed


/**
 * Renders a sequence of timeline events, arranged either vertically or horizontally,
 * with optional connector lines and an alternating layout for vertical mode.
 */
export const TimelineBlock = ({
  content: events,
  orientation,
  alternating = false, // Default to false for a standard vertical layout
  classes,
}: TimelineBlockProps) => {

  // --- Horizontal Orientation ---
  if (orientation === 'horizontal') {
    // Horizontal layout is not typically used for this kind of detailed timeline event.
    // A simple flex layout is provided as a fallback.
    return (
        <div className={cn("flex items-start justify-center p-4 space-x-8", classes)}>
            {events.map((event: TimelineEventProps) => (
                <div key={event.uuid} className="w-80 flex-shrink-0">
                    <TimelineEvent {...event} />
                </div>
            ))}
        </div>
    );
  }

  // --- Vertical Orientation ---
  return (
    <div className={cn("relative", classes)}>
      {/* The main vertical connector line that runs down the center or side */}
      <div className={cn(
        "absolute top-0 h-full w-0.5 bg-gray-200",
        alternating ? "left-1/2 -translate-x-1/2" : "left-5 -translate-x-1/2"
      )} />

      <div className="space-y-16">
        {events.map((event: TimelineEventProps, index: number) => {
          const isEven = index % 2 === 0;
          
          if (alternating) {
            // Alternating (zigzag) layout
            return (
              <div key={event.uuid} className="relative w-full">
                <div className={cn(
                  "w-1/2",
                  isEven ? "pr-8" : "ml-auto pl-8 text-right"
                )}>
                  <TimelineEvent {...event} />
                </div>
              </div>
            );
          } else {
            // Standard vertical layout (all on one side)
            return (
              <div key={event.uuid} className="pl-12">
                <TimelineEvent {...event} />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};
