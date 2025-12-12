# Side-by-Side Comparison: wrangler.toml Changes

## Before (Cloudflare Pages)

```toml
name = "exepad-runtime-v1"
compatibility_date = "2025-11-17"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".open-next"

# Environment variables
[vars]
NEXT_PUBLIC_BACKEND_URL = "https://backend.exepad.com"
NEXT_PUBLIC_API_URL = "https://backend.exepad.com"
RUNTIME_SERVICE_API_KEY = "13ff45abca7de8ba1318bdd7e95ebb72f82cfe6dbe484d0c1755e154aa0be0c6"

# Uncomment to enable R2 incremental cache (requires creating R2 buckets first)
#[[r2_buckets]]
#binding = "NEXT_INC_CACHE_R2_BUCKET"
#bucket_name = "exepad-runtime-cache"
#preview_bucket_name = "exepad-runtime-cache-preview"
```

## After (Cloudflare Workers)

```toml
name = "exepad-runtime-v1"
main = ".open-next/worker.js"                    # ← NEW: Worker entry point
compatibility_date = "2025-11-17"
compatibility_flags = ["nodejs_compat"]

# Static assets configuration (replaces pages_build_output_dir)
[assets]                                          # ← NEW: Assets block
directory = ".open-next/assets"                   # ← NEW: Assets directory
binding = "ASSETS"                                # ← NEW: Assets binding

# Durable Objects for caching (required by OpenNext)
[[durable_objects.bindings]]                      # ← NEW: Durable Object 1
name = "DO_QUEUE"
class_name = "DOQueueHandler"

[[durable_objects.bindings]]                      # ← NEW: Durable Object 2
name = "DO_SHARDED_TAG_CACHE"
class_name = "DOShardedTagCache"

[[durable_objects.bindings]]                      # ← NEW: Durable Object 3
name = "BUCKET_CACHE_PURGE"
class_name = "BucketCachePurge"

# Durable Objects migrations
[[migrations]]                                    # ← NEW: Required for DO
tag = "v1"
new_classes = ["DOQueueHandler", "DOShardedTagCache", "BucketCachePurge"]

# Environment variables
[vars]
NEXT_PUBLIC_BACKEND_URL = "https://backend.exepad.com"
NEXT_PUBLIC_API_URL = "https://backend.exepad.com"
RUNTIME_SERVICE_API_KEY = "13ff45abca7de8ba1318bdd7e95ebb72f82cfe6dbe484d0c1755e154aa0be0c6"

# Uncomment to enable R2 incremental cache (requires creating R2 buckets first)
#[[r2_buckets]]
#binding = "NEXT_INC_CACHE_R2_BUCKET"
#bucket_name = "exepad-runtime-cache"
#preview_bucket_name = "exepad-runtime-cache-preview"
```

## Key Changes Explained

### 1. Worker Entry Point

**Before:**
```toml
# No entry point - Pages automatically handled it
pages_build_output_dir = ".open-next"
```

**After:**
```toml
main = ".open-next/worker.js"
```

**Why:** Workers need an explicit entry point. OpenNext.js generates this file automatically.

### 2. Static Assets Configuration

**Before:**
```toml
pages_build_output_dir = ".open-next"
```

**After:**
```toml
[assets]
directory = ".open-next/assets"
binding = "ASSETS"
```

**Why:** Workers serve static assets via a binding instead of automatic directory serving.

### 3. Durable Objects

**Before:**
```toml
# Not available in Pages configuration
```

**After:**
```toml
[[durable_objects.bindings]]
name = "DO_QUEUE"
class_name = "DOQueueHandler"

[[durable_objects.bindings]]
name = "DO_SHARDED_TAG_CACHE"
class_name = "DOShardedTagCache"

[[durable_objects.bindings]]
name = "BUCKET_CACHE_PURGE"
class_name = "BucketCachePurge"

[[migrations]]
tag = "v1"
new_classes = ["DOQueueHandler", "DOShardedTagCache", "BucketCachePurge"]
```

**Why:** OpenNext.js uses Durable Objects for advanced caching. These must be explicitly configured in Workers.

## What Didn't Change

✅ Worker name: `exepad-runtime-v1`  
✅ Compatibility settings  
✅ Environment variables  
✅ R2 bucket configuration (commented)

## Validation Results

```bash
$ npx wrangler deploy --dry-run

✅ Total Upload: 9939.64 KiB / gzip: 2226.12 KiB
✅ Bindings configured:
   - env.DO_QUEUE (DOQueueHandler)
   - env.DO_SHARDED_TAG_CACHE (DOShardedTagCache)
   - env.BUCKET_CACHE_PURGE (BucketCachePurge)
   - env.ASSETS
   - env.NEXT_PUBLIC_BACKEND_URL
   - env.NEXT_PUBLIC_API_URL
   - env.RUNTIME_SERVICE_API_KEY

✅ No warnings or errors
```

## Summary

| Configuration | Before (Pages) | After (Workers) |
|--------------|----------------|-----------------|
| Entry Point | Auto | `.open-next/worker.js` |
| Assets Config | `pages_build_output_dir` | `[assets]` block |
| Durable Objects | N/A | 3 configured |
| Migrations | N/A | v1 migration |
| Total Lines | 17 | 40 |
| Breaking Changes | N/A | **NONE** |

---

**Result:** ✅ Ready to deploy as a Cloudflare Worker!
