import React from 'react';

// Import types from interface files
import type { DocumentEmbedProps, DocumentType } from '@/interfaces/components/common/media/media'; // Adjust path as needed

/**
 * A component for embedding various document types using an iframe.
 * For many document types, it leverages a public viewer service to ensure compatibility.
 *
 * @param {DocumentEmbedProps} props - The properties for the DocumentEmbed component.
 */
export const DocumentEmbed = ({
  src,
  type,
  width = '100%',
  height = '600px',
  title,
  showToolbar, // Note: Toolbar visibility is often controlled by the viewer service.
  allowFullscreen = true,
  fallbackText = 'This browser does not support embedding this document type.',
  classes,
  uuid,
}: DocumentEmbedProps) => {
  /**
   * Constructs the appropriate URL for the iframe source.
   * For many common document types, it uses the Google Docs Viewer service.
   * @param docSrc - The original source URL of the document.
   * @param docType - The type of the document.
   * @returns The URL to be used in the iframe.
   */
  const getEmbedUrl = (docSrc: string, docType: DocumentType): string => {
    const encodedSrc = encodeURIComponent(docSrc);
    
    // For these types, a viewer service is generally required for in-browser viewing.
    const viewerNeededTypes: DocumentType[] = [
      'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'rtf'
    ];

    if (viewerNeededTypes.includes(docType) || docType === 'pdf') {
      // Google Docs Viewer is a reliable option for embedding these file types.
      // The `embedded=true` parameter provides a cleaner viewing experience.
      return `https://docs.google.com/gview?url=${encodedSrc}&embedded=true`;
    }
    
    // For types like 'html', 'txt', or 'generic', we embed the source directly.
    return docSrc;
  };

  let effectiveType = type;
  // If type is 'auto', attempt to infer it from the file extension.
  if (type === 'auto') {
    try {
      const url = new URL(src);
      const extension = url.pathname.split('.').pop()?.toLowerCase() || '';
      effectiveType = extension as DocumentType; // Cast, assuming extension matches a DocumentType
    } catch (error) {
      console.error(`Invalid URL provided to DocumentEmbed with uuid "${uuid}":`, src);
      effectiveType = 'generic';
    }
  }

  const embedUrl = getEmbedUrl(src, effectiveType);

  return (
    <div
      className={`document-embed-container bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg overflow-hidden ${classes || ''}`}
      style={{ width, height }}
    >
      <iframe
        src={embedUrl}
        title={title}
        width="100%"
        height="100%"
        allowFullScreen={allowFullscreen}
        frameBorder="0"
        aria-label={title}
        // The 'sandbox' attribute can increase security but may break some viewers.
        // sandbox="allow-scripts allow-same-origin"
      >
        <p>{fallbackText}</p>
      </iframe>
    </div>
  );
};

export default DocumentEmbed;
