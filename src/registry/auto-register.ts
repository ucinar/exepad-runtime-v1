/**
 * Auto-Registration Initialization
 * Automatically discovers and registers all components using glob imports
 */

import registryV2 from './ComponentRegistryV2';

/**
 * Initialize auto-registration for all components
 * This uses Webpack's require.context (Next.js) for automatic discovery
 */
export function initializeAutoRegistration(): void {
  console.log('[Auto-Registration] Starting component discovery...');

  try {
    // Use require.context for Next.js/Webpack
    // This will be replaced with import.meta.glob in Vite if needed
    
    // Note: require.context is a Webpack feature
    // For Next.js, this works out of the box

    const componentModules = (require as any).context(
      '../app_runtime/runtime/components/custom',
      true,
      /^\.\/.*\/(core|feedback|layout|media|navigation|form|content|blog|utils)\/[^\/]+\.tsx$/
    );

    const modules: Record<string, () => Promise<any>> = {};

    // Convert require.context to glob-like structure
    componentModules.keys().forEach((key: string) => {
      const fullPath = `src/app_runtime/runtime/components/custom${key.slice(1)}`;
      modules[fullPath] = () => Promise.resolve(componentModules(key));
    });

    // Bulk register all discovered components
    registryV2.bulkRegister(modules);
    
    console.log('[Auto-Registration] ✅ Complete');
    console.log('[Auto-Registration] Registry stats:', registryV2.getSizeInfo());
    
  } catch (error) {
    console.error('[Auto-Registration] ❌ Failed:', error);
    console.warn('[Auto-Registration] Falling back to manual registration');
    
    // Fallback to manual registration if auto-registration fails
    initializeManualRegistration();
  }
}

/**
 * Manual registration fallback
 * Used when auto-registration is not available (SSR, certain build configs)
 */
function initializeManualRegistration(): void {
  console.log('[Manual Registration] Starting...');
  
  // CORE COMPONENTS
  registryV2.register('ButtonProps', 
    () => import('../app_runtime/runtime/components/custom/common/core/Button').then(m => m.Button),
    {
      type: 'ButtonProps',
      displayName: 'Button',
      category: 'core',
      version: '1.0.0',
      status: 'stable',
      estimatedSize: 'small',
      tags: ['interactive', 'form'],
    }
  );

  registryV2.register('HeadingProps',
    () => import('../app_runtime/runtime/components/custom/common/core/Heading').then(m => m.Heading),
    {
      type: 'HeadingProps',
      displayName: 'Heading',
      category: 'core',
      version: '1.0.0',
      status: 'stable',
      estimatedSize: 'small',
      tags: ['typography', 'text'],
    }
  );

  registryV2.register('TextProps',
    () => import('../app_runtime/runtime/components/custom/common/core/Text').then(m => m.Text),
    {
      type: 'TextProps',
      displayName: 'Text',
      category: 'core',
      version: '1.0.0',
      status: 'stable',
      estimatedSize: 'small',
      tags: ['typography', 'text'],
    }
  );

  registryV2.register('ImageProps',
    () => import('../app_runtime/runtime/components/custom/common/core/Image').then(m => m.Image),
    {
      type: 'ImageProps',
      displayName: 'Image',
      category: 'core',
      version: '1.0.0',
      status: 'stable',
      estimatedSize: 'medium',
      tags: ['media', 'visual'],
    }
  );

  // LAYOUT COMPONENTS
  registryV2.register('SectionProps',
    () => import('../app_runtime/runtime/components/custom/common/layout/Section').then(m => m.Section),
    {
      type: 'SectionProps',
      displayName: 'Section',
      category: 'layout',
      version: '1.0.0',
      status: 'stable',
      estimatedSize: 'small',
      tags: ['container', 'layout'],
    }
  );

  registryV2.register('FlexProps',
    () => import('../app_runtime/runtime/components/custom/common/layout/Flex').then(m => m.Flex),
    {
      type: 'FlexProps',
      displayName: 'Flex',
      category: 'layout',
      version: '1.0.0',
      status: 'stable',
      estimatedSize: 'small',
      tags: ['container', 'flexbox'],
    }
  );

  registryV2.register('GridProps',
    () => import('../app_runtime/runtime/components/custom/common/layout/Grid').then(m => m.Grid),
    {
      type: 'GridProps',
      displayName: 'Grid',
      category: 'layout',
      version: '1.0.0',
      status: 'stable',
      estimatedSize: 'small',
      tags: ['container', 'grid'],
    }
  );

  // Add more manual registrations as needed...
  // This is a minimal fallback set
  
  console.log('[Manual Registration] ✅ Complete (minimal set)');
}

/**
 * Preload critical components
 * Components that should be loaded immediately on app start
 */
export async function preloadCriticalComponents(): Promise<void> {
  console.log('[Preload] Loading critical components...');
  
  const criticalComponents = [
    'ButtonProps',
    'HeadingProps',
    'TextProps',
    'ImageProps',
    'SectionProps',
    'FlexProps',
    'GridProps',
    'NavbarProps',
  ];

  await registryV2.preload(criticalComponents);
  
  console.log('[Preload] ✅ Critical components loaded');
}

/**
 * Lazy preload non-critical components
 * Preload in background after critical components are loaded
 */
export function lazyPreloadComponents(): void {
  // Use requestIdleCallback for background preloading
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      console.log('[Lazy Preload] Starting background preload...');
      
      // Preload by category priority
      registryV2.preloadCategory('form').catch(console.error);
      registryV2.preloadCategory('content').catch(console.error);
      registryV2.preloadCategory('feedback').catch(console.error);
    }, { timeout: 5000 });
  }
}

/**
 * Export registry instance for direct access
 */
export { registryV2 };

/**
 * Get component (backwards compatible with old registry)
 */
export const getComponent = (type: string) => registryV2.get(type);

/**
 * Get component sync (backwards compatible)
 */
export const getComponentSync = (type: string) => registryV2.getSync(type);

