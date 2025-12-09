/**
 * Dynamic Font Loader - Server Component
 * Fetches and inlines font CSS to prevent FOUC
 * Uses shared font utilities for consistency
 */

import { ThemeProps } from '@/interfaces/apps/core';
import { extractFontUrls, fetchFontCss } from '@/utils/fontUtils';

/**
 * Server-side async font loader
 * Fetches font stylesheets and inlines them to prevent Flash of Unstyled Text (FOUT)
 */
const DynamicFontLoader = async ({ fonts }: { fonts?: ThemeProps['fonts'] }) => {
  if (!fonts) {
    return null;
  }

  const fontUrls = extractFontUrls(fonts);

  if (fontUrls.length === 0) {
    return null;
  }

  // Fetch all font CSS in parallel
  const fontCssPromises = fontUrls.map(url => fetchFontCss(url));
  const fontCssArray = await Promise.all(fontCssPromises);
  const combinedFontCss = fontCssArray.join('\n');

  if (!combinedFontCss) {
    return null;
  }

  return <style dangerouslySetInnerHTML={{ __html: combinedFontCss }} />;
};

export default DynamicFontLoader;
