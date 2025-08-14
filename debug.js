#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkFiles() {
  const requiredFiles = [
    'server/.env',
    'client/.env',
    'server/server.js',
    'client/src/App.js',
    'client/src/services/api.js'
  ];
  
  console.log('📁 Checking required files...');
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
    }
  }
}

function checkPorts() {
  const net = require('net');
  
  function checkPort(port, name) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.close(() => resolve(`❌ ${name} (port ${port}) - Available (not running)`));
      });
      server.on('error', () => resolve(`✅ ${name} (port ${port}) - In use (running)`));
    });
  }
  
  Promise.all([
    checkPort(3000, 'React Client'),
    checkPort(5000, 'Express Server')
  ]).then(results => {
    console.log('\n🔌 Port Status:');
    results.forEach(result => console.log(result));
  });
}

function main() {
  console.log('🐛 QuillTide Debug Helper\n');
  checkFiles();
  checkPorts();
}

if (require.main === module) {
  main();
}