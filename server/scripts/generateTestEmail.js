const nodemailer = require('nodemailer');

async function generateTestEmailAccount() {
  try {
    console.log('🔄 Generating test email account...');
    
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('\n✅ Test email account generated successfully!');
    console.log('\n📧 Email Configuration for .env file:');
    console.log('EMAIL_SERVICE=ethereal');
    console.log(`EMAIL_USER=${testAccount.user}`);
    console.log(`EMAIL_PASS=${testAccount.pass}`);
    
    console.log('\n📝 Add these to your server/.env file to enable OTP functionality');
    console.log('\n🌐 Preview emails at: https://ethereal.email/');
    console.log('📋 Login with the credentials above to see sent emails');
    
    console.log('\n⚠️  Note: This is for testing only. Emails won\'t be delivered to real recipients.');
    
  } catch (error) {
    console.error('❌ Error generating test account:', error.message);
  }
}

generateTestEmailAccount();