# Quick Reference: --strip-examples Parameter

## TL;DR

```bash
# Normal generation (keeps all data)
npm run gen:schemas:examples

# Stripped generation (removes header/footer/theme/languages)
npm run gen:schemas:examples:stripped
```

## What Gets Stripped?

| Category | Stripped Fields |
|----------|----------------|
| blocks | `header`, `footer`, `theme`, `languages` → `[]` or `{}` |
| blog | `header`, `footer`, `theme`, `languages` → `[]` or `{}` |
| components | `header`, `footer`, `theme`, `languages` → `[]` or `{}` |
| forms | `header`, `footer`, `theme`, `languages` → `[]` or `{}` |
| skeleton | `pages`, `theme` → `[]` or `{}` |
| full | **Nothing** (preserved completely) |

## Why Use It?

✅ **Use `--strip-examples` when:**
- Sending examples to LLMs (reduces token usage)
- You only need page content, not headers/footers
- Creating simplified demos or documentation
- Testing with minimal data

❌ **Don't use `--strip-examples` when:**
- You need complete, functional examples
- Header/footer/theme data is required
- Running validation tests
- Deploying to production

## Visual Example

### Before (`npm run gen:schemas:examples`)
```json
{
  "name": "My Block",
  "header": [{ "componentType": "Header", "content": [...] }],
  "footer": [{ "componentType": "Footer", "content": [...] }],
  "theme": { "light": {...}, "dark": {...} },
  "languages": [{ "code": "en", "nameEnglish": "English" }],
  "pages": [{ "title": "Home", "content": [...] }]
}
```

### After (`npm run gen:schemas:examples:stripped`)
```json
{
  "name": "My Block",
  "header": [],
  "footer": [],
  "theme": {},
  "languages": [],
  "pages": [{ "title": "Home", "content": [...] }]
}
```

## Command Line Usage

```bash
# Using npm scripts (recommended)
npm run gen:schemas:examples:stripped

# Direct node execution
node scripts/generate-example-catalog.js --strip-examples

# Without stripping (default)
node scripts/generate-example-catalog.js
```

## Output Indicator

When stripping is enabled, you'll see:
```
✂️  Strip examples mode: ENABLED
```

---

For detailed documentation, see: `scripts/STRIP_EXAMPLES_DOCUMENTATION.md`

