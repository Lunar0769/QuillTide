"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/me")
      setUser(response.data)
    } catch (error) {
      localStorage.removeItem("token")
      delete api.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    try {
      const response = await api.post("/auth/signup", userData)
      toast.success(response.data.message)
      return { success: true, userId: response.data.userId }
    } catch (error) {
      const message = error.response?.data?.error || "Registration failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const verifyOTP = async (email, otp) => {
    try {
      const response = await api.post("/auth/verify-otp", { email, otp })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      toast.success("Email verified successfully!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || "Verification failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const resendOTP = async (email) => {
    try {
      const response = await api.post("/auth/resend-otp", { email })
      toast.success(response.data.message)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || "Failed to resend OTP"
      toast.error(message)
      return { success: false }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      toast.success("Login successful!")
      return { success: true }
    } catch (error) {
      const errorData = error.response?.data
      const message = errorData?.error || "Login failed"

      if (errorData?.needsVerification) {
        return {
          success: false,
          needsVerification: true,
          email: errorData.email,
          error: message,
        }
      }

      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
    navigate("/")
    toast.success("Logged out successfully")
  }

  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email })
      toast.success(response.data.message)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || "Failed to send reset email"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      })
      toast.success(response.data.message)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || "Password reset failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    signup,
    verifyOTP,
    resendOTP,
    login,
    logout,
    forgotPassword,
    resetPassword,
    fetchUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
