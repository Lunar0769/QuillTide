"use client"

import { useState, useEffect } from "react"
import type { BlogWithAuthor } from "@/lib/models/Blog"
import { useAuth } from "@/contexts/AuthContext"
import BlogCard from "@/components/BlogCard"
import SearchBar from "@/components/SearchBar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [likedBlogs, setLikedBlogs] = useState<Set<string>>(new Set())

  const { user, token } = useAuth()
  const { toast } = useToast()

  const fetchBlogs = async (searchTerm = "", pageNum = 1, append = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
      })

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`/api/blogs?${params}`)
      const data = await response.json()

      if (response.ok) {
        if (append) {
          setBlogs((prev) => [...prev, ...data.blogs])
        } else {
          setBlogs(data.blogs)
        }
        setHasMore(pageNum < data.pagination.pages)

        // Set liked blogs for authenticated users
        if (user && token) {
          const liked = new Set<string>()
          data.blogs.forEach((blog: BlogWithAuthor) => {
            if (blog.likes.some((like) => like.toString() === user._id)) {
              liked.add(blog._id!.toString())
            }
          })
          setLikedBlogs(liked)
        }
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
    fetchBlogs(query, 1, false)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchBlogs(searchQuery, nextPage, true)
  }

  const handleLike = async (blogId: string) => {
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

        // Update liked blogs state
        const newLikedBlogs = new Set(likedBlogs)
        if (data.liked) {
          newLikedBlogs.add(blogId)
        } else {
          newLikedBlogs.delete(blogId)
        }
        setLikedBlogs(newLikedBlogs)

        // Update blogs state
        setBlogs((prev) =>
          prev.map((blog) =>
            blog._id!.toString() === blogId
              ? {
                  ...blog,
                  likes: data.liked ? [...blog.likes, user._id] : blog.likes.filter((id) => id.toString() !== user._id),
                }
              : blog,
          ),
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Amazing Stories</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading && blogs.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 mb-8">
            {blogs.map((blog) => (
              <BlogCard
                key={blog._id!.toString()}
                blog={blog}
                onLike={handleLike}
                isLiked={likedBlogs.has(blog._id!.toString())}
              />
            ))}
          </div>

          {blogs.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No blogs found.</p>
            </div>
          )}

          {hasMore && blogs.length > 0 && (
            <div className="flex justify-center">
              <Button onClick={handleLoadMore} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
