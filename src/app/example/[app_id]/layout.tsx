/**
 * Example Route Layout
 * Minimal layout wrapper for example apps - does NOT fetch data
 * All data fetching is handled by page components
 */

import { ReactNode } from 'react';
import SimpleLayout from '@/app/_shared/components/SimpleLayout';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{
    app_id: string;
  }>;
}

/**
 * Simple layout for example routes
 * No data fetching - just provides basic structure
 * Pages are responsible for fetching configs and rendering headers/footers
 */
export default async function ExampleAppIdLayout({ children }: LayoutProps) {
  return <SimpleLayout>{children}</SimpleLayout>;
}

