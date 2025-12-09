/**
 * Font Loading Utilities
 * Shared utilities for consistent font loading across server and client components
 */

import { ThemeProps } from '@/interfaces/apps/core';

/**
 * Generate CSS custom properties for fonts
 * Works for both server and client components
 */
export function generateFontVariables(fonts?: ThemeProps['fonts']): string | null {
  if (!fonts) return null;

  const variables: string[] = [];

  if (fonts.body?.family) {
    variables.push(`--font-sans: ${fonts.body.family};`);
  }

  if (fonts.heading?.family) {
    variables.push(`--font-heading: ${fonts.heading.family};`);
  }

  if (variables.length === 0) return null;

  return `
    :root {
      ${variables.join('\n      ')}
    }
  `.trim();
}

/**
 * Extract font URLs from theme fonts configuration
 */
export function extractFontUrls(fonts?: ThemeProps['fonts']): string[] {
  if (!fonts) return [];

  const urls: string[] = [];

  if (fonts.body?.url) urls.push(fonts.body.url);
  if (fonts.heading?.url && fonts.heading.url !== fonts.body?.url) {
    urls.push(fonts.heading.url);
  }

  return urls;
}

/**
 * Fetch font CSS from URL (server-side only)
 */
export async function fetchFontCss(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        // Mimic a browser user agent to get the correct font file format (woff2)
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch font CSS from ${url}: ${response.statusText}`);
      return '';
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching font CSS from ${url}:`, error);
    return '';
  }
}
