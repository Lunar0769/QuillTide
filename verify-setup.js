#!/usr/bin/env node

const http = require('http');

function testAPI() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`API returned ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Timeout')));
    req.end();
  });
}

async function verifySetup() {
  console.log('🔍 Verifying QuillTide setup...');
  
  try {
    const response = await testAPI();
    console.log('✅ Server is running:', response.message);
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('📡 Backend: http://localhost:5000');
    console.log('\n🎉 QuillTide is ready to use!');
  } catch (error) {
    console.log('❌ Server not responding:', error.message);
    console.log('\n🔧 Please run: npm run dev');
  }
}

if (require.main === module) {
  verifySetup();
}

module.exports = { testAPI, verifySetup };