import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  username: string
  email: string
  password: string
  bio?: string
  profilePicture?: string
  followers: ObjectId[]
  following: ObjectId[]
  createdAt: Date
  updatedAt: Date
}

export interface UserStats {
  totalBlogs: number
  totalViews: number
  totalLikes: number
  totalComments: number
  followersCount: number
  followingCount: number
}
