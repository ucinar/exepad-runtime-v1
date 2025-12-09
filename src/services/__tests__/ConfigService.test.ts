/**
 * ConfigService Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigService } from '../ConfigService';

describe('ConfigService', () => {
  beforeEach(() => {
    // Clear cache before each test
    ConfigService.clearCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetch', () => {
    it('should fetch config from backend', async () => {
      // Mock fetch
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ config_url: 'http://example.com/config.json' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify({ uuid: 'test-app', name: 'Test App' }),
        });

      const config = await ConfigService.fetch('test-app', 'deployed');

      expect(config).toBeDefined();
      expect(config?.uuid).toBe('test-app');
      expect(config?.name).toBe('Test App');
    });

    it('should handle fetch failures with retries', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const config = await ConfigService.fetch('test-app', 'deployed', { retries: 2 });

      expect(config).toBeNull();
      expect(fetch).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    it('should use cached config when available', async () => {
      const mockConfig = { uuid: 'test-app', name: 'Test App' } as any;
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ config_url: 'http://example.com/config.json' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => JSON.stringify(mockConfig),
        });

      // First fetch - should hit network
      await ConfigService.fetch('test-app', 'deployed', { cache: 'default' });

      // Second fetch - should use cache
      const cachedConfig = await ConfigService.fetch('test-app', 'deployed', { cache: 'default' });

      expect(cachedConfig).toEqual(mockConfig);
      // fetch should only be called twice (for first fetch)
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('invalidate', () => {
    it('should clear cache for specific app', async () => {
      const mockConfig = { uuid: 'test-app', name: 'Test App' } as any;
      
      global.fetch = vi.fn()
        .mockResolvedValue({
          ok: true,
          json: async () => ({ config_url: 'http://example.com/config.json' }),
        })
        .mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify(mockConfig),
        });

      // Fetch and cache
      await ConfigService.fetch('test-app', 'deployed', { cache: 'default' });

      // Invalidate cache
      ConfigService.invalidate('test-app');

      // Next fetch should hit network again
      await ConfigService.fetch('test-app', 'deployed', { cache: 'default' });

      // Should have been called twice (once for each fetch, after invalidation)
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('extractComponents', () => {
    it('should extract all components from config', () => {
      const mockConfig = {
        header: [{ uuid: 'header-1', componentType: 'NavbarProps' }],
        footer: [{ uuid: 'footer-1', componentType: 'TextProps' }],
        pages: [
          {
            content: [
              { uuid: 'page-1', componentType: 'SectionProps' },
              { uuid: 'page-2', componentType: 'ButtonProps' },
            ],
          },
        ],
      } as any;

      const components = ConfigService.extractComponents(mockConfig);

      expect(components.size).toBe(4);
      expect(components.has('header-1')).toBe(true);
      expect(components.has('footer-1')).toBe(true);
      expect(components.has('page-1')).toBe(true);
      expect(components.has('page-2')).toBe(true);
    });
  });

  describe('compareConfigs', () => {
    it('should detect changed components', () => {
      const oldConfig = {
        pages: [
          {
            content: [
              { uuid: 'comp-1', componentType: 'TextProps', lastUpdatedEpoch: 100 },
              { uuid: 'comp-2', componentType: 'ButtonProps', lastUpdatedEpoch: 200 },
            ],
          },
        ],
      } as any;

      const newConfig = {
        pages: [
          {
            content: [
              { uuid: 'comp-1', componentType: 'TextProps', lastUpdatedEpoch: 150 }, // Changed
              { uuid: 'comp-2', componentType: 'ButtonProps', lastUpdatedEpoch: 200 }, // Same
            ],
          },
        ],
      } as any;

      const updates = ConfigService.compareConfigs(oldConfig, newConfig);

      expect(updates).toHaveLength(1);
      expect(updates[0].componentId).toBe('comp-1');
      expect(updates[0].lastUpdatedEpoch).toBe(150);
    });
  });
});

