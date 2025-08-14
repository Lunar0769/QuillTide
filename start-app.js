const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting QuillTide Application...\n');

// Start server
console.log('📡 Starting server...');
const server = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Start client after a delay
setTimeout(() => {
  console.log('🌐 Starting client...');
  const client = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true
  });

  client.on('error', (err) => {
    console.error('❌ Client error:', err);
  });
}, 3000);

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit();
});