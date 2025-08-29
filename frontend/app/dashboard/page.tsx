'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, TrendingUp, Calendar, Activity, Brain, MessageCircle, BookOpen, Users, Target, Star } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageLayout from '@/components/PageLayout'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardData {
  mood_streak: number
  total_sessions: number
  weekly_mood_avg: number
  recent_activities: any[]
  mood_trends: { date: string; mood: string; score: number }[]
  achievements: { id: string; title: string; description: string; earned_at: string }[]
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )
      setDashboardData(response.data)
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to continue')
        router.push('/auth/login')
      } else {
        console.error('Dashboard error:', error)
        // Set mock data for demo
        setDashboardData({
          mood_streak: 7,
          total_sessions: 23,
          weekly_mood_avg: 7.2,
          recent_activities: [
            { type: 'chat', title: 'Mental Health Session', time: '2 hours ago' },
            { type: 'exercise', title: 'Breathing Exercise', time: '5 hours ago' },
            { type: 'mood', title: 'Mood Check-in', time: '1 day ago' },
          ],
          mood_trends: [
            { date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), mood: 'good', score: 7 },
            { date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), mood: 'great', score: 8 },
            { date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), mood: 'okay', score: 6 },
            { date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), mood: 'good', score: 7 },
            { date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), mood: 'great', score: 8 },
            { date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), mood: 'good', score: 7 },
            { date: format(new Date(), 'yyyy-MM-dd'), mood: 'great', score: 8 },
          ],
          achievements: [
            { id: '1', title: 'First Steps', description: 'Completed your first session', earned_at: format(subDays(new Date(), 20), 'yyyy-MM-dd') },
            { id: '2', title: 'Week Warrior', description: '7-day mood tracking streak', earned_at: format(new Date(), 'yyyy-MM-dd') },
          ]
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getMoodColor = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'great':
      case 'excellent':
        return 'text-green-600 bg-green-100'
      case 'good':
        return 'text-blue-600 bg-blue-100'
      case 'okay':
      case 'neutral':
        return 'text-yellow-600 bg-yellow-100'
      case 'poor':
      case 'bad':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-therapeutic-calm to-therapeutic-soothing flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <PageLayout>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Heart className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {getGreeting()}, {user?.username || 'User'}!
                </h1>
                <p className="text-gray-600">Welcome to your mental wellness dashboard</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {format(currentTime, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-lg font-semibold">
                {format(currentTime, 'HH:mm:ss')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-primary">{dashboardData?.mood_streak || 0}</p>
                <p className="text-sm text-gray-500">days</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-green-600">{dashboardData?.total_sessions || 0}</p>
                <p className="text-sm text-gray-500">conversations</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weekly Average</p>
                <p className="text-3xl font-bold text-blue-600">{dashboardData?.weekly_mood_avg?.toFixed(1) || 0}</p>
                <p className="text-sm text-gray-500">mood score</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/chat"
                className="p-4 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors group"
              >
                <MessageCircle className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">Start Chat</h3>
                <p className="text-sm text-gray-600">Begin a therapy session</p>
              </Link>

              <Link
                href="/mood"
                className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
              >
                <Heart className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">Log Mood</h3>
                <p className="text-sm text-gray-600">Track how you feel</p>
              </Link>

              <Link
                href="/exercises"
                className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
              >
                <Brain className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">Exercises</h3>
                <p className="text-sm text-gray-600">Mindfulness activities</p>
              </Link>

              <Link
                href="/resources"
                className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
              >
                <BookOpen className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">Resources</h3>
                <p className="text-sm text-gray-600">Mental health info</p>
              </Link>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {dashboardData?.recent_activities?.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {activity.type === 'chat' && <MessageCircle className="w-4 h-4 text-primary" />}
                    {activity.type === 'exercise' && <Brain className="w-4 h-4 text-green-600" />}
                    {activity.type === 'mood' && <Heart className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                </div>
              ))}
              {(!dashboardData?.recent_activities || dashboardData.recent_activities.length === 0) && (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Mood Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-6 mt-8"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            7-Day Mood Trends
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {dashboardData?.mood_trends?.map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  {format(new Date(day.date), 'EEE')}
                </p>
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xs font-semibold ${getMoodColor(day.mood)}`}>
                  {day.score}
                </div>
                <p className="text-xs text-gray-600 mt-1 capitalize">{day.mood}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        {dashboardData?.achievements && dashboardData.achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-xl p-6 mt-8"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-primary" />
              Recent Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(achievement.earned_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Crisis Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 mt-8"
        >
          <h2 className="text-lg font-semibold text-red-800 mb-4">Need Immediate Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-red-800">Crisis Hotlines</h3>
              <p className="text-sm text-red-700 mt-1">Call 988 - Suicide & Crisis Lifeline</p>
              <p className="text-sm text-red-700">Text HOME to 741741</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-red-800">Emergency Services</h3>
              <p className="text-sm text-red-700 mt-1">Call 911 for immediate emergency</p>
              <Link href="/crisis" className="text-sm text-primary hover:underline">
                View crisis resources →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  )
}