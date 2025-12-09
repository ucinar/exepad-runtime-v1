# Schema Pipeline Runner

## Overview
`run_schema_pipeline.sh` is an automated pipeline script that executes all schema generation, validation, and deployment steps in the correct order with comprehensive error checking and progress reporting.

## Usage

### Basic Usage
```bash
./run_schema_pipeline.sh
```

### From npm
You can also add this to `package.json` scripts if desired:
```json
{
  "scripts": {
    "pipeline": "./run_schema_pipeline.sh"
  }
}
```

Then run:
```bash
npm run pipeline
```

## Pipeline Steps

The script executes the following steps in order:

1. **test:public_examples** - Validates all public examples
   - Ensures all examples pass validation before generation
   - Aborts pipeline if validation fails

2. **gen:schemas:full** - Generates full schema catalog
   - Creates complete schema definitions
   - Generates schema documentation

3. **gen:icons:lucide** - Generates Lucide icons list
   - Extracts available Lucide icons
   - Creates icon reference file

4. **gen:schemas:examples:stripped** - Generates stripped examples
   - Creates examples with minimal data (no header/footer/theme)
   - Optimized for LLM usage

5. **gen:schemas:examples** - Generates full examples
   - Creates complete examples with all data
   - Includes header, footer, theme, languages

6. **gen:schemas:push** - Pushes schemas to agent directory
   - Copies generated schemas to `../../agent_cloud_run/main_agent/schemas`
   - Makes schemas available to the agent

## Features

### ✅ Error Checking
- Validates exit code of each step
- Aborts pipeline immediately if any step fails
- Provides clear error messages

### 📊 Progress Reporting
- Color-coded output for easy reading
- Step-by-step progress indicators
- Timing information for each step
- Final execution summary

### ⏱️ Performance Tracking
- Tracks duration of each step
- Reports total pipeline execution time
- Provides performance breakdown

### 🎨 Visual Output
- Color-coded status messages (green for success, red for errors)
- Clear section headers and separators
- Progress indicators for each step
- Comprehensive final report

## Example Output

```
════════════════════════════════════════════════════════════════════
🚀 Schema Pipeline Runner
════════════════════════════════════════════════════════════════════

Pipeline Steps:
  1. Test public examples
  2. Generate full schemas
  3. Generate Lucide icons
  4. Generate stripped examples
  5. Generate full examples
  6. Push schemas to agent

ℹ️  Working directory: /path/to/project

▶ Step 1: Testing public examples validation
   Command: npm run test:public_examples

[... npm output ...]

✅ Step 1 completed successfully (5s)

▶ Step 2: Generating full schema catalog
   Command: npm run gen:schemas:full

[... npm output ...]

✅ Step 2 completed successfully (12s)

[... continues for all steps ...]

════════════════════════════════════════════════════════════════════
📊 Pipeline Execution Report
════════════════════════════════════════════════════════════════════

Execution Summary:
  Total Steps: 6
  Completed: 6
  Failed: 0
  Total Time: 2m 35s

✅ All pipeline steps completed successfully!

Step Timings:
  1. test:public_examples          : 5s
  2. gen:schemas:full              : 12s
  3. gen:icons:lucide              : 3s
  4. gen:schemas:examples:stripped : 45s
  5. gen:schemas:examples          : 48s
  6. gen:schemas:push              : 2s

ℹ️  Schemas are ready and pushed to the agent directory
ℹ️  You can now use the updated schemas in your application
```

## Exit Codes

- `0` - All steps completed successfully
- `1` - One or more steps failed

## Error Handling

The script will:
- Stop immediately if any step fails
- Display which step failed
- Show the exit code of the failed command
- Provide suggestions for fixing issues
- Display a summary of completed vs failed steps

## Requirements

- **bash** 4.0 or higher
- **npm** with all dependencies installed
- All npm scripts must be defined in `package.json`:
  - `test:public_examples`
  - `gen:schemas:full`
  - `gen:icons:lucide`
  - `gen:schemas:examples:stripped`
  - `gen:schemas:examples`
  - `gen:schemas:push`

## Troubleshooting

### Script won't execute
Make sure the script is executable:
```bash
chmod +x run_schema_pipeline.sh
```

### Step fails with validation errors
1. Check the error output from the failed step
2. Fix the validation errors in your examples/schemas
3. Run the pipeline again

### Permission denied on schema push
Make sure the target directory exists and you have write permissions:
```bash
mkdir -p ../../agent_cloud_run/main_agent/schemas
```

### Colors not displaying
If running in an environment that doesn't support ANSI colors, colors will appear as escape codes. The script should still function correctly.

## Best Practices

1. **Run before commits**: Execute the pipeline before committing schema changes
2. **Check output**: Review the timing information to identify slow steps
3. **Fix errors promptly**: Don't ignore validation errors
4. **Regular execution**: Run the pipeline regularly during development
5. **CI/CD integration**: Consider adding this to your CI/CD pipeline

## Development

To modify the pipeline:
1. Edit `run_schema_pipeline.sh`
2. Add new steps using the `execute_step` function
3. Update the step count in the final report
4. Test thoroughly before committing

## Notes

- The script must be run from the project root directory
- All npm scripts must exist in `package.json`
- The script will abort on the first error
- Timing information helps identify bottlenecks
- Color output enhances readability but is not required for functionality

