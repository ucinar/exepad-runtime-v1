/**
 * Demo Route Layout
 * Minimal layout wrapper - does NOT fetch data
 * All data fetching is handled by page components
 */

import { ReactNode } from 'react';
import SimpleLayout from '@/app/_shared/components/SimpleLayout';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ app_id: string }>;
}

/**
 * Simple layout for demo routes
 * No data fetching - just provides basic structure
 * Pages are responsible for fetching configs and rendering content
 */
export default async function DemoAppIdLayout({ children }: LayoutProps) {
  return <SimpleLayout>{children}</SimpleLayout>;
}