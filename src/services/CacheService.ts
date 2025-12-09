/**
 * Cache Service
 * Intelligent caching with TTL, LRU eviction, and multiple storage backends
 */

/**
 * Cache Entry
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessedAt: number;
  size?: number; // Estimated size in bytes
}

/**
 * Cache Options
 */
export interface CacheOptions {
  /** Time-to-live in milliseconds */
  ttl?: number;
  /** Maximum cache size (number of entries) */
  maxSize?: number;
  /** Maximum memory size in bytes (approximate) */
  maxMemory?: number;
  /** Storage backend */
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  /** Namespace for localStorage/sessionStorage */
  namespace?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Serializer for complex objects */
  serializer?: {
    serialize: (value: any) => string;
    deserialize: (value: string) => any;
  };
}

/**
 * Cache Statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  currentSize: number;
  totalMemoryUsage: number;
  hitRate: number;
}

/**
 * Cache Service Class
 */
export class CacheService<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private options: Required<CacheOptions>;
  
  // Statistics
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    currentSize: 0,
    totalMemoryUsage: 0,
    hitRate: 0,
  };

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // Default 5 minutes
      maxSize: options.maxSize || 100,
      maxMemory: options.maxMemory || 50 * 1024 * 1024, // Default 50MB
      storage: options.storage || 'memory',
      namespace: options.namespace || 'cache',
      debug: options.debug || false,
      serializer: options.serializer || {
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      },
    };

    // Load from persistent storage if applicable
    if (this.options.storage !== 'memory') {
      this.loadFromStorage();
    }

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    // Cache miss
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      this.log(`Miss: ${key}`);
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.log(`Expired: ${key}`);
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return undefined;
    }

    // Cache hit - update access metadata
    entry.accessCount++;
    entry.lastAccessedAt = Date.now();
    this.stats.hits++;
    this.updateHitRate();
    this.log(`Hit: ${key} (access count: ${entry.accessCount})`);

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, customTtl?: number): void {
    const ttl = customTtl || this.options.ttl;
    const now = Date.now();
    
    // Estimate size
    const size = this.estimateSize(value);

    // Check memory limit
    if (this.stats.totalMemoryUsage + size > this.options.maxMemory) {
      this.log(`Memory limit reached, evicting...`);
      this.evictByMemory(size);
    }

    // Check size limit
    if (this.cache.size >= this.options.maxSize) {
      this.log(`Size limit reached, evicting LRU...`);
      this.evictLRU();
    }

    // Create entry
    const entry: CacheEntry<T> = {
      value,
      expiresAt: now + ttl,
      createdAt: now,
      accessCount: 0,
      lastAccessedAt: now,
      size,
    };

    this.cache.set(key, entry);
    this.stats.currentSize = this.cache.size;
    this.stats.totalMemoryUsage += size;
    
    this.log(`Set: ${key} (TTL: ${ttl}ms, Size: ${size} bytes)`);

    // Persist if needed
    if (this.options.storage !== 'memory') {
      this.persistToStorage();
    }
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.stats.currentSize = this.cache.size;
    this.stats.totalMemoryUsage -= entry.size || 0;
    
    this.log(`Delete: ${key}`);

    // Persist if needed
    if (this.options.storage !== 'memory') {
      this.persistToStorage();
    }

    return true;
  }

  /**
   * Check if key exists in cache (and is not expired)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.currentSize = 0;
    this.stats.totalMemoryUsage = 0;
    this.log('Cache cleared');

    // Clear storage
    if (this.options.storage !== 'memory') {
      this.clearStorage();
    }
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get or set pattern (fetch if not in cache)
   */
  async getOrSet(
    key: string,
    fetcher: () => Promise<T>,
    customTtl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Fetch and cache
    this.log(`Fetching: ${key}`);
    const value = await fetcher();
    this.set(key, value, customTtl);
    
    return value;
  }

  /**
   * Invalidate by pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }

    this.log(`Invalidated ${count} entries matching pattern: ${pattern}`);
    return count;
  }

  /**
   * Invalidate by tag (requires tagging support)
   */
  invalidateTag(tag: string): void {
    // Tag support can be added by extending CacheEntry with tags
    this.log(`Tag invalidation not yet implemented: ${tag}`);
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.lastAccessedAt < oldestTime) {
        oldestTime = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
      this.log(`Evicted LRU: ${oldestKey}`);
    }
  }

  /**
   * Evict entries to free up memory
   */
  private evictByMemory(requiredSize: number): void {
    // Sort by access count (least accessed first)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.accessCount - b.accessCount
    );

    let freedMemory = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of entries) {
      if (freedMemory >= requiredSize) break;
      keysToDelete.push(key);
      freedMemory += entry.size || 0;
    }

    for (const key of keysToDelete) {
      this.delete(key);
      this.stats.evictions++;
    }

    this.log(`Evicted ${keysToDelete.length} entries to free ${freedMemory} bytes`);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
    }

    if (keysToDelete.length > 0) {
      this.log(`Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private cleanupInterval?: NodeJS.Timeout;
  
  private startCleanupInterval(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Stop cleanup interval (for cleanup)
   */
  stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Estimate size of value in bytes (approximate)
   */
  private estimateSize(value: any): number {
    try {
      const str = this.options.serializer.serialize(value);
      return str.length * 2; // 2 bytes per character (UTF-16)
    } catch {
      return 1024; // Default 1KB if serialization fails
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Load from persistent storage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storage = this.getStorage();
      if (!storage) return;

      const key = `${this.options.namespace}:cache`;
      const data = storage.getItem(key);
      
      if (data) {
        const entries: Array<[string, CacheEntry<T>]> = this.options.serializer.deserialize(data);
        this.cache = new Map(entries);
        this.log(`Loaded ${entries.length} entries from ${this.options.storage}`);
      }
    } catch (error) {
      console.error('[CacheService] Failed to load from storage:', error);
    }
  }

  /**
   * Persist to storage
   */
  private persistToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storage = this.getStorage();
      if (!storage) return;

      const key = `${this.options.namespace}:cache`;
      const entries = Array.from(this.cache.entries());
      const data = this.options.serializer.serialize(entries);
      
      storage.setItem(key, data);
    } catch (error) {
      console.error('[CacheService] Failed to persist to storage:', error);
    }
  }

  /**
   * Clear storage
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storage = this.getStorage();
      if (!storage) return;

      const key = `${this.options.namespace}:cache`;
      storage.removeItem(key);
    } catch (error) {
      console.error('[CacheService] Failed to clear storage:', error);
    }
  }

  /**
   * Get storage backend
   */
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;
    
    if (this.options.storage === 'localStorage') {
      return window.localStorage;
    } else if (this.options.storage === 'sessionStorage') {
      return window.sessionStorage;
    }
    
    return null;
  }

  /**
   * Debug logging
   */
  private log(message: string): void {
    if (this.options.debug) {
      console.log(`[CacheService] ${message}`);
    }
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    this.stopCleanupInterval();
    
    // Persist final state
    if (this.options.storage !== 'memory') {
      this.persistToStorage();
    }
    
    this.clear();
  }
}

/**
 * Create a singleton cache instance for app configs
 */
export const configCache = new CacheService({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 50,
  namespace: 'app-config',
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Create a singleton cache instance for components
 */
export const componentCache = new CacheService({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 200,
  namespace: 'component-data',
  debug: false,
});

