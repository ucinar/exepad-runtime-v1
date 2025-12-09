#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔄 Generating Lucide icon names list...");

const outputDir = "src/app_runtime/schemas/icons";
const outputPath = path.join(outputDir, "lucide_icons.txt");

async function generateLucideIconsList() {
  try {
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created directory: ${outputDir}`);
    }

    // Import the actual icon exports from lucide-react
    console.log("📦 Loading lucide-react icon exports...");
    
    // Use dynamic import to load the actual icons object
    const { icons } = await import("lucide-react");
    
    // Extract icon names from the actual exports
    const iconNames = Object.keys(icons);
    
    console.log(`📊 Found ${iconNames.length} importable Lucide icons`);
    
    // Convert PascalCase names to kebab-case for consistency with your naming convention
    const kebabCaseNames = iconNames.map(name => {
      // Convert PascalCase to kebab-case
      return name.replace(/([A-Z])/g, (match, letter, index) => {
        return index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`;
      });
    });
    
    // Sort the icon names alphabetically for better organization
    const sortedIconNames = kebabCaseNames.sort();
    
    // Create the content with one icon name per line
    const content = sortedIconNames.join('\n') + '\n';
    
    // Write to the output file
    fs.writeFileSync(outputPath, content, 'utf8');
    
    console.log(`✅ Successfully generated icon list: ${outputPath}`);
    console.log(`📈 Total importable icons: ${sortedIconNames.length}`);
    
    // Show first 10 icons as a preview
    console.log("🔍 Preview (first 10 icons):");
    sortedIconNames.slice(0, 10).forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`);
    });
    
    if (sortedIconNames.length > 10) {
      console.log(`   ... and ${sortedIconNames.length - 10} more`);
    }
    
    // Show the mapping for the problematic icon as an example
    const checkCircleIndex = sortedIconNames.findIndex(name => name.includes('circle-check'));
    if (checkCircleIndex !== -1) {
      console.log(`\n🔍 Example mapping: "check-circle" should be "${sortedIconNames[checkCircleIndex]}"`);
    }
    
  } catch (error) {
    console.error("❌ Error generating Lucide icons list:", error);
    process.exit(1);
  }
}

// Run the generator
generateLucideIconsList();