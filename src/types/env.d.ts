/**
 * Environment Variable Type Declarations
 *
 * Provides TypeScript type safety for process.env usage throughout the application.
 * Add new environment variables here to get autocomplete and type checking.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Next.js
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_RUNTIME_URL?: string;

    // Analytics
    NEXT_PUBLIC_GA_ID?: string;
    NEXT_PUBLIC_ANALYTICS_ID?: string;

    // Feature Flags
    NEXT_PUBLIC_ENABLE_ANALYTICS?: string;
    NEXT_PUBLIC_ENABLE_ERROR_TRACKING?: string;

    // Add other environment variables as needed
  }
}

// Make this file a module
export {};
