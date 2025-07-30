"use client"

import { useState, useEffect } from "react"
import { Search, Heart, MessageCircle, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import api from "../utils/api"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const HomePage = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [likedBlogs, setLikedBlogs] = useState(new Set())

  const { user } = useAuth()

  const fetchBlogs = async (searchTerm = "", pageNum = 1, append = false) => {
    try {
      setLoading(pageNum === 1)
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
      })

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await api.get(`/blogs?${params}`)
      const data = response.data

      if (append) {
        setBlogs((prev) => [...prev, ...data.blogs])
      } else {
        setBlogs(data.blogs)
      }

      setHasMore(pageNum < data.pagination.pages)

      // Set liked blogs for authenticated users
      if (user) {
        const liked = new Set()
        data.blogs.forEach((blog) => {
          if (blog.likes.includes(user._id)) {
            liked.add(blog._id)
          }
        })
        setLikedBlogs(liked)
      }
    } catch (error) {
      console.error("Error fetching blogs:", error)
      toast.error("Failed to fetch blogs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchBlogs(searchQuery, 1, false)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchBlogs(searchQuery, nextPage, true)
  }

  const handleLike = async (blogId) => {
    if (!user) {
      toast.error("Please log in to like blogs")
      return
    }

    try {
      const response = await api.post(`/blogs/${blogId}/like`)
      const data = response.data

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
          blog._id === blogId
            ? {
                ...blog,
                likes: data.liked ? [...blog.likes, user._id] : blog.likes.filter((id) => id !== user._id),
              }
            : blog,
        ),
      )
    } catch (error) {
      console.error("Error liking blog:", error)
      toast.error("Failed to like blog")
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Amazing Stories</h1>

        <form onSubmit={handleSearch} className="flex w-full max-w-md space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {loading && blogs.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="space-y-6 mb-8">
            {blogs.map((blog) => (
              <div key={blog._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={blog.author.profilePicture || "/placeholder.svg?height=40&width=40"}
                    alt={blog.author.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <Link to={`/profile/${blog.author._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {blog.author.username}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <Link to={`/blog/${blog._id}`}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">{blog.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{blog.content.substring(0, 200)}...</p>
                </Link>

                {blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                        {tag}
                      </span>
                    ))}
                    {blog.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                        +{blog.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{blog.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{blog.comments.length}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLike(blog._id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
                      likedBlogs.has(blog._id)
                        ? "text-red-500 bg-red-50 hover:bg-red-100"
                        : "text-gray-500 hover:text-red-500 hover:bg-gray-50"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedBlogs.has(blog._id) ? "fill-current" : ""}`} />
                    <span>{blog.likes.length}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {blogs.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No blogs found.</p>
            </div>
          )}

          {hasMore && blogs.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default HomePage
