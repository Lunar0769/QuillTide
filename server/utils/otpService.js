const nodemailer = require('nodemailer');
const twilio = require('twilio');
const OTP = require('../models/OTP');

// Email transporter setup with multiple service support
const createEmailTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  // Configuration for different email services
  const serviceConfigs = {
    gmail: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    },
    outlook: {
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
    },
    yahoo: {
      service: 'yahoo',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    },
    custom: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    },
    ethereal: {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  };

  return nodemailer.createTransport(serviceConfigs[emailService] || serviceConfigs.gmail);
};

// Create email transporter only if email is configured
let emailTransporter = null;
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    emailTransporter = createEmailTransporter();
  }
} catch (error) {
  console.warn('Email configuration not available:', error.message);
}

// Twilio client setup
const twilioClient = process.env.TWILIO_SID && process.env.TWILIO_TOKEN 
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
  : null;

class OTPService {
  static async sendEmailOTP(email, otp, type = 'registration') {
    if (!emailTransporter) {
      throw new Error('Email service not configured. Please set up email credentials in .env file.');
    }
    
    const subject = this.getEmailSubject(type);
    const html = this.getEmailTemplate(otp, type);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html
    };
    
    try {
      await emailTransporter.sendMail(mailOptions);
      console.log(`OTP email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('Failed to send OTP email');
    }
  }
  
  static async sendSMSOTP(phone, otp, type = 'registration') {
    if (!twilioClient) {
      throw new Error('Twilio configuration not found');
    }
    
    const message = this.getSMSMessage(otp, type);
    
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: phone
      });
      console.log(`OTP SMS sent to ${phone}`);
      return true;
    } catch (error) {
      console.error('SMS sending error:', error);
      throw new Error('Failed to send OTP SMS');
    }
  }
  
  static async generateAndSendOTP(identifier, method, type = 'registration') {
    // Clean up old OTPs for this identifier
    await OTP.deleteMany({ 
      identifier, 
      type,
      $or: [
        { isUsed: true },
        { expiresAt: { $lt: new Date() } }
      ]
    });
    
    // Check for existing valid OTP
    const existingOTP = await OTP.findOne({
      identifier,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (existingOTP) {
      // Check if enough time has passed for resend (2 minutes)
      const timeSinceCreated = new Date() - existingOTP.createdAt;
      const resendCooldown = 2 * 60 * 1000; // 2 minutes in milliseconds
      
      if (timeSinceCreated < resendCooldown) {
        const remainingTime = Math.ceil((resendCooldown - timeSinceCreated) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before requesting a new OTP.`);
      }
      
      // If cooldown has passed, delete the old OTP and continue
      await OTP.findByIdAndDelete(existingOTP._id);
    }
    
    // Generate new OTP
    const otpCode = OTP.generateOTP();
    
    // Save OTP to database
    const otpDoc = new OTP({
      identifier,
      otp: otpCode,
      type,
      method
    });
    
    await otpDoc.save();
    
    // Send OTP
    if (method === 'email') {
      await this.sendEmailOTP(identifier, otpCode, type);
    } else if (method === 'sms') {
      await this.sendSMSOTP(identifier, otpCode, type);
    } else {
      throw new Error('Invalid OTP method');
    }
    
    return otpDoc;
  }
  
  static async verifyOTP(identifier, inputOTP, type = 'registration') {
    const otpDoc = await OTP.findOne({
      identifier,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpDoc) {
      throw new Error('Invalid or expired OTP');
    }
    
    const isValid = otpDoc.verify(inputOTP);
    await otpDoc.save();
    
    if (!isValid) {
      throw new Error('Invalid OTP');
    }
    
    return true;
  }
  
  static getEmailSubject(type) {
    const subjects = {
      registration: 'Welcome to QuillTide - Verify Your Account',
      login: 'QuillTide - Login Verification Code',
      password_reset: 'QuillTide - Password Reset Code'
    };
    return subjects[type] || 'QuillTide - Verification Code';
  }
  
  static getEmailTemplate(otp, type) {
    const messages = {
      registration: 'Welcome to QuillTide! Please use the following code to verify your account:',
      login: 'Please use the following code to complete your login:',
      password_reset: 'Please use the following code to reset your password:'
    };
    
    const message = messages[type] || 'Please use the following verification code:';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">QuillTide</h1>
          <p style="color: #6b7280; margin: 5px 0;">Your Blogging Platform</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 8px; text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Verification Code</h2>
          <p style="color: #4b5563; margin-bottom: 30px;">${message}</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">${otp}</span>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 QuillTide. All rights reserved.</p>
        </div>
      </div>
    `;
  }
  
  static getSMSMessage(otp, type) {
    const messages = {
      registration: `Welcome to QuillTide! Your verification code is: ${otp}. This code expires in 10 minutes.`,
      login: `Your QuillTide login code is: ${otp}. This code expires in 10 minutes.`,
      password_reset: `Your QuillTide password reset code is: ${otp}. This code expires in 10 minutes.`
    };
    
    return messages[type] || `Your QuillTide verification code is: ${otp}. This code expires in 10 minutes.`;
  }
}

module.exports = OTPService;