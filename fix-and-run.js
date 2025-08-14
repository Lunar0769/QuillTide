#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 QuillTide Application Fixer and Runner\n');

// Function to run command and handle errors
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Check if MongoDB is running
function checkMongoDB() {
  try {
    execSync('tasklist | findstr mongod', { stdio: 'pipe' });
    console.log('✅ MongoDB is running');
    return true;
  } catch (error) {
    console.log('❌ MongoDB is not running');
    console.log('Please start MongoDB manually or install it if not installed');
    return false;
  }
}

// Fix environment files
function fixEnvironmentFiles() {
  console.log('\n📝 Checking environment files...');
  
  // Check server .env
  const serverEnvPath = path.join(__dirname, 'server', '.env');
  if (!fs.existsSync(serverEnvPath)) {
    console.log('Creating server .env file...');
    const serverEnvContent = `PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/QuillTide

# JWT
JWT_SECRET=quilltide_super_secret_jwt_key_2024_make_this_very_long_and_random_for_security_purposes_123456789
JWT_EXPIRE=7d

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=dhyvfzxpd
CLOUDINARY_API_KEY=438779117276946
CLOUDINARY_API_SECRET=uSvB59qtavwBexqcLEYrJ9BXuLU

# Frontend URL
CLIENT_URL=http://localhost:3000`;
    
    fs.writeFileSync(serverEnvPath, serverEnvContent);
    console.log('✅ Server .env file created');
  }
  
  // Check client .env
  const clientEnvPath = path.join(__dirname, 'client', '.env');
  if (!fs.existsSync(clientEnvPath)) {
    console.log('Creating client .env file...');
    const clientEnvContent = `REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=QuillTide
REACT_APP_APP_DESCRIPTION=Ultimate Blogging Platform`;
    
    fs.writeFileSync(clientEnvPath, clientEnvContent);
    console.log('✅ Client .env file created');
  }
}

// Install dependencies
function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  // Root dependencies
  if (!runCommand('npm install')) return false;
  
  // Server dependencies
  if (!runCommand('npm install', path.join(__dirname, 'server'))) return false;
  
  // Client dependencies
  if (!runCommand('npm install', path.join(__dirname, 'client'))) return false;
  
  console.log('✅ All dependencies installed');
  return true;
}

// Main execution
async function main() {
  console.log('Starting QuillTide setup and launch...\n');
  
  // Check MongoDB
  if (!checkMongoDB()) {
    console.log('\n⚠️  Please start MongoDB and run this script again');
    process.exit(1);
  }
  
  // Fix environment files
  fixEnvironmentFiles();
  
  // Install dependencies
  if (!installDependencies()) {
    console.log('\n❌ Failed to install dependencies');
    process.exit(1);
  }
  
  console.log('\n🚀 Starting application...');
  console.log('Server will be available at: http://localhost:5000');
  console.log('Client will be available at: http://localhost:3000');
  console.log('\nPress Ctrl+C to stop the application\n');
  
  // Start the application
  runCommand('npm run dev');
}

main().catch(console.error);