/**
 * Application Constants
 * Centralized configuration values to avoid magic numbers/strings
 */

/**
 * WebSocket Configuration
 */
export const WEBSOCKET = {
  /** Heartbeat/ping interval in milliseconds */
  HEARTBEAT_INTERVAL: 30000,
  
  /** Maximum number of reconnection attempts */
  MAX_RECONNECT_ATTEMPTS: 10,
  
  /** Base delay for exponential backoff (in milliseconds) */
  RECONNECT_DELAY_BASE: 1000,
  
  /** Maximum number of messages to queue while offline */
  MESSAGE_QUEUE_SIZE: 100,
  
  /** Heartbeat timeout detection (in milliseconds) */
  HEARTBEAT_TIMEOUT: 35000,
  
  /** Maximum message ID cache size for deduplication */
  MESSAGE_ID_CACHE_SIZE: 1000,
} as const;

/**
 * Cache Configuration
 */
export const CACHE = {
  /** Default TTL (time-to-live) in milliseconds - 5 minutes */
  DEFAULT_TTL: 5 * 60 * 1000,
  
  /** Default maximum cache size (number of entries) */
  DEFAULT_MAX_SIZE: 50,
  
  /** Default maximum memory usage in bytes - 50MB */
  DEFAULT_MAX_MEMORY: 50 * 1024 * 1024,
  
  /** Config cache TTL - 10 minutes */
  CONFIG_TTL: 10 * 60 * 1000,
  
  /** Component cache TTL - 30 minutes */
  COMPONENT_TTL: 30 * 60 * 1000,
} as const;

/**
 * Auto-save Configuration
 */
export const AUTO_SAVE = {
  /** Auto-save interval in milliseconds */
  INTERVAL: 30000,
  
  /** Debounce delay for save operations in milliseconds */
  DEBOUNCE_DELAY: 1000,
  
  /** Maximum number of auto-save retries */
  MAX_RETRIES: 3,
} as const;

/**
 * Performance Configuration
 */
export const PERFORMANCE = {
  /** Breakpoint for mobile detection (in pixels) */
  MOBILE_BREAKPOINT: 768,
  
  /** Maximum number of components before virtualization recommended */
  VIRTUALIZATION_THRESHOLD: 50,
  
  /** Target frame rate (frames per second) */
  TARGET_FPS: 60,
  
  /** Maximum render time per component (in milliseconds) */
  MAX_COMPONENT_RENDER_TIME: 16, // ~60fps
} as const;

/**
 * API Configuration
 */
export const API = {
  /** Request timeout in milliseconds */
  REQUEST_TIMEOUT: 30000,
  
  /** Default retry attempts for failed requests */
  DEFAULT_RETRIES: 3,
  
  /** Exponential backoff base (in milliseconds) */
  RETRY_DELAY_BASE: 1000,
} as const;

/**
 * Error Reporting Configuration
 */
export const ERROR_REPORTING = {
  /** Sentry trace sample rate */
  TRACES_SAMPLE_RATE: 0.1,
  
  /** Maximum breadcrumbs to keep */
  MAX_BREADCRUMBS: 50,
} as const;

/**
 * Component Registry Configuration
 */
export const REGISTRY = {
  /** Default component version */
  DEFAULT_VERSION: '1.0.0',
  
  /** Default component status */
  DEFAULT_STATUS: 'stable' as const,
  
  /** Performance stats tracking window */
  STATS_WINDOW_SIZE: 100,
} as const;

/**
 * Runtime Modes
 */
export const RUNTIME_MODES = {
  PUBLISHED: 'published',
  PREVIEW: 'preview',
  DEMO: 'demo',
} as const;

/**
 * Error Message Prefixes
 */
export const ERROR_PREFIX = {
  CONFIG: '[ConfigService]',
  WS: '[WebSocketManager]',
  CACHE: '[CacheService]',
  REGISTRY: '[ComponentRegistry]',
  PERSISTENCE: '[PersistenceService]',
  ERROR_REPORTING: '[ErrorReporting]',
} as const;

/**
 * File Size Limits
 */
export const FILE_LIMITS = {
  /** Maximum upload file size in bytes - 10MB */
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024,
  
  /** Maximum image size in bytes - 5MB */
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
} as const;

/**
 * Timing Configuration
 */
export const TIMING = {
  /** Animation duration (in milliseconds) */
  ANIMATION_DURATION: 300,
  
  /** Toast display duration (in milliseconds) */
  TOAST_DURATION: 5000,
  
  /** Notification auto-dismiss (in milliseconds) */
  NOTIFICATION_DURATION: 8000,
} as const;

/**
 * Z-Index Layers
 */
export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

/**
 * Export all constants as a single object for convenience
 */
export const CONSTANTS = {
  WEBSOCKET,
  CACHE,
  AUTO_SAVE,
  PERFORMANCE,
  API,
  ERROR_REPORTING,
  REGISTRY,
  RUNTIME_MODES,
  ERROR_PREFIX,
  FILE_LIMITS,
  TIMING,
  Z_INDEX,
} as const;

