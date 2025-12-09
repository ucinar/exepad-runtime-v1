// components/website/ShareButton.tsx
"use client";

import * as React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assuming a utility for class names

// Assuming shadcn/ui and lucide-react are installed
import { Button } from "@/runtime/components/ui/button";
import { Twitter, Facebook, Linkedin, Mail, Link2 } from 'lucide-react';

// Assuming interfaces are in this path
import { ShareButtonProps } from '@/interfaces/components/website/utils';
import { IconProps } from '@/interfaces/components/common/core';

// A mapping of platforms to their respective icons and share URLs
const platformConfig = {
  twitter: {
    icon: <Twitter className="h-4 w-4" />,
    url: 'https://twitter.com/intent/tweet?',
  },
  facebook: {
    icon: <Facebook className="h-4 w-4" />,
    url: 'https://www.facebook.com/sharer/sharer.php?',
  },
  linkedin: {
    icon: <Linkedin className="h-4 w-4" />,
    url: 'https://www.linkedin.com/shareArticle?',
  },
  email: {
    icon: <Mail className="h-4 w-4" />,
    url: 'mailto:?',
  },
};

/**
 * A button that allows users to share a URL to various social platforms.
 */
export const ShareButton: React.FC<ShareButtonProps> = ({
  platform,
  url,
  text,
  icon, // This prop is available but the component uses default icons for now.
  classes,
  ...restProps
}) => {
  const config = platformConfig[platform];

  const handleShareClick = () => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = text ? encodeURIComponent(text) : '';
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `${config.url}url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `${config.url}u=${encodedUrl}`;
        break;
      case 'linkedin':
        // LinkedIn requires the full URL for the mini parameter
        shareUrl = `${config.url}mini=true&url=${encodedUrl}&title=${encodedText}`;
        break;
      case 'email':
        shareUrl = `${config.url}subject=${encodedText}&body=${encodedUrl}`;
        break;
      default:
        console.error(`Unsupported share platform: ${platform}`);
        return;
    }
    
    // Open the share dialog in a new popup window
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  if (!config) {
    console.warn(`[ShareButton] No configuration found for platform: ${platform}`);
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleShareClick}
      aria-label={`Share on ${platform}`}
      className={cn(classes)}
      {...filterDOMProps(restProps)}
    >
      {/* If a custom icon is provided in the JSON, it would be rendered here.
          Otherwise, we use the default icon for the platform. */}
      {icon ? <DynamicRenderer component={icon} /> : config.icon}
    </Button>
  );
};

// A hypothetical DynamicRenderer for the custom icon prop
const DynamicRenderer: React.FC<{ component: IconProps }> = ({ component }) => {
    // This is a placeholder. A real implementation would dynamically render the icon
    // based on the component data, similar to the main DynamicRenderer.
    return <Link2 className="h-4 w-4" />;
};


export default ShareButton;
