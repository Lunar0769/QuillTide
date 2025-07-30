import express from "express"
import { authMiddleware } from "../utils/auth.js"

const router = express.Router()

// Handle file upload (for profile pictures)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { file } = req.body

    if (!file) {
      return res.status(400).json({ error: "No file provided" })
    }

    // In a real application, you would upload to a cloud service like Cloudinary
    // For now, we'll just return the base64 data URL
    res.json({ url: file })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
