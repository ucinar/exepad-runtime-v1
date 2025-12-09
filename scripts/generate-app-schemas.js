#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = "src/app_runtime/schemas/apps/apps.json";
const interfacesDir = "src/app_runtime/interfaces/apps";

console.log("🔄 Generating JSON schemas for apps from TypeScript interfaces...");
console.log(`📂 Source: ${interfacesDir}/**/*.ts`);
console.log(`📝 Schema Output: ${outputPath}`);

try {
    // Create the output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created directory: ${outputDir}`);
    }

    // Generate schema using CLI command directly
    console.log("🔍 Generating apps schema using CLI command...");
    
    const cliCommand = `npx ts-json-schema-generator --path "src/app_runtime/interfaces/apps/*.ts" --type "*"`;
    console.log(`📋 Running: ${cliCommand}`);
    
    const schemaOutput = execSync(cliCommand, { encoding: 'utf8' });
    const schema = JSON.parse(schemaOutput);
    
    if (!schema.definitions) {
        throw new Error("No schema definitions were generated");
    }

    console.log(`📊 Generated ${Object.keys(schema.definitions).length} total definitions`);

    // Ensure ComponentProps and SubComponentProps allow additional properties
    if (schema.definitions && schema.definitions.ComponentProps) {
        schema.definitions.ComponentProps.additionalProperties = true;
        console.log("✅ Set ComponentProps.additionalProperties = true");
    }
    
    if (schema.definitions && schema.definitions.SubComponentProps) {
        schema.definitions.SubComponentProps.additionalProperties = true;
        console.log("✅ Set SubComponentProps.additionalProperties = true");
    }

    // Write the schema to file
    const schemaString = JSON.stringify(schema, null, 2);
    fs.writeFileSync(outputPath, schemaString, "utf8");
    
    console.log("✅ Apps JSON schema generated successfully!");
    console.log(`📊 Generated ${Object.keys(schema.definitions).length} total type definitions`);
    
} catch (error) {
    console.error("❌ Error generating apps schema:", error);
    process.exit(1);
} 