/**
 * Client Font Loader - Client Component
 * Loads fonts via link tags for client-side rendering
 * Uses shared font utilities for consistency
 */

'use client';

import { ThemeProps } from '@/interfaces/apps/core';
import { extractFontUrls } from '@/utils/fontUtils';

/**
 * Client-side font loader
 * Uses <link> tags to load fonts in client components
 */
export default function ClientFontLoader({ fonts }: { fonts?: ThemeProps['fonts'] }) {
  if (!fonts) {
    return null;
  }

  const fontUrls = extractFontUrls(fonts);

  if (fontUrls.length === 0) {
    return null;
  }

  return (
    <>
      {fontUrls.map((url) => (
        <link key={url} rel="stylesheet" href={url} />
      ))}
    </>
  );
}
