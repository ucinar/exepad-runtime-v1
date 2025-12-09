"use client";

import * as React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils'; // Assuming a utility for class names

// Assuming this interface is in your project, adjust path as needed
import { 
    StatsCounterProps,
} from '@/interfaces/components/website/content/content';
import { ComponentProps } from '@/interfaces/components/common/core';


/**
 * A component that displays a number which animates from a start to an end value
 * when it becomes visible in the viewport.
 */
export const StatsCounter = ({
  start,
  end,
  duration,
  label,
  prefix = '',
  suffix = '',
  classes, // from ComponentProps
}: StatsCounterProps) => {

    const { ref, inView } = useInView({
        triggerOnce: true, // Ensures the animation runs only once
        threshold: 0.5,    // Starts animation when 50% of the component is visible
    });

    return (
        <div ref={ref} className={cn("text-center p-4", classes)}>
            <div className="text-4xl md:text-5xl font-bold text-gray-900">
                <CountUp
                    start={inView ? start : end} // Start counting when in view
                    end={end}
                    duration={duration / 1000} // Convert ms to seconds for react-countup
                    separator=","
                    prefix={prefix}
                    suffix={suffix}
                    useEasing={true}
                />
            </div>
            <p className="text-sm md:text-base font-medium text-gray-500 mt-2">
                {label}
            </p>
        </div>
    );
};
