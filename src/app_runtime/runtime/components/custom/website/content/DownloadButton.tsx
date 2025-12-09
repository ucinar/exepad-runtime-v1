import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer'; // Assuming this path

// Assuming shadcn/ui paths
import { Button } from "@/runtime/components/ui/button";
import { DownloadCloud } from "lucide-react";

// Assuming interfaces are imported from their respective files in your project.
import { DownloadButtonProps } from '@/interfaces/components/website/content/content';


/**
 * Renders a specialized button for initiating a file download.
 * This component is SSR-compatible.
 */
export const DownloadButton = ({
  url,
  text,
  fileName,
  variant = 'default',
  icon,
  fileType,
  fileSize,
  onDownload, // This prop would be handled by the DynamicRenderer's event mapping
  classes,
}: DownloadButtonProps) => {

  // Use a default download icon if no specific icon is provided
  const finalIcon = icon || {
    uuid: 'default-download-icon',
    componentType: 'IconProps',
    name: 'DownloadCloud',
  };

  return (
    <div className={cn("inline-flex flex-col items-start", classes)}>
      <Button asChild variant={variant} size="lg" className="w-full md:w-auto">
        <Link
          href={url}
          download={fileName}
          aria-label={`Download ${text}`}
        >
          <div className="flex items-center">
            <DynamicRenderer component={finalIcon} />
            <span className="ml-2">{text}</span>
          </div>
        </Link>
      </Button>
      {(fileType || fileSize) && (
        <div className="mt-2 text-xs text-muted-foreground">
          {fileType && <span>{fileType}</span>}
          {fileType && fileSize && <span className="mx-1">&middot;</span>}
          {fileSize && <span>{fileSize}</span>}
        </div>
      )}
    </div>
  );
};
