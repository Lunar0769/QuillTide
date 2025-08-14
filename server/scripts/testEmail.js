const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfiguration() {
  console.log('🔄 Testing email configuration...');
  console.log(`📧 Email Service: ${process.env.EMAIL_SERVICE}`);
  console.log(`👤 Email User: ${process.env.EMAIL_USER}`);
  console.log(`🔑 Password Length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0} characters`);
  
  try {
    // Create transporter based on service
    let transporterConfig;
    
    if (process.env.EMAIL_SERVICE === 'ethereal') {
      transporterConfig = {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
    } else {
      transporterConfig = {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          ciphers: 'SSLv3'
        }
      };
    }
    
    const transporter = nodemailer.createTransport(transporterConfig);

    console.log('\n🔄 Verifying transporter...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ Email transporter verified successfully!');

    // Send test email
    console.log('\n📤 Sending test email...');
    
    const testEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'QuillTide - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">🎉 Email Configuration Successful!</h2>
          <p>Your QuillTide email configuration is working correctly.</p>
          <p><strong>Service:</strong> ${process.env.EMAIL_SERVICE}</p>
          <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #6b7280; font-size: 14px;">
            This is a test email from your QuillTide blog application.
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`📬 Check your inbox: ${process.env.EMAIL_USER}`);
    
  } catch (error) {
    console.error('❌ Email configuration error:');
    console.error(`   Error Type: ${error.code || 'Unknown'}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Error Solutions:');
      console.log('   1. Check if your email and password are correct');
      console.log('   2. If you have 2FA enabled, use an app password');
      console.log('   3. Make sure "Less secure app access" is enabled (if applicable)');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Connection Error Solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Try a different email service');
      console.log('   3. Check if your firewall is blocking the connection');
    }
  }
}

testEmailConfiguration();