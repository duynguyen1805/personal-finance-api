const path = require('path');
const fs = require('fs');

console.log('=== Template Path Test ===');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('');

// Test possible paths
const possiblePaths = [
  path.join(process.cwd(), 'templates', 'email', 'registration-confirmation.ejs'),
  path.join(process.cwd(), 'dist', 'templates', 'email', 'registration-confirmation.ejs'),
  path.join(__dirname, '..', 'templates', 'email', 'registration-confirmation.ejs'),
  path.join(__dirname, '..', 'dist', 'templates', 'email', 'registration-confirmation.ejs'),
  path.join(__dirname, '..', '..', 'templates', 'email', 'registration-confirmation.ejs'),
  path.join(__dirname, '..', '..', 'dist', 'templates', 'email', 'registration-confirmation.ejs')
];

console.log('Testing template paths:');
possiblePaths.forEach((templatePath, index) => {
  const exists = fs.existsSync(templatePath);
  console.log(`${index + 1}. ${templatePath}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  
  if (exists) {
    const stats = fs.statSync(templatePath);
    console.log(`   Size: ${stats.size} bytes, Modified: ${stats.mtime}`);
  }
});

console.log('');

// Test directory structure
const directories = [
  path.join(process.cwd(), 'templates'),
  path.join(process.cwd(), 'templates', 'email'),
  path.join(process.cwd(), 'dist'),
  path.join(process.cwd(), 'dist', 'templates'),
  path.join(process.cwd(), 'dist', 'templates', 'email')
];

console.log('Testing directory structure:');
directories.forEach((dir, index) => {
  const exists = fs.existsSync(dir);
  console.log(`${index + 1}. ${dir}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  
  if (exists) {
    try {
      const items = fs.readdirSync(dir);
      console.log(`   Contents: ${items.join(', ')}`);
    } catch (error) {
      console.log(`   Error reading directory: ${error.message}`);
    }
  }
});

console.log('');
console.log('=== End Test ==='); 