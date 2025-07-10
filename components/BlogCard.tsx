"use client"

import type React from "react"

import Link from "next/link"
import type { BlogWithAuthor } from "@/lib/models/Blog"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface BlogCardProps {
  blog: BlogWithAuthor
  onLike?: (blogId: string) => void
  isLiked?: boolean
}

export default function BlogCard({ blog, onLike, isLiked }: BlogCardProps) {
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onLike) {
      onLike(blog._id!.toString())
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={blog.author.profilePicture || "/placeholder.svg"} alt={blog.author.username} />
            <AvatarFallback>{blog.author.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Link href={`/profile/${blog.author._id}`} className="text-sm font-medium hover:underline">
              {blog.author.username}
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <Link href={`/blog/${blog._id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors">{blog.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-3">{blog.content.substring(0, 150)}...</p>
        </Link>

        {blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {blog.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{blog.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{blog.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{blog.comments.length}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-1 ${isLiked ? "text-red-500" : ""}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{blog.likes.length}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
