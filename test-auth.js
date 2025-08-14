#!/usr/bin/env node

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuth() {
  console.log('🔐 Testing Authentication System...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing server health...');
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    
    if (health.status === 200) {
      console.log('✅ Server is healthy');
    } else {
      console.log('❌ Server health check failed:', health.status);
      return;
    }
    
    // Test 2: Registration
    console.log('\n2. Testing user registration...');
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123'
    };
    
    const registerResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, testUser);
    
    if (registerResult.status === 201) {
      console.log('✅ Registration successful');
      console.log('Token received:', !!registerResult.data.token);
      
      // Test 3: Login with the same user
      console.log('\n3. Testing user login...');
      const loginResult = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        identifier: testUser.email,
        password: testUser.password
      });
      
      if (loginResult.status === 200) {
        console.log('✅ Login successful');
        console.log('Token received:', !!loginResult.data.token);
        
        // Test 4: Protected route
        console.log('\n4. Testing protected route...');
        const meResult = await makeRequest({
          hostname: 'localhost',
          port: 5000,
          path: '/api/auth/me',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginResult.data.token}`
          }
        });
        
        if (meResult.status === 200) {
          console.log('✅ Protected route access successful');
          console.log('User data received:', !!meResult.data.user);
        } else {
          console.log('❌ Protected route failed:', meResult.status, meResult.data);
        }
        
      } else {
        console.log('❌ Login failed:', loginResult.status, loginResult.data);
      }
      
    } else {
      console.log('❌ Registration failed:', registerResult.status, registerResult.data);
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

async function testAPI() {
  console.log('🧪 Testing API Endpoints...\n');
  
  const endpoints = [
    { path: '/api/health', method: 'GET', name: 'Health Check' },
    { path: '/api/blogs', method: 'GET', name: 'Get Blogs' },
    { path: '/api/blogs/trending', method: 'GET', name: 'Trending Blogs' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const result = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: endpoint.path,
        method: endpoint.method
      });
      
      if (result.status < 400) {
        console.log(`✅ ${endpoint.name}: ${result.status}`);
      } else {
        console.log(`❌ ${endpoint.name}: ${result.status} - ${result.data.message || 'Error'}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🔍 QuillTide Authentication Test\n');
  
  await testAPI();
  console.log('\n' + '='.repeat(50) + '\n');
  await testAuth();
  
  console.log('\n🎯 Test Complete!');
  console.log('\nIf tests pass but frontend has issues:');
  console.log('1. Check browser console (F12)');
  console.log('2. Check Network tab for failed requests');
  console.log('3. Verify CORS settings');
  console.log('4. Clear browser cache and localStorage');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAuth, testAPI };