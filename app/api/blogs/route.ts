import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { Blog, BlogWithAuthor } from "@/lib/models/Blog"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const author = searchParams.get("author")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const client = await clientPromise
    const db = client.db("blog-app")
    const blogs = db.collection<Blog>("blogs")

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    if (author) {
      query.author = new ObjectId(author)
    }

    // Get blogs with author information
    const blogsWithAuthor = await blogs
      .aggregate<BlogWithAuthor>([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
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

    const total = await blogs.countDocuments(query)

    return NextResponse.json({
      blogs: blogsWithAuthor,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get blogs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, tags } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("blog-app")
    const blogs = db.collection<Blog>("blogs")

    const newBlog: Omit<Blog, "_id"> = {
      title,
      content,
      tags: tags || [],
      author: new ObjectId(user.userId),
      views: 0,
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await blogs.insertOne(newBlog)
    const blog = await blogs.findOne({ _id: result.insertedId })

    return NextResponse.json(blog)
  } catch (error) {
    console.error("Create blog error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
