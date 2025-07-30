import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { Blog, BlogWithAuthor } from "@/lib/models/Blog"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params;
    const client = await clientPromise
    const db = client.db("blog-app")
    const blogs = db.collection<Blog>("blogs")

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 })
    }

    // Increment view count unless ?noview=1 is present
    const { searchParams } = new URL(request.url)
    if (searchParams.get("noview") !== "1") {
      await blogs.updateOne({ _id: new ObjectId(params.id) }, { $inc: { views: 1 } })
    }

    // Get blog with author information
    const blog = await blogs
      .aggregate<BlogWithAuthor>([
        { $match: { _id: new ObjectId(params.id) } },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        {
          $addFields: {
            author: {
              _id: { $arrayElemAt: ["$authorInfo._id", 0] },
              username: { $arrayElemAt: ["$authorInfo.username", 0] },
              profilePicture: { $arrayElemAt: ["$authorInfo.profilePicture", 0] },
            },
          },
        },
        { $unset: "authorInfo" },
      ])
      .toArray()

    if (!blog[0]) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json(blog[0])
  } catch (error) {
    console.error("Get blog error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params;
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, tags } = await request.json()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("blog-app")
    const blogs = db.collection<Blog>("blogs")

    // Check if user owns the blog
    const blog = await blogs.findOne({ _id: new ObjectId(params.id) })
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    if (blog.author.toString() !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update blog
    const result = await blogs.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          title,
          content,
          tags: tags || [],
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const updatedBlog = await blogs.findOne({ _id: new ObjectId(params.id) })
    return NextResponse.json(updatedBlog)
  } catch (error) {
    console.error("Update blog error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params;
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

    // Check if user owns the blog
    const blog = await blogs.findOne({ _id: new ObjectId(params.id) })
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    if (blog.author.toString() !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete blog
    const result = await blogs.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Blog deleted successfully" })
  } catch (error) {
    console.error("Delete blog error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
