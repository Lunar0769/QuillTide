import type { ObjectId } from "mongodb"

export interface Blog {
  _id?: ObjectId
  title: string
  content: string
  tags: string[]
  author: ObjectId
  views: number
  likes: ObjectId[]
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  _id?: ObjectId
  author: ObjectId
  content: string
  createdAt: Date
}

export interface BlogWithAuthor extends Omit<Blog, "author"> {
  author: {
    _id: ObjectId
    username: string
    profilePicture?: string
  }
}
