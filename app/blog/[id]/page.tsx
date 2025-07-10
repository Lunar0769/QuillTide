"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { BlogWithAuthor, Comment } from "@/lib/models/Blog"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Heart, MessageCircle, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface CommentWithAuthor extends Comment {
  author: {
    _id: string
    username: string
    profilePicture?: string
  }
}

export default function BlogDetailPage() {
  const [blog, setBlog] = useState<BlogWithAuthor | null>(null)
  const [comments, setComments] = useState<CommentWithAuthor[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const { toast } = useToast()

  const blogId = params.id as string

  useEffect(() => {
    fetchBlog()
  }, [blogId])

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`)
      if (response.ok) {
        const blogData = await response.json()
        setBlog(blogData)

        // Check if user liked the blog
        if (user) {
          setIsLiked(blogData.likes.some((like: string) => like === user._id))
        }

        // Fetch comments with author info
        const commentsWithAuthors = await Promise.all(
          blogData.comments.map(async (comment: Comment) => {
            try {
              const userResponse = await fetch(`/api/users/${comment.author}`)
              if (userResponse.ok) {
                const userData = await userResponse.json()
                return {
                  ...comment,
                  author: {
                    _id: userData.user._id,
                    username: userData.user.username,
                    profilePicture: userData.user.profilePicture,
                  },
                }
              }
              return {
                ...comment,
                author: {
                  _id: comment.author.toString(),
                  username: "Unknown User",
                },
              }
            } catch {
              return {
                ...comment,
                author: {
                  _id: comment.author.toString(),
                  username: "Unknown User",
                },
              }
            }
          }),
        )
        setComments(commentsWithAuthors)
      } else {
        toast({
          title: "Error",
          description: "Blog not found",
          variant: "destructive",
        })
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching blog:", error)
      toast({
        title: "Error",
        description: "Failed to load blog",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "Please log in to like blogs",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setBlog((prev) =>
          prev
            ? {
                ...prev,
                likes: data.liked ? [...prev.likes, user._id] : prev.likes.filter((id) => id !== user._id),
              }
            : null,
        )
      }
    } catch (error) {
      console.error("Error liking blog:", error)
      toast({
        title: "Error",
        description: "Failed to like blog",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    setCommentLoading(true)

    try {
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (response.ok) {
        const comment = await response.json()
        const commentWithAuthor: CommentWithAuthor = {
          ...comment,
          author: {
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture,
          },
        }
        setComments((prev) => [...prev, commentWithAuthor])
        setNewComment("")
        setBlog((prev) =>
          prev
            ? {
                ...prev,
                comments: [...prev.comments, comment],
              }
            : null,
        )
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !token || !blog) return

    if (confirm("Are you sure you want to delete this blog post?")) {
      try {
        const response = await fetch(`/api/blogs/${blogId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          toast({
            title: "Blog deleted",
            description: "Your blog post has been deleted successfully.",
          })
          router.push("/")
        }
      } catch (error) {
        console.error("Error deleting blog:", error)
        toast({
          title: "Error",
          description: "Failed to delete blog",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Blog not found</p>
        </div>
      </div>
    )
  }

  const isAuthor = user && blog.author._id.toString() === user._id

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="space-y-6">
        {/* Blog Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={blog.author.profilePicture || "/placeholder.svg"} alt={blog.author.username} />
                <AvatarFallback>{blog.author.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/profile/${blog.author._id}`} className="font-medium hover:underline">
                  {blog.author.username}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {isAuthor && (
              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/blog/${blogId}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold">{blog.title}</h1>

          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Blog Content */}
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{blog.content}</div>
        </div>

        {/* Blog Stats */}
        <div className="flex items-center justify-between py-4 border-t border-b">
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{blog.views} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{blog.comments.length} comments</span>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={handleLike}
            className={`flex items-center space-x-1 ${isLiked ? "text-red-500" : ""}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{blog.likes.length}</span>
          </Button>
        </div>

        {/* Comments Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                disabled={commentLoading}
              />
              <Button type="submit" disabled={commentLoading || !newComment.trim()}>
                {commentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Comment"
                )}
              </Button>
            </form>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline">
                    Log in
                  </Link>{" "}
                  to join the conversation
                </p>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment._id?.toString()}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={comment.author.profilePicture || "/placeholder.svg"}
                        alt={comment.author.username}
                      />
                      <AvatarFallback>{comment.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/profile/${comment.author._id}`} className="font-medium hover:underline">
                        {comment.author.username}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-800">{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}
