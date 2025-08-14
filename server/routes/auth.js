const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const OTPService = require('../utils/otpService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/send-otp
// @desc    Send OTP for registration or login
// @access  Public
router.post('/send-otp', [
  body('identifier').notEmpty().withMessage('Email or phone number is required'),
  body('method').isIn(['email', 'sms']).withMessage('Method must be email or sms'),
  body('type').isIn(['registration', 'login']).withMessage('Invalid type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, method, type } = req.body;

    // For registration, check if user already exists
    if (type === 'registration') {
      const existingUser = await User.findOne({
        $or: [
          { email: identifier },
          { phone: identifier }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email/phone' });
      }
    }

    // For login, check if user exists
    if (type === 'login') {
      const user = await User.findOne({
        $or: [
          { email: identifier },
          { phone: identifier }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    await OTPService.generateAndSendOTP(identifier, method, type);

    res.json({ 
      message: `OTP sent successfully via ${method}`,
      identifier,
      method
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
});

// @route   POST /api/auth/register
// @desc    Register user (no OTP required)
// @access  Public
router.post('/register', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, username, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username },
        ...(phone ? [{ phone }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      username,
      phone,
      isVerified: true // Auto-verify since no OTP
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('identifier').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// @route   POST /api/auth/verify-otp-login
// @desc    Login with OTP verification
// @access  Public
router.post('/verify-otp-login', [
  body('identifier').notEmpty().withMessage('Email or phone is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, otp } = req.body;

    // Verify OTP
    await OTPService.verifyOTP(identifier, otp, 'login');

    // Find user
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('OTP login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('followers', 'username firstName lastName avatar')
      .populate('following', 'username firstName lastName avatar');

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatar: user.avatar,
        isVerified: user.isVerified,
        followers: user.followers,
        following: user.following,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset OTP
// @access  Public
router.post('/forgot-password', [
  body('identifier').notEmpty().withMessage('Email or phone is required'),
  body('method').isIn(['email', 'sms']).withMessage('Method must be email or sms')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, method } = req.body;

    // Check if user exists
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await OTPService.generateAndSendOTP(identifier, method, 'password_reset');

    res.json({ 
      message: `Password reset code sent via ${method}`,
      identifier,
      method
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message || 'Failed to send reset code' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', [
  body('identifier').notEmpty().withMessage('Email or phone is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, otp, newPassword } = req.body;

    // Verify OTP
    await OTPService.verifyOTP(identifier, otp, 'password_reset');

    // Find and update user
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Password reset failed' });
  }
});

module.exports = router;