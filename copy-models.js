import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, 'node_modules', '@imgly', 'background-removal-data', 'dist');
const targetDir = path.join(__dirname, 'public', 'model');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('Copying AI Models from:', sourceDir);
console.log('To public folder:', targetDir);

try {
  if (fs.existsSync(sourceDir)) {
    const files = fs.readdirSync(sourceDir);
    files.forEach(file => {
      const sourceFile = path.join(sourceDir, file);
      const targetFile = path.join(targetDir, file);
      
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`Successfully copied: ${file}`);
    });
    console.log('✓ All AI Model and WASM assets successfully compiled to /public/model/');
  } else {
    console.error('Error: Source directory of @imgly/background-removal-data not found inside node_modules.');
  }
} catch (error) {
  console.error('Failed to copy AI models:', error);
}
