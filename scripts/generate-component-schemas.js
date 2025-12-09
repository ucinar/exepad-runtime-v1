#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = "src/app_runtime/schemas/components/components.json";
const catalogPath = "src/app_runtime/schemas/components/catalog.json";
const interfacesDir = "src/app_runtime/interfaces/components";

console.log("🔄 Generating JSON schemas from TypeScript interfaces...");
console.log(`📂 Source: ${interfacesDir}/**/*.ts`);
console.log(`📝 Schema Output: ${outputPath}`);
console.log(`📝 Catalog Output: ${catalogPath}`);

try {
    // Create the output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created directory: ${outputDir}`);
    }

    // Generate schema using CLI command directly (this works perfectly)
    console.log("🔍 Generating complete schema using CLI command...");
    
    const cliCommand = `npx ts-json-schema-generator --path "src/app_runtime/interfaces/components/**/*.ts" --type "*" --no-type-check --jsDoc extended`;
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

    // Now read each file recursively to determine categories for each interface
    const getAllTsFiles = (dir) => {
        let files = [];
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                files = files.concat(getAllTsFiles(fullPath));
            } else if (item.endsWith('.ts') && item !== 'index.ts') {
                files.push(fullPath);
            }
        }
        return files;
    };
    
    const interfaceFiles = getAllTsFiles(interfacesDir);

    console.log(`📋 Found ${interfaceFiles.length} interface files`);

    // Create mapping of interface names to their source files and identify SubComponents
    const interfaceToCategory = new Map();
    const subComponentInterfaces = new Set();
    
    for (const filePath of interfaceFiles) {
        const relativePath = path.relative(interfacesDir, filePath);
        const category = path.dirname(relativePath).replace(/[\\/]/g, '/'); // Normalize path separators
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract exported interfaces from the file content
        const interfaceMatches = content.match(/export\s+interface\s+(\w+)/g);
        const typeMatches = content.match(/export\s+type\s+(\w+)/g);
        
        // Find interfaces that extend SubComponentProps
        const subComponentMatches = content.match(/export\s+interface\s+(\w+)\s+extends\s+SubComponentProps/g);
        if (subComponentMatches) {
            subComponentMatches.forEach(match => {
                const interfaceName = match.replace(/export\s+interface\s+(\w+)\s+extends\s+SubComponentProps.*/, '$1');
                subComponentInterfaces.add(interfaceName);
                console.log(`🔸 Found SubComponent: ${interfaceName}`);
            });
        }
        
        if (interfaceMatches) {
            interfaceMatches.forEach(match => {
                const interfaceName = match.replace(/export\s+interface\s+/, '');
                interfaceToCategory.set(interfaceName, category);
            });
        }
        
        if (typeMatches) {
            typeMatches.forEach(match => {
                const typeName = match.replace(/export\s+type\s+/, '');
                interfaceToCategory.set(typeName, category);
            });
        }
        
        console.log(`📝 ${relativePath}: Found ${(interfaceMatches?.length || 0) + (typeMatches?.length || 0)} exports`);
    }

    console.log(`🔸 Found ${subComponentInterfaces.size} SubComponent interfaces that will be excluded from catalog`);

    // Add categories to schema definitions and create catalog
    let catalog = [];
    let categorizedCount = 0;
    let excludedCount = 0;

    Object.keys(schema.definitions).forEach(definitionName => {
        const definition = schema.definitions[definitionName];
        const category = interfaceToCategory.get(definitionName) || 'utils'; // default to utils
        
        definition.category = category;
        categorizedCount++;
        
        // Create catalog entry for object types, but exclude SubComponents
        if (definition.type === "object") {
            // Skip if this interface extends SubComponentProps
            if (subComponentInterfaces.has(definitionName)) {
                console.log(`🚫 Excluding SubComponent from catalog: ${definitionName}`);
                excludedCount++;
                return;
            }
            
            const catalogEntry = {
                componentType: definitionName,
                description: definition.description || "No description available",
                keyProperties: [],
                category: category.charAt(0).toUpperCase() + category.slice(1)
            };
            
            // Extract key properties (required + some important optional ones)
            if (definition.required && Array.isArray(definition.required)) {
                catalogEntry.keyProperties = definition.required
                    .filter(prop => prop !== "componentType" && prop !== "id") // Exclude common props
                    .slice(0, 6); // Limit to 6 key properties
            }
            
            // Add some important optional properties if we have few required ones
            if (catalogEntry.keyProperties.length < 4 && definition.properties) {
                const optionalProps = Object.keys(definition.properties)
                    .filter(prop =>
                        !catalogEntry.keyProperties.includes(prop) &&
                        prop !== "componentType" &&
                        prop !== "id" &&
                        prop !== "classes"
                    )
                    .slice(0, 4 - catalogEntry.keyProperties.length);
                catalogEntry.keyProperties.push(...optionalProps);
            }
            
            catalog.push(catalogEntry);
        }
    });

    // Write the schema to file
    const schemaString = JSON.stringify(schema, null, 2);
    fs.writeFileSync(outputPath, schemaString, "utf8");
    
    // Write the catalog to file
    const catalogString = JSON.stringify(catalog, null, 2);
    fs.writeFileSync(catalogPath, catalogString, "utf8");
    
    console.log("✅ JSON schemas generated successfully!");
    console.log(`📊 Generated ${Object.keys(schema.definitions).length} total type definitions`);
    console.log(`🏷️  Categorized ${categorizedCount} definitions`);
    console.log(`📋 Generated ${catalog.length} catalog entries`);
    console.log(`🚫 Excluded ${excludedCount} SubComponent interfaces from catalog`);
    
} catch (error) {
    console.error("❌ Error generating schemas:", error);
    process.exit(1);
}