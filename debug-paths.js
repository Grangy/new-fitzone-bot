#!/usr/bin/env node

console.log('=== PATH DEBUG ===');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('__filename:', __filename);

const fs = require('fs');
const path = require('path');

// Check if dist/index.js exists
const distPath = path.join(process.cwd(), 'dist', 'index.js');
console.log('Looking for:', distPath);
console.log('File exists:', fs.existsSync(distPath));

// List all files in current directory
console.log('\n=== DIRECTORY CONTENTS ===');
try {
  const files = fs.readdirSync(process.cwd());
  console.log('Root files:', files);
} catch (err) {
  console.error('Error reading directory:', err.message);
}

// List files in dist directory if it exists
const distDir = path.join(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  console.log('\n=== DIST DIRECTORY CONTENTS ===');
  try {
    const distFiles = fs.readdirSync(distDir);
    console.log('Dist files:', distFiles);
  } catch (err) {
    console.error('Error reading dist directory:', err.message);
  }
} else {
  console.log('\n=== DIST DIRECTORY DOES NOT EXIST ===');
}

console.log('\n=== ENVIRONMENT ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PWD:', process.env.PWD);
