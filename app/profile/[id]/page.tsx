"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import type { User, UserStats } from "@/lib/models/User"
import type { BlogWithAuthor } from "@/lib/models/Blog"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BlogCard from "@/components/BlogCard"
import { useToast } from "@/hooks/use-toast"
import { Users, FileText, Eye, Heart, MessageCircle, UserPlus, UserMinus, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const params = useParams()
  const { user, token } = useAuth()
  const { toast } = useToast()

  const userId = params.id as string

  useEffect(() => {
    fetchProfile()
    fetchUserBlogs()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProfileUser(data.user)
        setStats(data.stats)

        // Check if current user is following this user
        if (user && data.user.followers.includes(user._id)) {
          setIsFollowing(true)
        }
      } else {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBlogs = async () => {
    try {
      const response = await fetch(`/api/blogs?author=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setBlogs(data.blogs)
      }
    } catch (error) {
      console.error("Error fetching user blogs:", error)
    }
  }

  const handleFollow = async () => {
    if (!user || !token) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users",
        variant: "destructive",
      })
      return
    }

    setFollowLoading(true)

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.following)

        // Update follower count
        setStats((prev) =>
          prev
            ? {
                ...prev,
                followersCount: data.following ? prev.followersCount + 1 : prev.followersCount - 1,
              }
            : null,
        )

        toast({
          title: data.following ? "Following" : "Unfollowed",
          description: data.following
            ? `You are now following ${profileUser?.username}`
            : `You unfollowed ${profileUser?.username}`,
        })
      }
    } catch (error) {
      console.error("Error following user:", error)
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      })
    } finally {
      setFollowLoading(false)
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

  if (!profileUser || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">User not found</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = user && user._id === profileUser._id.toString()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileUser.profilePicture || "/placeholder.svg"} alt={profileUser.username} />
                <AvatarFallback className="text-2xl">{profileUser.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h1 className="text-2xl font-bold">{profileUser.username}</h1>
                  {!isOwnProfile && user && (
                    <Button
                      onClick={handleFollow}
                      disabled={followLoading}
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                    >
                      {followLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isFollowing ? (
                        <UserMinus className="mr-2 h-4 w-4" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </div>

                {profileUser.bio && <p className="text-muted-foreground">{profileUser.bio}</p>}

                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{stats.followersCount} followers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{stats.followingCount} following</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBlogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="blogs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="blogs">Blogs ({stats.totalBlogs})</TabsTrigger>
          </TabsList>

          <TabsContent value="blogs" className="space-y-4">
            {blogs.length > 0 ? (
              <div className="grid gap-6">
                {blogs.map((blog) => (
                  <BlogCard key={blog._id!.toString()} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't written any blogs yet." : "This user hasn't written any blogs yet."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
