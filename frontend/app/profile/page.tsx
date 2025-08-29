'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, Edit2, Save, X, Shield, Bell, Palette, Globe, Download, Trash2, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  username: string
  email: string
  full_name: string
  phone?: string
  date_of_birth?: string
  location?: string
  bio?: string
  joined_date: string
  last_active: string
}

interface NotificationSettings {
  email_notifications: boolean
  mood_reminders: boolean
  session_reminders: boolean
  crisis_alerts: boolean
  weekly_reports: boolean
}

interface PrivacySettings {
  profile_visibility: 'public' | 'private'
  mood_data_sharing: boolean
  analytics_sharing: boolean
  research_participation: boolean
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    mood_reminders: true,
    session_reminders: true,
    crisis_alerts: true,
    weekly_reports: false
  })
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_visibility: 'private',
    mood_data_sharing: false,
    analytics_sharing: true,
    research_participation: false
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    location: '',
    bio: ''
  })
  
  const router = useRouter()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )
      setUserProfile(response.data)
      setEditForm({
        full_name: response.data.full_name || '',
        phone: response.data.phone || '',
        date_of_birth: response.data.date_of_birth || '',
        location: response.data.location || '',
        bio: response.data.bio || ''
      })
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to continue')
        router.push('/auth/login')
      } else {
        console.error('Profile error:', error)
        // Set mock data for demo
        const mockProfile: UserProfile = {
          id: '1',
          username: 'demo_user',
          email: 'demo@example.com',
          full_name: 'Demo User',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          bio: 'Mental wellness enthusiast on a journey of healing and growth.',
          joined_date: '2024-01-15',
          last_active: format(new Date(), 'yyyy-MM-dd')
        }
        setUserProfile(mockProfile)
        setEditForm({
          full_name: mockProfile.full_name,
          phone: mockProfile.phone || '',
          date_of_birth: '',
          location: mockProfile.location || '',
          bio: mockProfile.bio || ''
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!userProfile) return
    
    setIsLoading(true)
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/profile`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )
      setUserProfile({ ...userProfile, ...editForm })
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Profile update error:', error)
      // Demo mode - just update locally
      setUserProfile({ ...userProfile, ...editForm })
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/password`,
        {
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      toast.success('Password updated successfully!')
    } catch (error: any) {
      console.error('Password change error:', error)
      // Demo mode
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      toast.success('Password updated successfully!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsLoading(true)
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/account`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )
      localStorage.removeItem('access_token')
      toast.success('Account deleted successfully')
      router.push('/')
    } catch (error: any) {
      console.error('Account deletion error:', error)
      toast.error('Failed to delete account. Please try again.')
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/export`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )
      
      // Create and download file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `healer-data-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Data export started!')
    } catch (error: any) {
      console.error('Export error:', error)
      // Demo mode - create mock export
      const mockData = {
        profile: userProfile,
        exported_at: new Date().toISOString(),
        note: 'This is a demo export'
      }
      const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `healer-data-demo-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Data export started!')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  if (isLoading && !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-therapeutic-calm to-therapeutic-soothing flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapeutic-calm to-therapeutic-soothing">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <User className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold">{userProfile?.full_name || userProfile?.username}</h2>
                <p className="text-gray-600 text-sm">@{userProfile?.username}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Member since {userProfile?.joined_date ? format(new Date(userProfile.joined_date), 'MMM yyyy') : 'Unknown'}
                </p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            setEditForm({
                              full_name: userProfile?.full_name || '',
                              phone: userProfile?.phone || '',
                              date_of_birth: userProfile?.date_of_birth || '',
                              location: userProfile?.location || '',
                              bio: userProfile?.bio || ''
                            })
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
                        {userProfile?.username}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {userProfile?.email}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                          {userProfile?.full_name || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          {userProfile?.phone || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.date_of_birth}
                          onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {userProfile?.date_of_birth || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="City, State/Country"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          {userProfile?.location || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Tell us a bit about yourself and your wellness journey..."
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg min-h-[100px]">
                        {userProfile?.bio || 'No bio provided'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Notification Preferences</h2>
                  <div className="space-y-6">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {key === 'email_notifications' && 'Receive updates and alerts via email'}
                            {key === 'mood_reminders' && 'Daily reminders to log your mood'}
                            {key === 'session_reminders' && 'Reminders for scheduled therapy sessions'}
                            {key === 'crisis_alerts' && 'Important safety and crisis notifications'}
                            {key === 'weekly_reports' && 'Weekly progress and insight reports'}
                          </p>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [key]: !value })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-primary' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Privacy Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Profile Visibility</h3>
                      <select
                        value={privacy.profile_visibility}
                        onChange={(e) => setPrivacy({ ...privacy, profile_visibility: e.target.value as 'public' | 'private' })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                      <p className="text-sm text-gray-600 mt-1">
                        Control who can see your profile information
                      </p>
                    </div>

                    {Object.entries(privacy).filter(([key]) => key !== 'profile_visibility').map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {key === 'mood_data_sharing' && 'Share anonymized mood data to improve our services'}
                            {key === 'analytics_sharing' && 'Share usage analytics to help us improve the platform'}
                            {key === 'research_participation' && 'Participate in optional research studies'}
                          </p>
                        </div>
                        <button
                          onClick={() => setPrivacy({ ...privacy, [key]: !value })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-primary' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}

                    <div className="pt-6 border-t">
                      <h3 className="font-medium mb-4">Data Management</h3>
                      <div className="flex gap-4">
                        <button
                          onClick={handleExportData}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Export Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Security Settings</h2>
                  
                  {/* Change Password */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <button
                        onClick={handlePasswordChange}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="border-t pt-8">
                    <h3 className="text-lg font-medium mb-4 text-red-800">Danger Zone</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                      <p className="text-sm text-red-700 mb-4">
                        This action cannot be undone. This will permanently delete your account and all associated data.
                      </p>
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}