import express from "express"
import User from "../models/User.js"
import Blog from "../models/Blog.js"
import { authMiddleware } from "../utils/auth.js"

const router = express.Router()

// Get user profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -otp -otpExpiry")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Get user stats
    const blogs = await Blog.find({ author: req.params.id })
    const stats = {
      totalBlogs: blogs.length,
      totalViews: blogs.reduce((sum, blog) => sum + blog.views, 0),
      totalLikes: blogs.reduce((sum, blog) => sum + blog.likes.length, 0),
      totalComments: blogs.reduce((sum, blog) => sum + blog.comments.length, 0),
      followersCount: user.followers.length,
      followingCount: user.following.length,
    }

    res.json({ user, stats })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Update user profile
router.put("/:id/update", authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: "Not authorized" })
    }

    const { username, bio, profilePicture } = req.body

    // Check if username is already taken
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.params.id },
      })

      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" })
      }
    }

    const updateData = {}
    if (username) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select(
      "-password -otp -otpExpiry",
    )

    res.json(user)
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Follow/Unfollow user
router.post("/:id/follow", authMiddleware, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: "Cannot follow yourself" })
    }

    const userToFollow = await User.findById(req.params.id)
    const currentUser = await User.findById(req.user._id)

    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" })
    }

    const isFollowing = currentUser.following.includes(req.params.id)

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((id) => id.toString() !== req.params.id)
      userToFollow.followers = userToFollow.followers.filter((id) => id.toString() !== req.user._id.toString())
    } else {
      // Follow
      currentUser.following.push(req.params.id)
      userToFollow.followers.push(req.user._id)
    }

    await currentUser.save()
    await userToFollow.save()

    res.json({ following: !isFollowing })
  } catch (error) {
    console.error("Follow user error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
