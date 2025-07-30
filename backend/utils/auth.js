import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(401).json({ error: "Token is not valid" })
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: "Email not verified" })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: "Token is not valid" })
  }
}
