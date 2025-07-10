import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { User } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Check if user is updating their own profile
    if (user.userId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { username, bio, profilePicture } = await request.json()

    const client = await clientPromise
    const db = client.db("blog-app")
    const users = db.collection<User>("users")

    // Check if username is already taken (if username is being changed)
    if (username) {
      const existingUser = await users.findOne({
        username,
        _id: { $ne: new ObjectId(params.id) },
      })

      if (existingUser) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 })
      }
    }

    // Update user profile
    const updateData: Partial<User> = {
      updatedAt: new Date(),
    }

    if (username) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture

    const result = await users.updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get updated user data
    const updatedUser = await users.findOne({ _id: new ObjectId(params.id) }, { projection: { password: 0 } })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
