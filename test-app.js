const http = require('http');

// Test server health
const testServer = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('✅ Server is running!');
      console.log('Response:', data);
    });
  });

  req.on('error', (err) => {
    console.log('❌ Server connection failed:', err.message);
  });

  req.end();
};

// Test after a short delay
setTimeout(testServer, 2000);