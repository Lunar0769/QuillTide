import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { Blog, Comment } from "@/lib/models/Blog"
import { ObjectId } from "mongodb"


export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params;
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("blog-app")
    const blogs = db.collection<Blog>("blogs")

    const comment: Comment = {
      _id: new ObjectId(),
      author: new ObjectId(user.userId),
      content,
      createdAt: new Date(),
    }

    const result = await blogs.updateOne({ _id: new ObjectId(params.id) }, { $push: { comments: comment } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Add comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
