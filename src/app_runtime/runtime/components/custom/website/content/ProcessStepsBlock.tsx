"use client";

import * as React from 'react';
import { cn } from '@/lib/utils'; // Assuming a utility for class names

// Assuming interfaces are imported from their respective files in your project
import { 
    ProcessStepsBlockProps,
    ProcessStepItemProps 
} from '@/interfaces/components/website/content/content';

// Import the atomic ProcessStepItem component you created earlier
import { ProcessStepItem } from './ProcessStepItem'; // Adjust path as needed


/**
 * Renders a sequence of process steps, arranged either vertically or horizontally,
 * with optional connector lines to visualize the flow.
 */
export const ProcessStepsBlock = ({
  content,
  orientation,
  showConnectors = true,
  classes,
}: ProcessStepsBlockProps) => {
  // Add validation to prevent undefined errors
  const steps = content || [];

  if (orientation === 'horizontal') {
    return (
      <div className={cn("flex items-start justify-between", classes)}>
        {steps.map((step, index) => (
          <React.Fragment key={step.uuid}>
            {/* Container for the step item itself */}
            <div className="flex flex-col items-center text-center w-64">
              <ProcessStepItem {...step} />
            </div>

            {/* Render a connector line between items, but not after the last one */}
            {showConnectors && index < steps.length - 1 && (
              <div className="flex-grow h-px bg-gray-300 border-t-2 border-dashed border-gray-300 mt-10 mx-4" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // --- Vertical Orientation ---
  return (
    <div className={cn("flex flex-col", classes)}>
      {steps.map((step, index) => (
        <div key={step.uuid} className="relative flex">
          {/* The connector line container */}
          {showConnectors && (
            <div className="flex flex-col items-center mr-6">
              {/* This empty div aligns with the step number, if it exists */}
              <div className="w-8 h-8" /> 
              {/* The vertical line, hidden for the last item */}
              {index < steps.length - 1 && (
                <div className="h-full w-0.5 bg-gray-200 mt-1" />
              )}
            </div>
          )}
          
          {/* The ProcessStepItem itself */}
          <div className="flex-grow pb-12">
            <ProcessStepItem {...step} />
          </div>
        </div>
      ))}
    </div>
  );
};
