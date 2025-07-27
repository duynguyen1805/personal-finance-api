const fs = require('fs-extra');
const path = require('path');

async function copyTemplates() {
  try {
    const sourceDir = path.join(__dirname, '..', 'templates');
    const targetDir = path.join(__dirname, '..', 'dist', 'templates');
    
    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
      console.error('Source templates directory does not exist:', sourceDir);
      return;
    }
    
    // Copy templates directory
    await fs.copy(sourceDir, targetDir);
    console.log('Templates copied successfully to:', targetDir);
    
    // List copied files
    const files = await fs.readdir(targetDir);
    console.log('Copied files:', files);
    
  } catch (error) {
    console.error('Error copying templates:', error);
  }
}

copyTemplates(); 