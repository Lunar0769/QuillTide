import clientPromise from "../lib/mongodb.js"

async function testConnection() {
  try {
    console.log("Testing MongoDB connection...")
    const client = await clientPromise
    const db = client.db("blog-app")

    // Test connection by listing collections
    const collections = await db.listCollections().toArray()
    console.log("✅ MongoDB connection successful!")
    console.log(
      "Available collections:",
      collections.map((c) => c.name),
    )

    // Test JWT secret
    if (process.env.JWT_SECRET) {
      console.log("✅ JWT_SECRET is configured")
    } else {
      console.log("❌ JWT_SECRET is missing")
    }

    console.log("\n🎉 Your blog application is ready to use!")
    console.log("\nNext steps:")
    console.log("1. Visit the home page to see the blog feed")
    console.log("2. Sign up for a new account")
    console.log("3. Create your first blog post")
    console.log("4. Explore user profiles and social features")
  } catch (error) {
    console.error("❌ Connection test failed:", error.message)
  }
}

testConnection()
