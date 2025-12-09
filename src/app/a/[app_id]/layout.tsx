/**
 * Production/Preview Route Layout
 * Minimal layout wrapper - does NOT fetch data
 * All data fetching is handled by page components (PublishedPage/PreviewPage)
 */

import { ReactNode } from 'react';
import SimpleLayout from '@/app/_shared/components/SimpleLayout';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ app_id: string }>;
}

/**
 * Simple layout for production and preview routes
 * No data fetching - just provides basic structure
 * Pages (PublishedPage/PreviewPage) are responsible for all rendering
 */
export default async function AppIdLayout({ children }: LayoutProps) {
  return <SimpleLayout>{children}</SimpleLayout>;
}

