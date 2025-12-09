// components/website/LanguageSelector.tsx
"use client";

import * as React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assuming a utility for class names

// Assuming shadcn/ui and lucide-react are installed
import { Button } from "@/runtime/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/runtime/components/ui/dropdown-menu";
import { Languages, Check } from 'lucide-react';

// Assuming interfaces are in this path
import { LanguageSelectorProps, LanguageSelectorOption } from '@/interfaces/components/website/utils';
import { ImageProps } from '@/interfaces/components/common/core';

// Helper component to render a flag image
const FlagImage: React.FC<{ flag?: ImageProps; alt: string }> = ({ flag, alt }) => {
  if (!flag?.src) return null;
  return (
    <img
      src={flag.src}
      alt={alt}
      width={20}
      height={15}
      className="rounded-sm object-cover mr-2"
    />
  );
};

/**
 * A UI component that allows users to switch the application's language,
 * typically rendered in a site header or footer.
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  options,
  currentLanguageCode,
  onChangeAction, // This would be a string identifier for an event handler
  classes,
  ...restProps
}) => {
  // Find the full object for the currently selected language
  const currentOption = options.find(opt => opt.code === currentLanguageCode) || options[0];

  const handleLanguageChange = (languageCode: string) => {
    // In a real application, this would trigger the event handler
    // mapped from the `onChangeAction` string.
    console.log(`Language change requested to: ${languageCode}`);
    console.log(`Action to be triggered: ${onChangeAction}`);
    // Example of what might happen:
    // getEventHandler(onChangeAction)(languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("flex items-center", classes)} {...filterDOMProps(restProps)}>
          {currentOption?.flag ? (
            <FlagImage flag={currentOption.flag} alt={currentOption.name} />
          ) : (
            <Languages className="h-4 w-4 mr-2" />
          )}
          <span>{currentOption?.name || currentLanguageCode}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onSelect={() => handleLanguageChange(option.code)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <FlagImage flag={option.flag} alt={option.name} />
              <span>{option.name}</span>
            </div>
            {currentLanguageCode === option.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
