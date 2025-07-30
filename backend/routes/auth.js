import express from "express"
import User from "../models/User.js"
import { generateToken, generateOTP, authMiddleware } from "../utils/auth.js"
import { sendOTPEmail, sendWelcomeEmail } from "../utils/email.js"

const router = express.Router()

// Register user
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already registered" })
      }
      return res.status(400).json({ error: "Username already taken" })
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create user
    const user = new User({
      username,
      email,
      password,
      otp,
      otpExpiry,
      isVerified: false,
    })

    await user.save()

    // Send OTP email
    await sendOTPEmail(email, otp)

    res.status(201).json({
      message: "User registered successfully. Please check your email for verification code.",
      userId: user._id,
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ error: "User not found" })
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified" })
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" })
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ error: "OTP expired" })
    }

    // Verify user
    user.isVerified = true
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    // Send welcome email
    await sendWelcomeEmail(user.email, user.username)

    // Generate token
    const token = generateToken(user._id)

    res.json({
      message: "Email verified successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followers: user.followers,
        following: user.following,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ error: "User not found" })
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified" })
    }

    // Generate new OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    // Send OTP email
    await sendOTPEmail(email, otp)

    res.json({ message: "OTP sent successfully" })
  } catch (error) {
    console.error("Resend OTP error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({
        error: "Email not verified. Please verify your email first.",
        needsVerification: true,
        email: user.email,
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken(user._id)

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followers: user.followers,
        following: user.following,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  res.json(req.user)
})

// Forgot password - send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ error: "User not found" })
    }

    // Generate OTP for password reset
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    // Send OTP email
    await sendOTPEmail(email, otp)

    res.json({ message: "Password reset OTP sent to your email" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ error: "User not found" })
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" })
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ error: "OTP expired" })
    }

    // Update password
    user.password = newPassword
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    res.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
