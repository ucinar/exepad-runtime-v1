"use client";

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming a utility for class names

// Using lucide-react for icons, as is common with shadcn/ui
import { 
    Facebook, 
    Twitter, 
    Github, 
    Dribbble, 
    Linkedin, 
    Instagram,
    Link2 // A fallback icon
} from "lucide-react";

// Assuming the interface is imported from its definition file
import { SocialLinkProps } from '@/interfaces/components/website/content/content';


/**
 * A mapping from platform names (as strings) to their corresponding
 * icon components from the lucide-react library.
 * The keys are lowercased to ensure case-insensitive matching.
 */
const platformIconMap: { [key: string]: React.ElementType } = {
    facebook: Facebook,
    twitter: Twitter,
    github: Github,
    dribbble: Dribbble,
    linkedin: Linkedin,
    instagram: Instagram,
};


/**
 * Renders a single social media icon that links to the specified URL.
 */
export const SocialLink = ({
  platform,
  url,
  label,
  classes,
}: SocialLinkProps) => {

  // Select the appropriate icon component from the map, or use a fallback.
  const IconComponent = platformIconMap[platform.toLowerCase()] || Link2;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label || `Visit our ${platform} page`}
      className={cn(
        // Inherit color from parent so icons match surrounding link styles
        "text-current/80 hover:text-primary transition-colors duration-200",
        classes
      )}
    >
      <IconComponent className="w-6 h-6" />
    </Link>
  );
};
