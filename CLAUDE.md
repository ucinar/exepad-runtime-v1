# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Exepad Runtime Frontend** - a Next.js-based runtime system that renders web applications from JSON configurations. The system uses a declarative approach where entire web apps (pages, components, styling, themes) are defined in JSON files and dynamically rendered at runtime.

## Core Architecture

### Configuration-Driven Rendering

The entire application is built around a **JSON-to-UI rendering engine**:

1. **JSON Configuration**: Web apps are defined as JSON files in `public/example/apps/` following the `WebAppProps` interface
2. **Component Registry**: Maps `componentType` strings to React components (`src/registry/index.ts`)
3. **Dynamic Renderer**: `DynamicRenderer.tsx` takes component configurations and renders them using the registry
4. **App Renderer**: `AppRenderer.tsx` orchestrates full app rendering (pages, headers, footers, transitions)

### Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── example/[app_id]/        # Preview route for JSON-based apps
│   └── demo/                     # Demo routes
├── app_runtime/                  # Core runtime system
│   ├── interfaces/              # TypeScript interfaces (JSON schema definitions)
│   │   ├── apps/                # App-level interfaces (WebAppProps, PageProps)
│   │   └── components/          # Component interfaces organized by category
│   │       ├── common/          # Shared components (core, layout, forms, etc.)
│   │       └── website/         # Website-specific components (blog, content)
│   ├── runtime/                 # Actual React components that get rendered
│   │   └── components/custom/   # Implementation of all renderable components
│   └── schemas/                 # Generated JSON schemas and catalogs
├── components/                   # Rendering infrastructure
│   ├── DynamicRenderer.tsx      # Core rendering engine
│   ├── AppRenderer.tsx          # Full app orchestrator
│   └── editable/                # Edit mode components (preview-only)
├── context/                      # React contexts (preview-only)
│   ├── EditModeContext.tsx      # Edit mode state
│   ├── AppContext.tsx           # App-level state
│   └── ConfigUpdateContext.tsx  # Config update handling
├── services/                     # Service layer (preview-only)
│   ├── WebSocketManager.ts      # WebSocket connection for live updates
│   ├── PersistenceService.ts    # Content persistence
│   └── ConfigService.ts         # Config management
├── stores/                       # Zustand state management (preview-only)
│   └── appStore.ts              # Centralized app state
├── registry/                     # Component registry system
├── utils/                        # Utility functions
└── constants/                    # Constants and configurations
```

### Key Concepts

**Component Props Pattern**: Every component follows the `ComponentProps` interface:
- `uuid`: Unique identifier for the component instance
- `componentType`: String that maps to registry (e.g., "ButtonProps", "SectionProps")
- `classes`: Optional Tailwind CSS classes
- Type-specific properties defined in `src/app_runtime/interfaces/components/`

**Layout System**: Supports multiple layout options:
- `boxed`: Contained layout (1200px max-width) - default
- `wide`: Wide layout (1600px max-width)
- `narrow`: Narrow layout (800px max-width)
- `full-width`: No container constraints

**Edit vs Preview Mode**: The system supports two modes:
- **Preview Mode**: Active when `?preview=true` query param is present. Includes edit capabilities, WebSocket connections, and state management
- **Published Mode**: Production rendering without edit features

## Development Commands

### Running the Development Server
```bash
npm run dev              # Start dev server on port 3001
```

### Building
```bash
npm run build           # Production build
npm run build:analyze   # Build with webpack bundle analyzer
```

### Testing
```bash
npm run test            # Run tests with Vitest
npm run test:ui         # Run tests with UI
npm run test:coverage   # Generate coverage report
```

### Schema Generation
```bash
npm run gen:schemas:components      # Generate component schemas (Node.js wrapper)
npm run gen:schemas:components:cli  # Generate schemas directly with CLI
npm run gen:schemas:examples        # Generate example catalog
npm run gen:schemas:apps            # Generate app schemas
npm run gen:schemas:full            # Generate full schema catalog
```

The schema generation system uses `ts-json-schema-generator` to convert TypeScript interfaces into JSON schemas for validation.

### Icon Generation
```bash
npm run gen:icons:lucide   # Generate lucide icon list
```

### Validation
```bash
npm run test:examples      # Validate example JSON files against schemas (Python)
```

## Working with Components

### Adding a New Component

1. **Define the interface** in `src/app_runtime/interfaces/components/[category]/[subcategory].ts`:
```typescript
export interface MyComponentProps extends ComponentProps {
  title: string;
  variant?: 'default' | 'outlined';
}
```

2. **Implement the component** in `src/app_runtime/runtime/components/custom/[category]/[subcategory]/MyComponent.tsx`:
```typescript
export const MyComponent: React.FC<MyComponentProps> = ({ title, variant = 'default', classes }) => {
  return <div className={classes}>{title}</div>;
};
```

3. **Register in the component registry** (`src/registry/index.ts`):
```typescript
'MyComponentProps': () => import('../app_runtime/runtime/components/custom/[path]/MyComponent').then(m => m.MyComponent),
```

4. **Regenerate schemas**:
```bash
npm run gen:schemas:components
```

### Component Categories

Components are organized by purpose:
- **common/core**: Basic UI elements (Button, Text, Image, etc.)
- **common/layout**: Layout components (Section, Grid, Flex, etc.)
- **common/forms**: Form components (Input, Select, Checkbox, etc.)
- **common/feedback**: Feedback components (Toast, Alert, Loader, etc.)
- **common/navigation**: Navigation components (Menu, Breadcrumb, etc.)
- **common/media**: Media components (Video, Audio, Gallery, etc.)
- **website/blog**: Blog-specific components
- **website/content**: Content display components
- **website/services**: Service-related components

## Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:
- `@/*` → `./src/*`
- `@/app_runtime/*` → `./src/app_runtime/*`
- `@/runtime/*` → `./src/app_runtime/runtime/*`
- `@/types/*` or `@/interfaces/*` → `./src/app_runtime/interfaces/*`
- `@/schemas/*` → `./src/app_runtime/schemas/*`
- `@/components/*` → `./src/components/*`
- `@/services/*` → `./src/services/*`
- `@/stores/*` → `./src/stores/*`
- And more...

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
```

## Working with JSON Configurations

Example apps are stored in `public/example/apps/webapp/`. Each app is a JSON file following the `WebAppProps` schema:

```json
{
  "uuid": "app-uuid",
  "alias": "myapp",
  "title": "My App",
  "layout": "boxed",
  "menuPosition": "TopMenuHorizontalCenter",
  "theme": { /* ThemeProps */ },
  "languages": [{ "code": "en", "name": "English" }],
  "header": [ /* ComponentProps[] */ ],
  "footer": [ /* ComponentProps[] */ ],
  "sidebar": [ /* ComponentProps[] */ ],
  "pages": [
    {
      "uuid": "page-uuid",
      "title": "Home",
      "slug": "/",
      "content": [ /* ComponentProps[] */ ]
    }
  ]
}
```

Access example apps at: `http://localhost:3001/example/[app-name]`

## Architectural Decisions

### Route Structure & Purpose

The application has three main route families, each serving a specific purpose:

1. **`/a/[app_id]`** - Production & Preview Routes
   - **Production**: `/a/{app_id}` - Deployed apps from backend, optimized for performance
   - **Preview**: `/a/preview-{app_id}` - Full-featured editing mode with WebSocket, state management
   - **Why separate components?**: `PublishedPage` and `PreviewPage` have fundamentally different requirements:
     - PublishedPage: Server-rendered, minimal bundle, no edit features, uses StaticHeaderLayout
     - PreviewPage: Client-rendered, full feature set, WebSocket connection, EditModeToolbar
   - This separation enables tree-shaking to exclude preview-only code from production builds

2. **`/demo/[app_id]`** - Demo Routes
   - Loads JSON from `public/demo/` directory
   - Read-only demonstrations of component capabilities
   - No backend connection required
   - Uses BaseAppPageRenderer for consistent rendering

3. **`/example/[app_id]`** - Example Routes
   - Loads JSON from `public/example/` directory (supports nested paths)
   - Development/testing environment for JSON configurations
   - Forced dynamic rendering (`export const dynamic = 'force-dynamic'`)
   - Uses BaseAppPageRenderer for consistent rendering

### Shared Components Architecture

To eliminate code duplication, several shared components were created:

- **`BaseAppPageRenderer`** (`src/app/_shared/components/BaseAppPageRenderer.tsx`)
  - Shared renderer for demo and example routes
  - Handles theme, fonts, context, and AppRenderer orchestration
  - Reduces ~70 lines of duplication per route

- **`AppErrorDisplay`** (`src/app/_shared/components/AppErrorDisplay.tsx`)
  - `ConfigErrorDisplay` - For missing/invalid configurations
  - `NotFoundErrorDisplay` - For 404 page errors
  - Consistent error UI across all routes

- **Shared Utilities** (`src/app/_shared/utils/`)
  - `configFetcher.ts` - Unified config fetching for all sources
  - `metadataGenerator.ts` - SEO metadata generation
  - `routeHelpers.ts` - Page finding, slug normalization (single source of truth)

### Font Loading Strategy

Font loading differs between server and client components:

**Server Components** (PublishedPage, demo, example routes):
- Use `DynamicFontLoader` component for async font loading
- Inline `<style>` tags for CSS custom properties (`--font-sans`, `--font-heading`)
- Server-side generation of font variables for immediate availability

**Client Components** (PreviewPage):
- Use `<link rel="stylesheet">` tags for client-side font loading
- Inline `<style>` tags for CSS custom properties
- Cannot use async `DynamicFontLoader` (server component incompatibility)

Both approaches prevent FOUC (Flash of Unstyled Content)

### TypeScript Status

**Progress Made**:
- Fixed layout params for Next.js 15 async params
- Fixed metadata generator type errors (removed non-existent `appConfig.title`)
- Fixed complex union type in Heading component (using React.createElement)
- Fixed DateTimeField value type handling
- All routes use proper async/await for params and searchParams

**Remaining Work**:
- Form field value types (boolean, arrays need proper conversion)
- Complex union types in some components
- See `next.config.js` TODO comments for tracking

TypeScript checks are currently disabled (`ignoreBuildErrors: true`) but significant progress has been made toward enabling them.

### Cache Management

- **Example routes**: Use `export const dynamic = 'force-dynamic'` for fresh data
- **Demo routes**: Standard Next.js caching
- **Production routes**: Default Next.js caching for optimal performance
- **Preview routes**: Always `cache: 'no-store'` for fresh config data

### Error Handling

All routes have comprehensive error handling:
- `error.tsx` files in all route segments for React Error Boundaries
- Route-specific error messages (Example, Demo, Production/Preview)
- Development mode debugging information
- User-friendly error UI with recovery options

## Important Notes

- **TypeScript errors are ignored in builds** (`ignoreBuildErrors: true` in `next.config.js`) - see Architectural Decisions for progress
- **Preview-only code**: Services, stores, contexts, and edit mode features are only used in preview mode
- **Component UUIDs**: Every component instance must have a unique `uuid`
- **Schema validation**: Always run schema generation after modifying interfaces
- **Lazy loading**: Components are lazily loaded via the registry for better performance
- **Memory leak prevention**: PreviewPage uses abort controllers to prevent state updates on unmounted components
- **Error boundaries**: All routes have proper error.tsx files for graceful error handling
