# Cloudflare Workers Deployment Configuration

## Migration Complete ✅

Your project has been successfully migrated from Cloudflare Pages to Cloudflare Workers with static assets.

### Migration Details
- **Previous:** `@cloudflare/next-on-pages` → `@opennextjs/cloudflare` (Pages deployment)
- **Current:** `@opennextjs/cloudflare` with Workers configuration

## Deployment Configuration

### Workers Configuration

The project now uses Cloudflare Workers with static assets instead of Pages:

1. **Worker Entry Point:** `.open-next/worker.js`
2. **Static Assets:** `.open-next/assets`
3. **Configuration:** `wrangler.toml` (uses `[assets]` block instead of `pages_build_output_dir`)

### Deployment Methods

#### Option 1: Direct Deploy via Wrangler (Recommended)

```bash
# Build and deploy
npm run deploy
```

This will:
1. Build your Next.js app for Cloudflare
2. Deploy to Cloudflare Workers
3. Use the routes configured in `wrangler.toml`

#### Option 2: Manual Deployment

```bash
# Build first
npm run build:cloudflare

# Then deploy
wrangler deploy
```

### Step 2: Create R2 Bucket for Caching (Optional but Recommended)

For ISR (Incremental Static Regeneration) to work:

1. In Cloudflare Dashboard, go to **R2**
2. Create a new bucket named: `exepad-runtime-v1-cache`
3. The bucket binding in `wrangler.jsonc` is already configured

### Step 3: Trigger a New Deployment

After updating the settings:

1. Go to your project's **Deployments** tab
2. Click **Retry deployment** on the latest failed deployment, OR
3. Push a new commit to trigger a fresh deployment

## Local Development & Testing

```bash
# Run Next.js dev server (with OpenNext integration)
npm run dev

# Build and preview in Workers runtime locally
npm run preview

# Deploy to Cloudflare
npm run deploy
```

## What Changed

### Pages vs Workers

| Feature | Pages (Previous) | Workers (Current) |
|---------|-----------------|-------------------|
| Configuration | `pages_build_output_dir` | `[assets]` block |
| Entry Point | Automatic | `.open-next/worker.js` |
| Static Assets | Automatic serving | ASSETS binding |
| Deployment | Pages dashboard | `wrangler deploy` |
| Runtime | Edge + Node.js | Full Node.js runtime |
| Asset Limits | 20,000 files | 20,000 (free), 100,000 (paid) |

### Benefits
- ✅ Full Node.js runtime support
- ✅ All Next.js features supported
- ✅ Compatible with Next.js 15.5.2
- ✅ Build output: `.open-next`
- ✅ Proper middleware handling
- ✅ R2-based ISR caching
- ✅ More flexible routing and custom logic

## Files Changed

### From next-on-pages to OpenNext (Previous Migration)
- ✅ `package.json` - Updated scripts and dependencies
- ✅ `next.config.js` - Uses `initOpenNextCloudflareForDev()`
- ✅ `open-next.config.ts` - OpenNext adapter config
- ✅ `.dev.vars` - Development environment variables
- ✅ `public/_headers` - Static asset caching
- ✅ `.gitignore` - Excludes `.open-next` directory
- ✅ All page files - Removed `export const runtime = 'edge'`

### Pages to Workers Migration (Current)
- ✅ `wrangler.toml` - Now uses Workers configuration with `[assets]` block
- ✅ Worker entry point - Generated at `.open-next/worker.js`
- ✅ Static assets - Served from `.open-next/assets` via ASSETS binding

## Troubleshooting

### Build fails with "Edge Runtime" error
- Ensure you're using `npm run build:cloudflare`
- Verify `wrangler.toml` is properly configured

### Deployment fails
- Check that `.open-next/worker.js` exists after build
- Verify `wrangler.toml` has correct `main` and `[assets]` configuration
- Ensure you have proper Cloudflare authentication (`wrangler login`)

### Static assets not loading
- Verify `.open-next/assets` directory exists
- Check that ASSETS binding is configured in `wrangler.toml`
- Ensure `public/_headers` is in the right location

### R2 bucket errors
- Create the R2 bucket in Cloudflare dashboard
- Ensure bucket name matches: `exepad-runtime-cache`
- Uncomment the R2 configuration in `wrangler.toml`

### Worker not found or 404 errors
- Deploy using `npm run deploy` or `wrangler deploy`
- Check that routes are configured if using custom domains
- Verify the worker name matches in Cloudflare dashboard

## Support

- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Troubleshooting Guide](https://opennext.js.org/cloudflare/troubleshooting)
- [GitHub Issues](https://github.com/opennextjs/opennextjs-cloudflare/issues)
