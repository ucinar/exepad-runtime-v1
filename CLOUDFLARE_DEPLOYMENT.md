# Cloudflare Pages Deployment Configuration

## Migration Complete ✅

Your project has been successfully migrated from `@cloudflare/next-on-pages` to `@opennextjs/cloudflare`.

## Required: Update Cloudflare Pages Settings

**IMPORTANT:** You must update your Cloudflare Pages project settings to use the new build process.

### Step 1: Update Build Configuration in Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Select your `exepad-runtime-v1` project
4. Go to **Settings** → **Builds & deployments**
5. Click **Configure Production deployments** or **Edit configuration**
6. Update the following settings:

   ```
   Build command: npm run build:cloudflare
   Build output directory: .open-next
   Root directory: /
   ```

7. Click **Save**

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

### Before (next-on-pages)
- ❌ Edge runtime only
- ❌ Limited Node.js API support
- ❌ Incompatible with Next.js 16
- ❌ Build output: `.vercel/output/static`

### After (OpenNext Cloudflare)
- ✅ Full Node.js runtime support
- ✅ All Next.js features supported
- ✅ Compatible with Next.js 15.5.2
- ✅ Build output: `.open-next`
- ✅ Proper middleware handling
- ✅ R2-based ISR caching

## Files Changed

- ✅ `package.json` - Updated scripts and dependencies
- ✅ `next.config.js` - Uses `initOpenNextCloudflareForDev()`
- ✅ `wrangler.jsonc` - New OpenNext configuration
- ✅ `open-next.config.ts` - OpenNext adapter config
- ✅ `.dev.vars` - Development environment variables
- ✅ `public/_headers` - Static asset caching
- ✅ `.gitignore` - Excludes `.open-next` directory
- ✅ All page files - Removed `export const runtime = 'edge'`

## Troubleshooting

### Build fails with "Edge Runtime" error
- Make sure you updated the Cloudflare Pages build command to `npm run build`
- Verify `wrangler.jsonc` exists and `wrangler.toml` is deleted

### Infinite loop errors
- These should now be fixed with OpenNext's proper Next.js 15 support
- If issues persist, check middleware logs

### R2 bucket errors
- Create the R2 bucket in Cloudflare dashboard
- Ensure bucket name matches: `exepad-runtime-v1-cache`

## Support

- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Troubleshooting Guide](https://opennext.js.org/cloudflare/troubleshooting)
- [GitHub Issues](https://github.com/opennextjs/opennextjs-cloudflare/issues)
