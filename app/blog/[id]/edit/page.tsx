"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X, ArrowLeft, Save } from "lucide-react"
import type { Blog } from "@/lib/models/Blog"

export default function EditBlogPage() {
  const [blog, setBlog] = useState<Blog | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const { toast } = useToast()

  const blogId = params.id as string

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchBlog()
  }, [blogId, user])

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`)
      if (response.ok) {
        const blogData = await response.json()

        // Check if user owns the blog
        if (blogData.author._id !== user?._id) {
          toast({
            title: "Access denied",
            description: "You can only edit your own blog posts",
            variant: "destructive",
          })
          router.push(`/blog/${blogId}`)
          return
        }

        setBlog(blogData)
        setTitle(blogData.title)
        setContent(blogData.content)
        setTags(blogData.tags)
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
      setInitialLoading(false)
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Title and content are required.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags,
        }),
      })

      if (response.ok) {
        toast({
          title: "Blog updated!",
          description: "Your blog post has been updated successfully.",
        })
        router.push(`/blog/${blogId}`)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update blog post.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating blog:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the blog post.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user || initialLoading) {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Blog Post</h1>
            <p className="text-muted-foreground">Make changes to your blog post</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit: {blog.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your blog title..."
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog content here..."
                  rows={15}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tags and press Enter..."
                  disabled={loading}
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
                          disabled={loading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Blog
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
