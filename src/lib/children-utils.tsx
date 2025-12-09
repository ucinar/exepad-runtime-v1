import React from 'react';

/**
 * Safely maps over children array, handling cases where children might not be an array
 * @param children - The children to map over
 * @param mapFn - Function to map each child
 * @returns Mapped children or original children if not an array
 */
export function safeMapChildren<T>(
  children: any,
  mapFn: (child: any, index: number) => T
): T[] | any {
  if (!Array.isArray(children)) {
    return children;
  }
  return children.map(mapFn);
}

/**
 * Renders children as BoxChild components with proper lazy loading and error boundaries
 * @param children - The children to render
 * @param fallbackComponent - Optional fallback component for suspense
 * @returns Rendered children
 */
export function renderBoxChildren(
  children: any,
  fallbackComponent?: React.ReactNode
) {
  return safeMapChildren(children, (child, index) => {
    const DynamicRenderer = React.lazy(() => import('../components/DynamicRenderer'));
    const defaultFallback = React.createElement('div', { 
      className: 'animate-pulse bg-gray-200 rounded h-4 w-full' 
    });
    
    return React.createElement(React.Suspense, {
      key: child.uuid || `box-child-${index}`,
      fallback: fallbackComponent || defaultFallback
    }, React.createElement(DynamicRenderer, { component: child }));
  });
}