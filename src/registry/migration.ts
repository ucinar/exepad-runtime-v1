/**
 * Registry Migration Helper
 * Provides backwards compatibility while migrating to Registry V2
 * 
 * This file exports a unified interface that works with both:
 * - Old manual registry (registry/index.ts)
 * - New auto-registration registry (ComponentRegistryV2)
 * 
 * Usage:
 * 1. Import from this file instead of registry/index
 * 2. Enable V2 via environment variable or feature flag
 * 3. Gradually migrate components
 */

import React from 'react';

// Import old registry
import * as oldRegistry from './index';

// Import new registry
import registryV2, { ComponentMetadata } from './ComponentRegistryV2';
import { initializeAutoRegistration, preloadCriticalComponents } from './auto-register';

/**
 * Feature flag for Registry V2
 * Set NEXT_PUBLIC_USE_REGISTRY_V2=true to enable
 */
const USE_REGISTRY_V2 = process.env.NEXT_PUBLIC_USE_REGISTRY_V2 === 'true';

/**
 * Initialize the appropriate registry
 */
let isInitialized = false;

export function initializeRegistry(): void {
  if (isInitialized) {
    console.log('[Registry Migration] Already initialized');
    return;
  }

  if (USE_REGISTRY_V2) {
    console.log('[Registry Migration] 🚀 Using Registry V2 (auto-registration)');
    initializeAutoRegistration();
    
    // Preload critical components in background
    if (typeof window !== 'undefined') {
      preloadCriticalComponents().catch(console.error);
    }
  } else {
    console.log('[Registry Migration] Using legacy registry');
  }

  isInitialized = true;
}

/**
 * Get a component (unified interface)
 */
export async function getComponent(componentType: string): Promise<React.ComponentType<any> | null> {
  // Initialize on first use
  if (!isInitialized) {
    initializeRegistry();
  }

  if (USE_REGISTRY_V2) {
    return registryV2.get(componentType);
  } else {
    return oldRegistry.getComponent(componentType);
  }
}

/**
 * Get component synchronously (from cache)
 */
export function getComponentSync(componentType: string): React.ComponentType<any> | null {
  if (USE_REGISTRY_V2) {
    return registryV2.getSync(componentType);
  } else {
    return oldRegistry.getComponentSync(componentType);
  }
}

/**
 * Preload component(s)
 */
export async function preloadComponent(componentType: string): Promise<void> {
  if (USE_REGISTRY_V2) {
    await registryV2.preload(componentType);
  } else {
    await oldRegistry.preloadComponent(componentType);
  }
}

/**
 * Preload multiple components
 */
export async function preloadComponents(componentTypes: string[]): Promise<void> {
  if (USE_REGISTRY_V2) {
    await registryV2.preload(componentTypes);
  } else {
    await oldRegistry.preloadComponents(componentTypes);
  }
}

/**
 * Check if component is registered
 */
export function isComponentRegistered(componentType: string): boolean {
  if (USE_REGISTRY_V2) {
    return registryV2.isRegistered(componentType);
  } else {
    return oldRegistry.isComponentRegistered(componentType);
  }
}

/**
 * Check if component is cached
 */
export function isComponentCached(componentType: string): boolean {
  if (USE_REGISTRY_V2) {
    return registryV2.isCached(componentType);
  } else {
    return oldRegistry.isComponentCached(componentType);
  }
}

/**
 * Get all registered component types
 */
export function getRegisteredComponentTypes(): string[] {
  if (USE_REGISTRY_V2) {
    return registryV2.getAllTypes();
  } else {
    return oldRegistry.getRegisteredComponentTypes();
  }
}

/**
 * Clear component cache
 */
export function clearComponentCache(): void {
  if (USE_REGISTRY_V2) {
    registryV2.clearCache();
  } else {
    oldRegistry.clearComponentCache();
  }
}

/**
 * V2-only features (gracefully degrade for V1)
 */

export function getComponentMetadata(componentType: string): ComponentMetadata | undefined {
  if (USE_REGISTRY_V2) {
    return registryV2.getMetadata(componentType);
  }
  return undefined;
}

export function getPerformanceStats(componentType?: string): any {
  if (USE_REGISTRY_V2) {
    return registryV2.getPerformanceStats(componentType);
  }
  return { message: 'Performance stats only available in Registry V2' };
}

export function getSizeInfo(): any {
  if (USE_REGISTRY_V2) {
    return registryV2.getSizeInfo();
  }
  return { message: 'Size info only available in Registry V2' };
}

/**
 * Direct access to registries (for advanced usage)
 */
export { oldRegistry, registryV2 };

/**
 * Check which registry is active
 */
export function getActiveRegistry(): 'v1' | 'v2' {
  return USE_REGISTRY_V2 ? 'v2' : 'v1';
}

/**
 * Default export for backwards compatibility
 */
export default {
  getComponent,
  getComponentSync,
  preloadComponent,
  preloadComponents,
  isComponentRegistered,
  isComponentCached,
  getRegisteredComponentTypes,
  clearComponentCache,
  // V2-only
  getComponentMetadata,
  getPerformanceStats,
  getSizeInfo,
  getActiveRegistry,
};

