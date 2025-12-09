# TypeScript Migration Plan - Runtime

**Date**: November 16, 2025
**Current Status**: TypeScript checking disabled (`ignoreBuildErrors: true`)
**Goal**: Enable strict TypeScript checking in production builds

---

## Error Inventory

**Total Errors**: 154 across 40+ files

### Error Distribution by Type

| Error Code | Count | Description | Priority |
|------------|-------|-------------|----------|
| TS2304 | 50 | Cannot find name (missing declarations) | 🔴 P0 |
| TS2582 | 27 | Cannot find name 'process' (env vars) | 🔴 P0 |
| TS2307 | 16 | Cannot find module (missing imports) | 🔴 P0 |
| TS7006 | 9 | Implicit 'any' type | 🟡 P1 |
| TS2708 | 7 | Cannot use namespace as value (jest) | 🟢 P2 |
| TS2339 | 7 | Property does not exist on type | 🟡 P1 |
| TS2305 | 7 | Module has no exported member | 🔴 P0 |
| TS2322 | 6 | Type not assignable | 🟡 P1 |
| TS2345 | 5 | Argument type not assignable | 🟡 P1 |
| Others | 20 | Various type issues | 🟢 P2 |

---

## High-Level Strategy

### Phase 1: Quick Wins (This Session)
1. ✅ Exclude test files from TypeScript checking
2. ⏳ Fix missing type declarations (TS2304, TS2582)
3. ⏳ Fix import errors (TS2307, TS2305)
4. ⏳ Add missing environment type declarations

**Goal**: Reduce errors by 60-70% (to ~50 errors)

### Phase 2: Type Annotations (Next Sprint)
1. Fix implicit 'any' types (TS7006)
2. Add proper type annotations to function parameters
3. Fix type compatibility issues (TS2322, TS2345)

**Goal**: Reduce errors by 80% (to ~30 errors)

### Phase 3: Strict Type Safety (Next Quarter)
1. Fix component prop type issues
2. Resolve union type problems
3. Enable strict null checks
4. Enable all strict mode options

**Goal**: Zero errors, strict mode enabled

---

## Detailed Breakdown

### P0: Missing Type Declarations (93 errors)

#### TS2304: Cannot find name (50 errors)
**Common Issues**:
- React types not imported
- Custom types not declared
- Third-party library types missing

**Files Affected**:
- Form components (TextAreaField, TextField)
- Layout components (Grid, VirtualList)
- Media components (PDFViewer, PanoramaViewer)
- Blog components (BlogMain)

**Fix Strategy**:
```typescript
// BEFORE
const MyComponent = ({ data }) => { ... }

// AFTER
import { ComponentProps } from '@/interfaces';
const MyComponent: React.FC<ComponentProps> = ({ data }) => { ... }
```

#### TS2582: Cannot find name 'process' (27 errors)
**Issue**: `process.env` usage without Node.js type declarations

**Fix Strategy**:
Create `src/types/env.d.ts`:
```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_RUNTIME_URL?: string;
    // ... other env vars
  }
}
```

#### TS2307: Cannot find module (16 errors)
**Common Issues**:
- Incorrect import paths
- Missing barrel exports (index.ts)
- Path alias issues

**Examples**:
- `src/runtime/components/ui/sidebar` → Should be `@/components/ui/sidebar`
- Missing `LanguageOption` export
- Missing `Controller` from `react-hook-form`

**Fix Strategy**:
1. Fix path aliases in tsconfig.json
2. Add missing barrel exports
3. Install missing @types packages

#### TS2305: Module has no exported member (7 errors)
**Examples**:
- `Controller` from `react-hook-form` (version mismatch?)
- `Sidebar` named export (should be default export)

**Fix Strategy**:
- Check package versions
- Update import statements (named vs default)
- Add proper exports to index.ts files

---

### P1: Type Annotations (27 errors)

#### TS7006: Implicit 'any' type (9 errors)
**Files**:
- `Grid.tsx`: `component` parameter
- `TimelineBlock.tsx`: `event` parameter
- Navigation components

**Fix Strategy**:
```typescript
// BEFORE
const renderComponent = (component) => { ... }

// AFTER
const renderComponent = (component: ComponentProps) => { ... }
```

#### TS2339: Property does not exist on type (7 errors)
**Examples**:
- `items` on `SidebarProps`
- `plans` on `PricingTableProps`
- `events` on `TimelineBlockProps`

**Fix Strategy**:
Update interface definitions to include missing properties.

#### TS2322/TS2345: Type incompatibility (11 errors)
**Common Issues**:
- Form field values (boolean, arrays vs string)
- Component props (HeadingProps, TextProps as ReactNode)
- Layout type mismatches

**Fix Strategy**:
- Add proper type conversions
- Update interface definitions
- Use union types where appropriate

---

### P2: Low Priority (34 errors)

#### TS2708: Jest namespace errors (7 errors)
**Issue**: Test setup file has Jest type issues

**Fix Strategy**:
Exclude test files from main tsconfig, create separate `tsconfig.test.json`

#### TS7016: Missing type declarations for packages (2 errors)
**Packages**:
- `react-window`
- `pannellum-react`

**Fix Strategy**:
```bash
npm install --save-dev @types/react-window
# OR create custom .d.ts file for pannellum-react
```

#### TS2678: Type not comparable (4 errors)
**Files**: `BlogMain.tsx`
**Issue**: String literals not matching enum types

**Fix Strategy**:
Update enum definitions or add proper type guards.

---

## Implementation Plan

### Sprint 1 (This Week) - Target: 50 errors remaining

**Day 1**: ✅ Environment Setup
- [x] Exclude test files from tsconfig
- [ ] Create env.d.ts for process.env types
- [ ] Install missing @types packages

**Day 2**: Type Declarations
- [ ] Fix 25 TS2304 errors (top files)
- [ ] Fix all 27 TS2582 errors (process.env)
- [ ] Fix 10 TS2307 errors (imports)

**Day 3**: Import/Export Fixes
- [ ] Fix remaining TS2307 errors
- [ ] Fix all TS2305 errors (exports)
- [ ] Update barrel exports

### Sprint 2 (Next Week) - Target: 20 errors remaining

**Day 1**: Type Annotations
- [ ] Fix all TS7006 errors (implicit any)
- [ ] Fix TS2339 errors (missing properties)

**Day 2**: Type Compatibility
- [ ] Fix TS2322 errors (type assignments)
- [ ] Fix TS2345 errors (function arguments)
- [ ] Fix TS2678 errors (enum comparisons)

**Day 3**: Testing & Cleanup
- [ ] Run full build with TypeScript enabled
- [ ] Fix any new errors that appear
- [ ] Update documentation

### Sprint 3 (Later) - Target: 0 errors

- [ ] Enable strict mode incrementally
- [ ] Fix remaining edge cases
- [ ] Add comprehensive type tests
- [ ] Enable TypeScript in CI/CD

---

## Quick Fixes (Can Do Now)

### 1. Exclude Test Files
```json
// tsconfig.json
{
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/__tests__/**",
    "src/__tests__/**"
  ]
}
```

### 2. Add Environment Types
```typescript
// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_RUNTIME_URL?: string;
    NEXT_PUBLIC_GA_ID?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
```

### 3. Install Missing Types
```bash
npm install --save-dev @types/react-window
```

### 4. Fix Import Paths
Create proper barrel exports and use path aliases consistently.

---

## Files Requiring Immediate Attention

### Critical (Breaks functionality)
1. `src/app_runtime/runtime/components/ui/form.tsx`
   - Missing `Controller` export from react-hook-form
   - **Impact**: All forms will break

2. `src/app_runtime/runtime/components/custom/common/navigation/SidebarWithShadCN.tsx`
   - Missing UI component imports
   - **Impact**: Sidebar navigation broken

3. Form fields (TextField, TextAreaField)
   - Value type issues
   - **Impact**: Forms may not handle all data types

### High Priority (Type safety)
4. Grid component - implicit any
5. Blog components - layout type mismatches
6. Timeline/Pricing - missing properties

### Low Priority (Warnings)
7. Jest test setup
8. Missing package types
9. Minor type incompatibilities

---

## Success Metrics

| Phase | Target | Success Criteria |
|-------|--------|------------------|
| Phase 1 | 50 errors | ✅ Build succeeds, critical paths work |
| Phase 2 | 20 errors | ✅ No implicit any, proper types |
| Phase 3 | 0 errors | ✅ Strict mode enabled |

---

## Rollback Plan

If TypeScript enablement breaks production:

1. Revert `next.config.js` change (re-enable `ignoreBuildErrors`)
2. Deploy previous working version
3. Fix issues in development
4. Re-enable in next deploy

---

## Next Actions

1. ✅ Create this migration plan
2. ⏳ Fix Phase 1 errors (target: 50 errors)
3. ⏳ Create PR with incremental fixes
4. ⏳ Enable TypeScript checking
5. ⏳ Monitor production for issues

---

**Status**: 📋 **Plan Complete - Ready for Execution**

**Estimated Effort**:
- Phase 1: 2-3 days
- Phase 2: 2-3 days
- Phase 3: 1-2 weeks

**Total**: ~2-3 weeks for full migration
