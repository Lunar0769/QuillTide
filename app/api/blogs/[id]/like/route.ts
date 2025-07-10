import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { Blog } from "@/lib/models/Blog"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("blog-app")
    const blogs = db.collection<Blog>("blogs")

    const userId = new ObjectId(user.userId)
    const blogId = new ObjectId(params.id)

    // Check if user already liked the blog
    const blog = await blogs.findOne({ _id: blogId })
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const hasLiked = blog.likes.some((like) => like.toString() === userId.toString())

    let result
    if (hasLiked) {
      // Unlike
      result = await blogs.updateOne({ _id: blogId }, { $pull: { likes: userId } })
    } else {
      // Like
      result = await blogs.updateOne({ _id: blogId }, { $addToSet: { likes: userId } })
    }

    const updatedBlog = await blogs.findOne({ _id: blogId })

    return NextResponse.json({
      liked: !hasLiked,
      likesCount: updatedBlog?.likes.length || 0,
    })
  } catch (error) {
    console.error("Like blog error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
