import express from "express"
import Blog from "../models/Blog.js"
import { authMiddleware } from "../utils/auth.js"

const router = express.Router()

// Get all blogs with search and pagination
router.get("/", async (req, res) => {
  try {
    const { search, author, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    const query = {}

    if (search) {
      query.$text = { $search: search }
    }

    if (author) {
      query.author = author
    }

    const blogs = await Blog.find(query)
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Blog.countDocuments(query)

    res.json({
      blogs,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get blogs error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Get single blog
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "username profilePicture")
      .populate("comments.author", "username profilePicture")

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    // Increment view count
    blog.views += 1
    await blog.save()

    res.json(blog)
  } catch (error) {
    console.error("Get blog error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Create blog
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, tags } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" })
    }

    const blog = new Blog({
      title,
      content,
      tags: tags || [],
      author: req.user._id,
    })

    await blog.save()
    await blog.populate("author", "username profilePicture")

    res.status(201).json(blog)
  } catch (error) {
    console.error("Create blog error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Update blog
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" })
    }

    const { title, content, tags } = req.body

    blog.title = title || blog.title
    blog.content = content || blog.content
    blog.tags = tags || blog.tags

    await blog.save()
    await blog.populate("author", "username profilePicture")

    res.json(blog)
  } catch (error) {
    console.error("Update blog error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Delete blog
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" })
    }

    await Blog.findByIdAndDelete(req.params.id)

    res.json({ message: "Blog deleted successfully" })
  } catch (error) {
    console.error("Delete blog error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Like/Unlike blog
router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    const hasLiked = blog.likes.includes(req.user._id)

    if (hasLiked) {
      blog.likes = blog.likes.filter((like) => like.toString() !== req.user._id.toString())
    } else {
      blog.likes.push(req.user._id)
    }

    await blog.save()

    res.json({
      liked: !hasLiked,
      likesCount: blog.likes.length,
    })
  } catch (error) {
    console.error("Like blog error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Add comment
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ error: "Comment content is required" })
    }

    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    const comment = {
      author: req.user._id,
      content,
    }

    blog.comments.push(comment)
    await blog.save()

    await blog.populate("comments.author", "username profilePicture")

    res.status(201).json(blog.comments[blog.comments.length - 1])
  } catch (error) {
    console.error("Add comment error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
