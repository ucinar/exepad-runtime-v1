/**
 * Config Service
 * Unified configuration management with multiple source support
 * Simplified with NO internal caching - caching is handled by React cache() wrapper
 */

import { WebAppProps } from '@/app_runtime/interfaces/apps/webapp';
import { ComponentProps } from '@/app_runtime/interfaces/components/common/core';

export type ConfigSource = 'backend' | 'public' | 'static' | 'demo' | 'example';

export interface FetchOptions {
  source?: ConfigSource;
  cache?: RequestCache; // Next.js fetch cache
  retries?: number;
  timeout?: number;
  slugSegments?: string[]; // For nested paths in example/demo
}

export interface ComponentUpdate {
  componentId: string;
  lastUpdatedEpoch: number;
  componentData?: ComponentProps;
  timestamp: number;
}

/**
 * ConfigService - Pure fetching logic with NO internal caching
 * IMPORTANT: This class does NOT cache. Caching is handled by:
 * - React cache() wrapper (request-level deduplication)
 * - Next.js fetch cache (persistence across requests)
 */
export class ConfigService {
  /**
   * Fetch config from various sources
   * NO caching - caller should wrap with React cache() if needed
   */
  static async fetch(
    appId: string,
    mode: 'published' | 'preview',
    options: FetchOptions = {}
  ): Promise<WebAppProps | null> {
    const { source = 'backend', cache = 'no-store', retries = 3, slugSegments } = options;

    try {
      return await this.fetchWithRetries(appId, mode, source, retries, slugSegments, cache);
    } catch (error) {
      console.error(`[ConfigService] Failed to fetch config:`, error);
      return null;
    }
  }

  /**
   * Fetch with retries (extracted for reusability)
   */
  private static async fetchWithRetries(
    appId: string,
    mode: 'published' | 'preview',
    source: ConfigSource,
    retries: number,
    slugSegments?: string[],
    cache?: RequestCache
  ): Promise<WebAppProps> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        let config: WebAppProps | null = null;

        switch (source) {
          case 'backend':
            config = await this.fetchFromBackend(appId, mode, cache);
            break;
          case 'public':
            config = await this.fetchFromPublicDir(appId, mode);
            break;
          case 'static':
          case 'demo':
            config = await this.fetchFromDemo(appId);
            break;
          case 'example':
            config = await this.fetchFromExample(appId, slugSegments);
            break;
        }

        if (config) {
          console.log(`[ConfigService] Successfully fetched config for ${appId} from ${source}`);
          return config;
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `[ConfigService] Attempt ${attempt + 1}/${retries} failed for ${appId}:`,
          error
        );
        // Exponential backoff
        if (attempt < retries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error(`Failed to fetch config after ${retries} attempts`);
  }

  /**
   * Fetch from backend API (existing logic)
   */
  private static async fetchFromBackend(
    appId: string,
    mode: 'published' | 'preview',
    cache?: RequestCache
  ): Promise<WebAppProps | null> {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error('Backend URL is not configured');
    }

    // For preview mode, always use no-store to bypass cache
    // For published mode, use the provided cache option (defaults to 'default')
    const cacheOption = mode === 'preview' ? 'no-store' : (cache || 'default');

    // Add cache-busting query parameter for preview mode to ensure fresh data
    // Note: Django requires trailing slash before query parameters
    const cacheBuster = mode === 'preview' ? `?t=${Date.now()}` : '';
    
    const response = await fetch(`${backendUrl}/api/runtime/app-config/${cacheBuster}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ app_id: appId, mode }),
      cache: cacheOption,
    });

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }

    const { config_url } = await response.json();
    
    // Note: We don't add cache-busting query parameters to config_url because:
    // 1. Signed URLs (like Google Cloud Storage) include query params in signature
    // 2. Adding params would invalidate the signature
    // 3. We rely on cache: 'no-store' and cache-control headers instead
    
    const configResponse = await fetch(config_url, { 
      cache: cacheOption,
    });

    if (!configResponse.ok) {
      throw new Error(`Failed to fetch config from ${config_url}`);
    }

    const responseText = await configResponse.text();
    const parsedData = JSON.parse(responseText);
    console.log(`[ConfigService] Parsed config:`, parsedData);
    console.log(`[ConfigService] Config URL: ${config_url}`);
    return typeof parsedData === 'string' ? JSON.parse(parsedData) : parsedData;
  }

  /**
   * Fetch from public directory (new)
   */
  private static async fetchFromPublicDir(
    appId: string,
    mode: 'published' | 'preview'
  ): Promise<WebAppProps | null> {
    const fileName = mode === 'preview' ? `${appId}-preview.json` : `${appId}.json`;
    const publicPath = `/configs/${fileName}`;

    const response = await fetch(publicPath, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Config file not found: ${publicPath}`);
    }

    return await response.json();
  }

  /**
   * Fetch from demo directory (public/demo)
   * Server-side only - uses dynamic import of fs module
   */
  private static async fetchFromDemo(appId: string): Promise<WebAppProps | null> {
    // Only available on server-side
    if (typeof window !== 'undefined') {
      throw new Error('Demo configs can only be fetched server-side');
    }

    try {
      // Edge Runtime: Use fetch to access public files
      // Check if we're in Edge Runtime by checking if process.cwd is unavailable
      const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';
      
      if (isEdgeRuntime) {
        // In Edge Runtime, we need an absolute URL for fetch
        // Use the request URL's origin or fallback to localhost for dev
        const origin = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
        
        const url = `${origin}/demo/${appId}.json`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Demo config not found: ${appId}`);
        }
        return await response.json();
      }

      // Node.js Runtime: Use filesystem
      // Use dynamic module names to prevent webpack from statically analyzing these imports
      // These modules are only available server-side and will never execute in the browser
      // @ts-ignore - dynamic import for server-side only
      const fsModule = 'fs';
      // @ts-ignore - dynamic import for server-side only
      const pathModule = 'path';
      // @ts-ignore - dynamic import for server-side only
      // webpackIgnore tells webpack to ignore this dynamic import (server-only)
      const { promises: fs } = await import(/* webpackIgnore: true */ fsModule);
      // @ts-ignore - dynamic import for server-side only
      const path = await import(/* webpackIgnore: true */ pathModule);

      const filePath = path.join(process.cwd(), 'public', 'demo', `${appId}.json`);
      const fileContents = await fs.readFile(filePath, 'utf8');
      return JSON.parse(fileContents);
    } catch (error) {
      throw new Error(`Demo config not found: ${appId}`);
    }
  }

  /**
   * Fetch from example directory (public/example)
   * Server-side only - supports nested directory structures
   */
  private static async fetchFromExample(
    appId: string,
    slugSegments?: string[]
  ): Promise<WebAppProps | null> {
    // Only available on server-side
    if (typeof window !== 'undefined') {
      throw new Error('Example configs can only be fetched server-side');
    }

    try {
      // Edge Runtime: Use fetch to access public files
      // Check if we're in Edge Runtime by checking the runtime environment
      const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';
      
      if (isEdgeRuntime) {
        // In Edge Runtime, we need an absolute URL for fetch
        // Use the request URL's origin or fallback to localhost for dev
        const origin = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
        
        const fullPath = [appId, ...(slugSegments || [])];
        
        // Try progressively shorter paths until we find a JSON file
        for (let i = fullPath.length; i >= 1; i--) {
          const pathSegments = fullPath.slice(0, i);
          const url = `${origin}/example/${pathSegments.join('/')}.json`;
          
          try {
            const response = await fetch(url);
            if (response.ok) {
              const config = await response.json();
              console.log(`[ConfigService] Found example config at: ${url}`);
              return config;
            }
          } catch {
            // File doesn't exist, try next shorter path
            continue;
          }
        }
        
        throw new Error(`Example config not found: ${appId}`);
      }

      // Node.js Runtime: Use filesystem
      // Use dynamic module names to prevent webpack from statically analyzing these imports
      // These modules are only available server-side and will never execute in the browser
      // @ts-ignore - dynamic import for server-side only
      const fsModule = 'fs';
      // @ts-ignore - dynamic import for server-side only
      const pathModule = 'path';
      // @ts-ignore - dynamic import for server-side only
      // webpackIgnore tells webpack to ignore this dynamic import (server-only)
      const { promises: fs } = await import(/* webpackIgnore: true */ fsModule);
      // @ts-ignore - dynamic import for server-side only
      const path = await import(/* webpackIgnore: true */ pathModule);

      const baseDir = path.join(process.cwd(), 'public', 'example');
      const fullPath = [appId, ...(slugSegments || [])];

      // Try progressively shorter paths until we find a JSON file
      for (let i = fullPath.length; i >= 1; i--) {
        const pathSegments = fullPath.slice(0, i);
        const filePath = path.join(baseDir, ...pathSegments) + '.json';

        try {
          const fileContents = await fs.readFile(filePath, 'utf8');
          const config = JSON.parse(fileContents);
          console.log(`[ConfigService] Found example config at: ${filePath}`);
          return config;
        } catch {
          // File doesn't exist, try next shorter path
          continue;
        }
      }

      throw new Error(`Example config not found: ${appId}`);
    } catch (error) {
      if ((error as Error).message.includes('can only be fetched server-side')) {
        throw error;
      }
      throw new Error(`Example config not found: ${appId}`);
    }
  }


  /**
   * Extract all components from a config
   */
  static extractComponents(config: WebAppProps): Map<string, ComponentProps> {
    const components = new Map<string, ComponentProps>();

    const traverse = (items: any[] | undefined) => {
      if (!items || !Array.isArray(items)) return;

      for (const item of items) {
        if (item && typeof item === 'object') {
          if (item.uuid && item.componentType) {
            components.set(item.uuid, item as ComponentProps);
          }
          Object.values(item).forEach((value) => {
            if (Array.isArray(value)) {
              traverse(value);
            } else if (
              value &&
              typeof value === 'object' &&
              (value as any).uuid &&
              (value as any).componentType
            ) {
              components.set((value as any).uuid, value as ComponentProps);
            }
          });
        }
      }
    };

    traverse(config.header);
    traverse(config.footer);
    traverse(config.sidebar);
    config.pages?.forEach((page) => {
      if ('content' in page && Array.isArray(page.content)) {
        traverse(page.content);
      }
    });

    return components;
  }

  /**
   * Compare two configs and return changed components
   */
  static compareConfigs(
    oldConfig: WebAppProps | null,
    newConfig: WebAppProps
  ): ComponentUpdate[] {
    if (!oldConfig) return [];

    const oldComponents = this.extractComponents(oldConfig);
    const newComponents = this.extractComponents(newConfig);
    const updates: ComponentUpdate[] = [];

    newComponents.forEach((newComp, uuid) => {
      const oldComp = oldComponents.get(uuid);
      const newEpoch = newComp.lastUpdatedEpoch || 0;
      const oldEpoch = oldComp?.lastUpdatedEpoch || 0;

      if (newEpoch > oldEpoch) {
        updates.push({
          componentId: uuid,
          lastUpdatedEpoch: newEpoch,
          componentData: newComp,
          timestamp: Date.now(),
        });
      }
    });

    if (updates.length > 0) {
      console.log(`[ConfigService] Found ${updates.length} component updates`);
    }

    return updates;
  }

  /**
   * Utility delay function for retries
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

