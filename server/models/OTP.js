const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true // email or phone number
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['registration', 'login', 'password_reset'],
    required: true
  },
  method: {
    type: String,
    enum: ['email', 'sms'],
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  }
}, {
  timestamps: true
});

// Index for automatic deletion of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient querying
otpSchema.index({ identifier: 1, type: 1, isUsed: 1 });

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Method to verify OTP
otpSchema.methods.verify = function(inputOTP) {
  if (this.isUsed) {
    throw new Error('OTP has already been used');
  }
  
  if (this.expiresAt < new Date()) {
    throw new Error('OTP has expired');
  }
  
  if (this.attempts >= 5) {
    throw new Error('Maximum verification attempts exceeded');
  }
  
  this.attempts += 1;
  
  if (this.otp === inputOTP) {
    this.isUsed = true;
    return true;
  }
  
  return false;
};

module.exports = mongoose.model('OTP', otpSchema);