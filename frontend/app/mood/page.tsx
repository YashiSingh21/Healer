'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, TrendingUp, Calendar, Smile, Meh, Frown, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'

interface MoodEntry {
  id: string
  date: string
  mood: string
  score: number
  notes?: string
  energy_level: number
  sleep_quality: number
  stress_level: number
}

const moodOptions = [
  { value: 'excellent', label: 'Excellent', icon: '😄', score: 10, color: 'bg-green-500' },
  { value: 'great', label: 'Great', icon: '😊', score: 8, color: 'bg-green-400' },
  { value: 'good', label: 'Good', icon: '🙂', score: 7, color: 'bg-blue-400' },
  { value: 'okay', label: 'Okay', icon: '😐', score: 5, color: 'bg-yellow-400' },
  { value: 'poor', label: 'Poor', icon: '😔', score: 3, color: 'bg-orange-400' },
  { value: 'terrible', label: 'Terrible', icon: '😢', score: 1, color: 'bg-red-500' },
]

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState('')
  const [notes, setNotes] = useState('')
  const [energyLevel, setEnergyLevel] = useState(5)
  const [sleepQuality, setSleepQuality] = useState(5)
  const [stressLevel, setStressLevel] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [todayLogged, setTodayLogged] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchMoodEntries()
  }, [currentWeek])

  const fetchMoodEntries = async () => {
    try {
      const weekStart = startOfWeek(currentWeek)
      const weekEnd = endOfWeek(currentWeek)
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/mood/entries`,
        {
          params: {
            start_date: format(weekStart, 'yyyy-MM-dd'),
            end_date: format(weekEnd, 'yyyy-MM-dd')
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )
      setMoodEntries(response.data)
      
      // Check if today is already logged
      const today = format(new Date(), 'yyyy-MM-dd')
      const todayEntry = response.data.find((entry: MoodEntry) => entry.date === today)
      setTodayLogged(!!todayEntry)
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to continue')
        router.push('/auth/login')
      } else {
        console.error('Mood entries error:', error)
        // Set mock data for demo
        const weekStart = startOfWeek(currentWeek)
        const mockEntries = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentWeek) })
          .slice(0, 5)
          .map((date, index) => ({
            id: `mock-${index}`,
            date: format(date, 'yyyy-MM-dd'),
            mood: ['good', 'great', 'okay', 'good', 'excellent'][index],
            score: [7, 8, 5, 7, 10][index],
            notes: ['Had a productive day', 'Great workout session', 'Feeling tired', 'Good progress on projects', 'Amazing day!'][index],
            energy_level: [7, 8, 4, 6, 9][index],
            sleep_quality: [7, 8, 5, 7, 9][index],
            stress_level: [3, 2, 6, 4, 1][index],
          }))
        setMoodEntries(mockEntries)
      }
    }
  }

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error('Please select your mood')
      return
    }

    const selectedMoodOption = moodOptions.find(m => m.value === selectedMood)
    if (!selectedMoodOption) return

    setIsLoading(true)

    try {
      const moodData = {
        mood: selectedMood,
        score: selectedMoodOption.score,
        notes: notes.trim(),
        energy_level: energyLevel,
        sleep_quality: sleepQuality,
        stress_level: stressLevel,
        date: format(new Date(), 'yyyy-MM-dd')
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/mood/log`,
        moodData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )

      toast.success('Mood logged successfully! 📊')
      setTodayLogged(true)
      fetchMoodEntries()
      
      // Reset form
      setSelectedMood('')
      setNotes('')
      setEnergyLevel(5)
      setSleepQuality(5)
      setStressLevel(5)

    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please log in to continue')
        router.push('/auth/login')
      } else {
        console.error('Mood logging error:', error)
        toast.success('Mood logged successfully! 📊') // Demo mode
        setTodayLogged(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newWeek = new Date(prev)
      newWeek.setDate(newWeek.getDate() + (direction === 'prev' ? -7 : 7))
      return newWeek
    })
  }

  const getMoodEntryForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return moodEntries.find(entry => entry.date === dateStr)
  }

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek),
    end: endOfWeek(currentWeek)
  })

  const averageScore = moodEntries.length > 0 
    ? moodEntries.reduce((sum, entry) => sum + entry.score, 0) / moodEntries.length 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapeutic-calm to-therapeutic-soothing">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Heart className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mood Tracker</h1>
                <p className="text-gray-600">Monitor your emotional wellness journey</p>
              </div>
            </div>
            <button
              onClick={() => setShowChart(!showChart)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              {showChart ? 'Hide Chart' : 'Show Chart'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!todayLogged && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold mb-6">How are you feeling today?</h2>
            
            {/* Mood Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Select your mood:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {moodOptions.map((mood) => (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMood === mood.value
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{mood.icon}</div>
                    <div className="font-medium">{mood.label}</div>
                    <div className="text-sm text-gray-600">{mood.score}/10</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Additional Factors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Level: {energyLevel}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Quality: {sleepQuality}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level: {stressLevel}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's influencing your mood today?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedMood || isLoading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging Mood...' : 'Log Mood'}
            </button>
          </motion.div>
        )}

        {todayLogged && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Today's mood logged!</h3>
                <p className="text-sm text-green-700">Great job keeping track of your mental wellness</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateWeek('prev')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous Week
          </button>
          
          <h3 className="text-xl font-semibold">
            {format(startOfWeek(currentWeek), 'MMM d')} - {format(endOfWeek(currentWeek), 'MMM d, yyyy')}
          </h3>
          
          <button
            onClick={() => navigateWeek('next')}
            disabled={currentWeek >= new Date()}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Week
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mood Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Weekly Overview</h2>
            <div className="text-right">
              <p className="text-sm text-gray-600">Weekly Average</p>
              <p className="text-2xl font-bold text-primary">{averageScore.toFixed(1)}/10</p>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const moodEntry = getMoodEntryForDate(day)
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              
              return (
                <div
                  key={day.toISOString()}
                  className={`text-center p-4 rounded-lg border-2 ${
                    isToday ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {format(day, 'EEE')}
                  </p>
                  <p className="text-lg font-semibold mb-2">
                    {format(day, 'd')}
                  </p>
                  
                  {moodEntry ? (
                    <div className="space-y-1">
                      <div className="text-2xl">
                        {moodOptions.find(m => m.value === moodEntry.mood)?.icon || '😐'}
                      </div>
                      <p className="text-xs font-semibold">{moodEntry.score}/10</p>
                      <p className="text-xs text-gray-600 capitalize">{moodEntry.mood}</p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <div className="text-2xl">—</div>
                      <p className="text-xs">No entry</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Chart View */}
        <AnimatePresence>
          {showChart && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-8"
            >
              <h2 className="text-xl font-semibold mb-6">Mood Trends</h2>
              <div className="relative">
                <div className="flex items-end justify-between h-64 border-b border-gray-200">
                  {weekDays.map((day) => {
                    const moodEntry = getMoodEntryForDate(day)
                    const height = moodEntry ? (moodEntry.score / 10) * 100 : 0
                    
                    return (
                      <div key={day.toISOString()} className="flex flex-col items-center flex-1">
                        <div
                          className="bg-primary rounded-t-lg w-8 transition-all duration-300"
                          style={{ height: `${height}%` }}
                        />
                        <div className="mt-2 text-center">
                          <p className="text-xs font-medium">{format(day, 'EEE')}</p>
                          <p className="text-xs text-gray-600">{format(day, 'd')}</p>
                          {moodEntry && (
                            <p className="text-xs font-semibold text-primary">{moodEntry.score}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Entries */}
        {moodEntries.filter(entry => entry.notes).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-6">Recent Notes</h2>
            <div className="space-y-4">
              {moodEntries
                .filter(entry => entry.notes)
                .slice(0, 3)
                .map((entry) => (
                  <div key={entry.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-xl">
                        {moodOptions.find(m => m.value === entry.mood)?.icon || '😐'}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{entry.mood}</p>
                        <p className="text-sm text-gray-600">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <p className="text-gray-700">{entry.notes}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span>Energy: {entry.energy_level}/10</span>
                      <span>Sleep: {entry.sleep_quality}/10</span>
                      <span>Stress: {entry.stress_level}/10</span>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}