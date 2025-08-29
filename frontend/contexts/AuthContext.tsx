'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  username: string
  full_name: string
  role: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  current_mood: string | null
  streak_days: number
  total_sessions: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Check for existing token on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      // Verify token by fetching user profile
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setUser(response.data)
    } catch (error: any) {
      console.error('Auth check failed:', error)
      // Token is invalid, remove it
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        new URLSearchParams({ username, password }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      const { access_token, refresh_token } = response.data
      
      // Store tokens
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)

      // Fetch user profile
      await refreshUser()
      
      return true
    } catch (error: any) {
      console.error('Login failed:', error)
      toast.error(error.response?.data?.detail || 'Login failed. Please try again.')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    router.push('/auth/login')
    toast.success('Logged out successfully')
  }

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setUser(response.data)
    } catch (error: any) {
      console.error('Failed to refresh user:', error)
      if (error.response?.status === 401) {
        logout()
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext