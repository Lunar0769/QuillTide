const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupGmail() {
  console.log('🔧 Gmail Setup for QuillTide OTP\n');
  
  console.log('📋 Steps to get Gmail App Password:');
  console.log('1. Go to https://myaccount.google.com/security');
  console.log('2. Enable 2-Step Verification if not already enabled');
  console.log('3. Go to "App passwords" section');
  console.log('4. Generate a new app password for "Mail"');
  console.log('5. Copy the 16-character password (format: xxxx-xxxx-xxxx-xxxx)\n');
  
  const email = await askQuestion('Enter your Gmail address: ');
  const appPassword = await askQuestion('Enter your Gmail app password (16 characters): ');
  
  // Validate inputs
  if (!email.includes('@gmail.com')) {
    console.log('❌ Please enter a valid Gmail address');
    rl.close();
    return;
  }
  
  if (appPassword.replace(/[-\s]/g, '').length !== 16) {
    console.log('❌ App password should be 16 characters (excluding spaces/dashes)');
    rl.close();
    return;
  }
  
  // Clean the app password (remove spaces and dashes)
  const cleanPassword = appPassword.replace(/[-\s]/g, '');
  
  // Read current .env file
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('❌ Could not read .env file');
    rl.close();
    return;
  }
  
  // Update email configuration
  envContent = envContent.replace(
    /EMAIL_SERVICE=.*/,
    'EMAIL_SERVICE=gmail'
  );
  envContent = envContent.replace(
    /EMAIL_USER=.*/,
    `EMAIL_USER=${email}`
  );
  envContent = envContent.replace(
    /EMAIL_PASS=.*/,
    `EMAIL_PASS=${cleanPassword}`
  );
  
  // Write updated .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Gmail configuration updated successfully!');
    console.log('\n📧 Email Configuration:');
    console.log(`   Service: Gmail`);
    console.log(`   Email: ${email}`);
    console.log(`   App Password: ${cleanPassword.substring(0, 4)}************`);
    console.log('\n🔄 Please restart your server to apply changes');
    console.log('   Run: npm run dev');
  } catch (error) {
    console.log('❌ Could not update .env file:', error.message);
  }
  
  rl.close();
}

setupGmail().catch(console.error);