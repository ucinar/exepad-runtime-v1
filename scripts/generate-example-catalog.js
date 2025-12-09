#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
const stripExamples = args.includes('--strip-examples');

// Source and output directories
const sourceDir = "public/example/apps/webapp";
const outputDir = "src/app_runtime/schemas/examples";

// Define the subcategories to process
const subcategories = [
    "blocks",
    "skeleton",
    "components",
    "forms",
    "blog",
    "full"
];

console.log("🔄 Generating example catalogs and copying files...");
console.log(`📂 Source: ${sourceDir}`);
console.log(`📁 Output Directory: ${outputDir}`);
console.log(`📋 Subcategories: ${subcategories.join(", ")}`);
if (stripExamples) {
    console.log(`✂️  Strip examples mode: ENABLED`);
}

/**
 * Strip fields from example based on category
 */
function stripExampleFields(jsonData, category) {
    const data = { ...jsonData };
    
    switch (category) {
        case 'blocks':
        case 'blog':
        case 'components':
        case 'forms':
            // Set header, footer, theme, languages to empty arrays/objects
            data.header = [];
            data.footer = [];
            data.theme = {};
            data.languages = [];
            break;
            
        case 'skeleton':
            // Set pages and theme to empty arrays/objects
            data.pages = [];
            data.theme = {};
            break;
            
        case 'full':
            // Do not strip full examples
            break;
    }
    
    return data;
}

/**
 * Recursively copy directory structure
 */
function copyDirectoryRecursive(src, dest, category = null) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectoryRecursive(srcPath, destPath, category);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            if (stripExamples && category) {
                // Read, strip, and write the JSON file
                try {
                    const content = fs.readFileSync(srcPath, 'utf8');
                    const jsonData = JSON.parse(content);
                    const strippedData = stripExampleFields(jsonData, category);
                    fs.writeFileSync(destPath, JSON.stringify(strippedData, null, 2), 'utf8');
                } catch (error) {
                    console.error(`❌ Error processing ${srcPath}:`, error.message);
                    // Fallback to simple copy if there's an error
                    fs.copyFileSync(srcPath, destPath);
                }
            } else {
                // Simple copy without modification
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
}

/**
 * Recursively process JSON files and extract summaries
 */
function processJsonFiles(dir, catalogEntries = {}, basePath = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;

        if (entry.isDirectory()) {
            processJsonFiles(fullPath, catalogEntries, relativePath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const jsonData = JSON.parse(content);
                
                // Create simple catalog entry (id: summary)
                const exampleID = path.basename(entry.name, '.json');
                const summary = jsonData.summary || jsonData.shortSummary || "No description available";
                
                catalogEntries[exampleID] = summary;
                
            } catch (error) {
                console.error(`❌ Error processing ${fullPath}:`, error.message);
                const exampleID = path.basename(entry.name, '.json');
                catalogEntries[exampleID] = "Error reading file";
            }
        }
    }

    return catalogEntries;
}

try {
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created directory: ${outputDir}`);
    }

    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
        throw new Error(`Source directory not found: ${sourceDir}`);
    }

    const stats = {
        totalFiles: 0,
        processedFiles: 0,
        categoryCounts: {}
    };

    const allCatalogs = {};

    // Process each subcategory
    for (const subcategory of subcategories) {
        const categorySourceDir = path.join(sourceDir, subcategory);
        const categoryOutputDir = path.join(outputDir, subcategory);
        
        if (!fs.existsSync(categorySourceDir)) {
            console.log(`⚠️  Skipping ${subcategory}: directory not found`);
            continue;
        }

        console.log(`\n📂 Processing category: ${subcategory}`);
        
        // Copy directory structure and files
        console.log(`   📋 Copying files...`);
        copyDirectoryRecursive(categorySourceDir, categoryOutputDir, subcategory);
        
        // Process JSON files and create catalog (simple key-value format)
        console.log(`   🔍 Extracting metadata...`);
        const catalog = processJsonFiles(categorySourceDir);
        
        // Write individual category catalog
        const catalogPath = path.join(outputDir, `catalog_${subcategory}.json`);
        fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf8");
        
        const exampleCount = Object.keys(catalog).length;
        stats.categoryCounts[subcategory] = exampleCount;
        stats.processedFiles += exampleCount;
        
        // Add to all catalogs
        allCatalogs[`webapp_${subcategory}`] = catalog;
        
        console.log(`   ✅ Processed ${exampleCount} examples`);
        console.log(`   💾 Catalog saved: ${path.relative(process.cwd(), catalogPath)}`);
    }

    // Create a master catalog with all subcategories
    const masterCatalog = allCatalogs;

    const masterCatalogPath = path.join(outputDir, "catalog_master.json");
    fs.writeFileSync(masterCatalogPath, JSON.stringify(masterCatalog, null, 2), "utf8");

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("✨ Example catalog generation complete!");
    console.log("=".repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Total categories processed: ${Object.keys(stats.categoryCounts).length}`);
    console.log(`   Total examples processed: ${stats.processedFiles}`);
    console.log(`\n📋 Breakdown by category:`);
    
    for (const [category, count] of Object.entries(stats.categoryCounts)) {
        console.log(`   🔸 webapp_${category}: ${count} examples`);
    }
    
    console.log(`\n📁 Output location: ${path.relative(process.cwd(), outputDir)}`);
    console.log(`📝 Master catalog: ${path.relative(process.cwd(), masterCatalogPath)}`);
    console.log(`\n💡 Individual catalogs:`);
    
    for (const subcategory of subcategories) {
        if (stats.categoryCounts[subcategory]) {
            const catalogPath = path.join(outputDir, `catalog_${subcategory}.json`);
            console.log(`   • ${path.relative(process.cwd(), catalogPath)}`);
        }
    }

} catch (error) {
    console.error("❌ Error generating example catalogs:", error);
    process.exit(1);
}
