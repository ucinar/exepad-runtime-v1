// components/website/SeoMeta.tsx
"use client";

import React from 'react';
import Head from 'next/head';
import { SeoMetaProps } from '@/interfaces/components/website/utils'; // Adjust path

/**
 * A non-visual component that sets crucial SEO meta tags for a page,
 * including title, description, and Open Graph data for social sharing.
 * It renders its output directly into the document's <head>.
 */
export const SeoMeta: React.FC<SeoMetaProps> = ({
  title,
  pageDescription,
  keywords,
  ogTitle,
  ogDescription,
  ogImageUrl,
  canonicalUrl,
}) => {
  // This component does not render any visible UI.
  // It uses Next.js's Head component to inject tags into the <head> of the page.
  return (
    <Head>
      {/* Standard SEO Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={pageDescription} />
      {keywords && Array.isArray(keywords) && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      {/* Open Graph / Facebook Meta Tags */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      
      {/* Twitter Card Meta Tags (can mirror Open Graph) */}
      {ogTitle && <meta name="twitter:title" content={ogTitle} />}
      {ogDescription && <meta name="twitter:description" content={ogDescription} />}
      {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
      <meta name="twitter:card" content="summary_large_image" />

      {/* Canonical URL to prevent duplicate content issues */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Head>
  );
};

export default SeoMeta;
