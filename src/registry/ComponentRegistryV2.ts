/**
 * Component Registry V2 - Auto-Registration System
 * Automatically discovers and registers components using glob imports
 * Supports versioning, metadata, and plugin architecture
 */

import React from 'react';

/**
 * Component Metadata
 * Additional information about each component for better tooling
 */
export interface ComponentMetadata {
  /** Component type/name (e.g., "ButtonProps") */
  type: string;
  /** Human-readable display name */
  displayName: string;
  /** Component category */
  category: 'core' | 'feedback' | 'layout' | 'media' | 'navigation' | 'form' | 'content' | 'blog' | 'utils';
  /** Component version (semantic versioning) */
  version: string;
  /** Component description */
  description?: string;
  /** Tags for search and filtering */
  tags?: string[];
  /** Whether component is stable, beta, or deprecated */
  status: 'stable' | 'beta' | 'deprecated';
  /** File path (for debugging) */
  filePath?: string;
  /** Dependencies (other component types this depends on) */
  dependencies?: string[];
  /** Size estimate (for bundle analysis) */
  estimatedSize?: 'small' | 'medium' | 'large' | 'xl';
}

/**
 * Component Loader Function Type
 */
export type ComponentLoader = () => Promise<React.ComponentType<any>>;

/**
 * Registry Entry
 */
interface RegistryEntry {
  loader: ComponentLoader;
  metadata?: ComponentMetadata;
}

/**
 * Component Registry V2 Class
 * Singleton pattern for global registry management
 */
class ComponentRegistryV2 {
  private registry: Map<string, RegistryEntry> = new Map();
  private cache: Map<string, React.ComponentType<any>> = new Map();
  private plugins: Map<string, ComponentLoader> = new Map();
  private metadata: Map<string, ComponentMetadata> = new Map();
  
  // Performance tracking
  private loadTimes: Map<string, number> = new Map();
  private loadCount: Map<string, number> = new Map();

  /**
   * Register a component manually
   */
  register(type: string, loader: ComponentLoader, metadata?: ComponentMetadata): void {
    this.registry.set(type, { loader, metadata });
    
    if (metadata) {
      this.metadata.set(type, metadata);
    }
    
    console.log(`[Registry V2] Registered: ${type}${metadata ? ` (${metadata.category})` : ''}`);
  }

  /**
   * Register a plugin component (external)
   */
  registerPlugin(type: string, loader: ComponentLoader, metadata?: ComponentMetadata): void {
    this.plugins.set(type, loader);
    this.register(type, loader, { ...metadata, tags: [...(metadata?.tags || []), 'plugin'] } as ComponentMetadata);
    console.log(`[Registry V2] Plugin registered: ${type}`);
  }

  /**
   * Bulk register components from glob import
   */
  bulkRegister(
    modules: Record<string, () => Promise<any>>,
    extractMetadata?: (path: string) => Partial<ComponentMetadata>
  ): void {
    const entries = Object.entries(modules);
    console.log(`[Registry V2] Bulk registering ${entries.length} components...`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const [path, loader] of entries) {
      try {
        // Extract component info from path
        const metadata = this.extractMetadataFromPath(path, extractMetadata);
        
        if (!metadata.type) {
          console.warn(`[Registry V2] Could not extract type from path: ${path}`);
          errorCount++;
          continue;
        }

        // Create a loader that extracts the default or named export
        const componentLoader: ComponentLoader = async () => {
          const module = await loader();
          
          // Try default export first
          if (module.default) return module.default;
          
          // Try named export matching the type
          if (metadata.type) {
            const componentName = metadata.type.replace('Props', '');
            if (module[componentName]) return module[componentName];
          }
          
          // Try to find any exported component
          const exports = Object.keys(module).filter(key => 
            key !== '__esModule' && 
            key !== 'default' &&
            typeof module[key] === 'function'
          );
          
          if (exports.length > 0) {
            console.warn(`[Registry V2] Using fallback export "${exports[0]}" for ${metadata.type}`);
            return module[exports[0]];
          }
          
          throw new Error(`No valid export found for ${path}`);
        };

        this.register(metadata.type, componentLoader, metadata as ComponentMetadata);
        successCount++;
      } catch (error) {
        console.error(`[Registry V2] Error registering ${path}:`, error);
        errorCount++;
      }
    }

    console.log(`[Registry V2] Bulk registration complete: ${successCount} success, ${errorCount} errors`);
  }

  /**
   * Extract metadata from file path
   */
  private extractMetadataFromPath(
    path: string,
    customExtractor?: (path: string) => Partial<ComponentMetadata>
  ): Partial<ComponentMetadata> {
    // Custom extractor takes precedence
    if (customExtractor) {
      const custom = customExtractor(path);
      if (custom.type) return custom;
    }

    // Default extraction logic
    // Path format: src/app_runtime/runtime/components/custom/{domain}/{category}/{ComponentName}.tsx
    const pathParts = path.split('/');
    const fileName = pathParts[pathParts.length - 1].replace('.tsx', '').replace('.ts', '');
    const category = pathParts[pathParts.length - 2] as ComponentMetadata['category'];
    
    // Determine component type
    // Convention: ComponentName -> ComponentNameProps
    const type = fileName.endsWith('Props') ? fileName : `${fileName}Props`;
    
    // Estimate size based on category
    let estimatedSize: ComponentMetadata['estimatedSize'] = 'small';
    if (['media', 'form'].includes(category)) estimatedSize = 'large';
    else if (['layout', 'content'].includes(category)) estimatedSize = 'medium';

    return {
      type,
      displayName: fileName,
      category: category || 'core',
      version: '1.0.0',
      status: 'stable',
      filePath: path,
      estimatedSize,
    };
  }

  /**
   * Get a component (async, with caching)
   */
  async get(type: string): Promise<React.ComponentType<any> | null> {
    // Check cache first
    if (this.cache.has(type)) {
      return this.cache.get(type)!;
    }

    // Find in registry
    const entry = this.registry.get(type);
    if (!entry) {
      console.error(`[Registry V2] Component "${type}" not found`);
      return null;
    }

    // Load component with performance tracking
    const startTime = performance.now();
    
    try {
      const component = await entry.loader();
      const loadTime = performance.now() - startTime;
      
      // Cache the component
      this.cache.set(type, component);
      
      // Track performance
      this.loadTimes.set(type, loadTime);
      this.loadCount.set(type, (this.loadCount.get(type) || 0) + 1);
      
      console.log(`[Registry V2] Loaded ${type} in ${loadTime.toFixed(2)}ms`);
      
      return component;
    } catch (error) {
      console.error(`[Registry V2] Failed to load ${type}:`, error);
      return null;
    }
  }

  /**
   * Get component synchronously (from cache only)
   */
  getSync(type: string): React.ComponentType<any> | null {
    return this.cache.get(type) || null;
  }

  /**
   * Preload component(s) into cache
   */
  async preload(types: string | string[]): Promise<void> {
    const typeArray = Array.isArray(types) ? types : [types];
    await Promise.all(typeArray.map(type => this.get(type)));
  }

  /**
   * Preload components by category
   */
  async preloadCategory(category: ComponentMetadata['category']): Promise<void> {
    const types = this.getComponentsByCategory(category);
    await this.preload(types);
  }

  /**
   * Check if component is registered
   */
  isRegistered(type: string): boolean {
    return this.registry.has(type);
  }

  /**
   * Check if component is cached
   */
  isCached(type: string): boolean {
    return this.cache.has(type);
  }

  /**
   * Get all registered component types
   */
  getAllTypes(): string[] {
    const result: string[] = [];
    this.registry.forEach((_, type) => result.push(type));
    return result;
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: ComponentMetadata['category']): string[] {
    const result: string[] = [];
    this.metadata.forEach((meta, type) => {
      if (meta.category === category) {
        result.push(type);
      }
    });
    return result;
  }

  /**
   * Get components by tag
   */
  getComponentsByTag(tag: string): string[] {
    const result: string[] = [];
    this.metadata.forEach((meta, type) => {
      if (meta.tags?.includes(tag)) {
        result.push(type);
      }
    });
    return result;
  }

  /**
   * Get component metadata
   */
  getMetadata(type: string): ComponentMetadata | undefined {
    return this.metadata.get(type);
  }

  /**
   * Get all metadata
   */
  getAllMetadata(): ComponentMetadata[] {
    const result: ComponentMetadata[] = [];
    this.metadata.forEach((meta) => result.push(meta));
    return result;
  }

  /**
   * Get performance stats
   */
  getPerformanceStats(type?: string): any {
    if (type) {
      return {
        type,
        loadTime: this.loadTimes.get(type),
        loadCount: this.loadCount.get(type),
        cached: this.isCached(type),
      };
    }

    // Return aggregated stats
    const allTypes = this.getAllTypes();
    
    // Calculate total loads
    let totalLoads = 0;
    this.loadCount.forEach((count) => {
      totalLoads += count;
    });
    
    return {
      totalComponents: allTypes.length,
      cachedComponents: allTypes.filter(t => this.isCached(t)).length,
      totalLoads,
      averageLoadTime: this.calculateAverageLoadTime(),
      slowestComponents: this.getSlowestComponents(5),
    };
  }

  private calculateAverageLoadTime(): number {
    const times: number[] = [];
    this.loadTimes.forEach((time) => times.push(time));
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  private getSlowestComponents(count: number): Array<{ type: string; time: number }> {
    const entries: Array<{ type: string; time: number }> = [];
    this.loadTimes.forEach((time, type) => {
      entries.push({ type, time });
    });
    return entries
      .sort((a, b) => b.time - a.time)
      .slice(0, count);
  }

  /**
   * Clear cache
   */
  clearCache(type?: string): void {
    if (type) {
      this.cache.delete(type);
      console.log(`[Registry V2] Cleared cache for: ${type}`);
    } else {
      this.cache.clear();
      console.log(`[Registry V2] Cleared all cache`);
    }
  }

  /**
   * Unregister a component (useful for plugins)
   */
  unregister(type: string): boolean {
    const existed = this.registry.delete(type);
    this.cache.delete(type);
    this.metadata.delete(type);
    this.plugins.delete(type);
    
    if (existed) {
      console.log(`[Registry V2] Unregistered: ${type}`);
    }
    
    return existed;
  }

  /**
   * Get registry size info (for bundle analysis)
   */
  getSizeInfo(): any {
    const bySize: Record<string, number> = {
      small: 0,
      medium: 0,
      large: 0,
      xl: 0,
    };

    this.metadata.forEach((meta) => {
      if (meta.estimatedSize) {
        bySize[meta.estimatedSize]++;
      }
    });

    return {
      totalComponents: this.registry.size,
      cachedComponents: this.cache.size,
      pluginComponents: this.plugins.size,
      bySize,
      byCategory: this.getCategoryCounts(),
    };
  }

  private getCategoryCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    this.metadata.forEach((meta) => {
      counts[meta.category] = (counts[meta.category] || 0) + 1;
    });
    
    return counts;
  }
}

// Singleton instance
const registryInstance = new ComponentRegistryV2();

// Export singleton
export default registryInstance;

// Export class for testing
export { ComponentRegistryV2 };

