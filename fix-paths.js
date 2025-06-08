const fs = require("fs");
const path = require("path");

// Function to recursively get all .ts files
async function getFiles(dir) {
  const subdirs = await fs.promises.readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = path.resolve(dir, subdir);
      return (await fs.promises.stat(res)).isDirectory() ? getFiles(res) : res;
    })
  );
  return files.flat().filter((file) => file.endsWith(".ts"));
}

// Function to update imports in a file
async function fixImportsInFile(filePath) {
  try {
    let content = await fs.promises.readFile(filePath, "utf8");

    // Replace backslashes in imports with forward slashes
    const importRegex = /from ['"](\.\.?\\[^'"]+)['"]/g;
    let updated = false;

    if (importRegex.test(content)) {
      content = content.replace(importRegex, (match, importPath) => {
        const fixedPath = importPath.replace(/\\/g, "/");
        updated = true;
        return `from '${fixedPath}'`;
      });

      await fs.promises.writeFile(filePath, content, "utf8");
    }

    return updated;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  try {
    const srcDir = path.join(__dirname, "src");
    const files = await getFiles(srcDir);

    let updatedCount = 0;
    for (const file of files) {
      const updated = await fixImportsInFile(file);
      if (updated) {
        console.log(`Updated imports in: ${file}`);
        updatedCount++;
      }
    }

    console.log(`\nDone! Updated imports in ${updatedCount} files.`);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
