import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { User, UserStats } from "@/lib/models/User"
import type { Blog } from "@/lib/models/Blog"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params;
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("blog-app")
    const users = db.collection<User>("users")
    const blogs = db.collection<Blog>("blogs")

    const userId = new ObjectId(params.id)

    // Get user data
    const user = await users.findOne({ _id: userId }, { projection: { password: 0 } })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user stats
    const userBlogs = await blogs.find({ author: userId }).toArray()
    const stats: UserStats = {
      totalBlogs: userBlogs.length,
      totalViews: userBlogs.reduce((sum, blog) => sum + blog.views, 0),
      totalLikes: userBlogs.reduce((sum, blog) => sum + blog.likes.length, 0),
      totalComments: userBlogs.reduce((sum, blog) => sum + blog.comments.length, 0),
      followersCount: user.followers.length,
      followingCount: user.following.length,
    }

    return NextResponse.json({
      user,
      stats,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
