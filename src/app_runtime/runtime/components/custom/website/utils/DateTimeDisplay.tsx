// components/website/DateTimeDisplay.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { cn, filterDOMProps } from '@/lib/utils';
import { DateTimeDisplayProps } from '@/interfaces/components/website/utils'; // Adjust path

/**
 * Displays a formatted date and time, with options for relative time
 * (e.g., "2 hours ago") and automatic updates.
 */
export const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  value,
  format: formatStr = 'PPpp', // A good default format like 'Jul 15, 2025, 10:16:00 PM'
  relative = false,
  autoUpdate = false,
  timezone,
  classes,
  ...restProps
}) => {
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    const updateDisplayTime = () => {
      try {
        const date = parseISO(value);

        if (relative) {
          setDisplayTime(formatDistanceToNow(date, { addSuffix: true }));
        } else if (timezone) {
          setDisplayTime(formatInTimeZone(date, timezone, formatStr));
        } else {
          setDisplayTime(format(date, formatStr));
        }
      } catch (error) {
        console.error(`[DateTimeDisplay] Invalid date value provided: ${value}`, error);
        setDisplayTime('Invalid date');
      }
    };

    updateDisplayTime();

    // If autoUpdate is enabled for relative time, set up an interval to refresh it.
    if (relative && autoUpdate) {
      // Update every 30 seconds for efficiency.
      interval = setInterval(updateDisplayTime, 30000);
    }

    // Cleanup the interval when the component unmounts or props change.
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [value, formatStr, relative, autoUpdate, timezone]);

  return (
    <time
      dateTime={value}
      className={cn('text-sm text-gray-600', classes)}
      {...filterDOMProps(restProps)}
    >
      {displayTime}
    </time>
  );
};

export default DateTimeDisplay;
