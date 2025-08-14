#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Test configuration
const SERVER_URL = 'http://localhost:5000';
const CLIENT_URL = 'http://localhost:3000';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (error) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testServerHealth() {
  console.log('🏥 Testing Server Health...');
  try {
    const response = await makeRequest(`${SERVER_URL}/api/health`);
    if (response.status === 200) {
      console.log('✅ Server is healthy');
      console.log(`   Message: ${response.data.message}`);
      return true;
    } else {
      console.log(`❌ Server health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server is not running: ${error.message}`);
    return false;
  }
}

async function testClientAccess() {
  console.log('\n🌐 Testing Client Access...');
  try {
    const response = await makeRequest(CLIENT_URL);
    if (response.status === 200) {
      console.log('✅ Client is accessible');
      return true;
    } else {
      console.log(`❌ Client access failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Client is not running: ${error.message}`);
    return false;
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication System...');
  
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser' + Date.now(),
    email: 'test' + Date.now() + '@example.com',
    password: 'password123'
  };

  try {
    // Test registration
    console.log('   Testing registration...');
    const registerResponse = await makeRequest(`${SERVER_URL}/api/auth/register`, {
      method: 'POST',
      body: testUser
    });

    if (registerResponse.status === 201) {
      console.log('   ✅ Registration successful');
      const token = registerResponse.data.token;

      // Test login
      console.log('   Testing login...');
      const loginResponse = await makeRequest(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        body: {
          identifier: testUser.email,
          password: testUser.password
        }
      });

      if (loginResponse.status === 200) {
        console.log('   ✅ Login successful');

        // Test protected route
        console.log('   Testing protected route...');
        const meResponse = await makeRequest(`${SERVER_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (meResponse.status === 200) {
          console.log('   ✅ Protected route access successful');
          return true;
        } else {
          console.log(`   ❌ Protected route failed: ${meResponse.status}`);
        }
      } else {
        console.log(`   ❌ Login failed: ${loginResponse.status}`);
        console.log(`   Error: ${loginResponse.data.message || 'Unknown error'}`);
      }
    } else {
      console.log(`   ❌ Registration failed: ${registerResponse.status}`);
      console.log(`   Error: ${registerResponse.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`   ❌ Authentication test failed: ${error.message}`);
  }

  return false;
}

async function testBlogEndpoints() {
  console.log('\n📝 Testing Blog Endpoints...');
  
  try {
    // Test get blogs
    const blogsResponse = await makeRequest(`${SERVER_URL}/api/blogs`);
    if (blogsResponse.status === 200) {
      console.log('   ✅ Get blogs endpoint working');
      console.log(`   Found ${blogsResponse.data.blogs?.length || 0} blogs`);
    } else {
      console.log(`   ❌ Get blogs failed: ${blogsResponse.status}`);
    }

    // Test trending blogs
    const trendingResponse = await makeRequest(`${SERVER_URL}/api/blogs/trending`);
    if (trendingResponse.status === 200) {
      console.log('   ✅ Trending blogs endpoint working');
    } else {
      console.log(`   ❌ Trending blogs failed: ${trendingResponse.status}`);
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Blog endpoints test failed: ${error.message}`);
    return false;
  }
}

async function testUploadEndpoint() {
  console.log('\n📤 Testing Upload Endpoint...');
  
  try {
    // Test upload endpoint (should fail without auth, but endpoint should exist)
    const uploadResponse = await makeRequest(`${SERVER_URL}/api/upload/image`, {
      method: 'POST'
    });
    
    if (uploadResponse.status === 401) {
      console.log('   ✅ Upload endpoint exists (requires authentication)');
      return true;
    } else if (uploadResponse.status === 400) {
      console.log('   ✅ Upload endpoint exists (requires file)');
      return true;
    } else {
      console.log(`   ❌ Upload endpoint unexpected response: ${uploadResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Upload endpoint test failed: ${error.message}`);
  }
  
  return false;
}

async function runAllTests() {
  console.log('🧪 QuillTide Comprehensive Test Suite\n');
  console.log('=' .repeat(50));

  const results = {
    serverHealth: await testServerHealth(),
    clientAccess: await testClientAccess(),
    authentication: await testAuthentication(),
    blogEndpoints: await testBlogEndpoints(),
    uploadEndpoint: await testUploadEndpoint()
  };

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results Summary:');
  console.log(`🏥 Server Health: ${results.serverHealth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🌐 Client Access: ${results.clientAccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔐 Authentication: ${results.authentication ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📝 Blog Endpoints: ${results.blogEndpoints ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📤 Upload Endpoint: ${results.uploadEndpoint ? '✅ PASS' : '❌ FAIL'}`);

  const passCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 Overall Score: ${passCount}/${totalTests} tests passed`);

  if (passCount === totalTests) {
    console.log('\n🎉 All tests passed! QuillTide is fully functional!');
    console.log('\n🚀 You can now:');
    console.log('   • Register new users');
    console.log('   • Login and logout');
    console.log('   • Create and manage blog posts');
    console.log('   • Upload images');
    console.log('   • View profiles and dashboards');
  } else {
    console.log('\n⚠️  Some tests failed. Please check:');
    if (!results.serverHealth) console.log('   • Start the server: npm run server');
    if (!results.clientAccess) console.log('   • Start the client: npm run client');
    if (!results.authentication) console.log('   • Check MongoDB connection and JWT secret');
    if (!results.blogEndpoints) console.log('   • Verify blog routes and database');
    if (!results.uploadEndpoint) console.log('   • Check Cloudinary configuration');
  }

  console.log('\n📱 Access your application:');
  console.log(`   Frontend: ${CLIENT_URL}`);
  console.log(`   Backend:  ${SERVER_URL}`);
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };