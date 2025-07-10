import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { User } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const currentUserId = new ObjectId(user.userId)
    const targetUserId = new ObjectId(params.id)

    if (currentUserId.toString() === targetUserId.toString()) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("blog-app")
    const users = db.collection<User>("users")

    // Check if already following
    const currentUser = await users.findOne({ _id: currentUserId })
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isFollowing = currentUser.following.some((id) => id.toString() === targetUserId.toString())

    if (isFollowing) {
      // Unfollow
      await users.updateOne({ _id: currentUserId }, { $pull: { following: targetUserId } })
      await users.updateOne({ _id: targetUserId }, { $pull: { followers: currentUserId } })
    } else {
      // Follow
      await users.updateOne({ _id: currentUserId }, { $addToSet: { following: targetUserId } })
      await users.updateOne({ _id: targetUserId }, { $addToSet: { followers: currentUserId } })
    }

    return NextResponse.json({
      following: !isFollowing,
    })
  } catch (error) {
    console.error("Follow user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
