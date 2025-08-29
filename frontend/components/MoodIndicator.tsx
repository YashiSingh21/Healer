'use client'

import { Smile, Frown, Meh, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MoodIndicatorProps {
  mood: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function MoodIndicator({ mood, showLabel = true, size = 'md' }: MoodIndicatorProps) {
  const getMoodConfig = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'very_positive':
        return {
          icon: TrendingUp,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Very Positive',
          description: 'Feeling great!'
        }
      case 'positive':
        return {
          icon: Smile,
          color: 'text-green-500',
          bg: 'bg-green-100',
          label: 'Positive',
          description: 'Feeling good'
        }
      case 'neutral':
        return {
          icon: Meh,
          color: 'text-gray-500',
          bg: 'bg-gray-100',
          label: 'Neutral',
          description: 'Balanced'
        }
      case 'negative':
        return {
          icon: Frown,
          color: 'text-orange-500',
          bg: 'bg-orange-100',
          label: 'Negative',
          description: 'Feeling down'
        }
      case 'very_negative':
        return {
          icon: TrendingDown,
          color: 'text-red-500',
          bg: 'bg-red-100',
          label: 'Very Negative',
          description: 'Struggling'
        }
      case 'crisis':
        return {
          icon: TrendingDown,
          color: 'text-red-600',
          bg: 'bg-red-200',
          label: 'Crisis',
          description: 'Need support'
        }
      default:
        return {
          icon: Minus,
          color: 'text-gray-400',
          bg: 'bg-gray-50',
          label: 'Unknown',
          description: ''
        }
    }
  }

  const config = getMoodConfig(mood)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const containerClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  return (
    <div className={`flex items-center gap-2 ${config.bg} ${containerClasses[size]} rounded-full transition-all`}>
      <Icon className={`${sizeClasses[size]} ${config.color}`} />
      {showLabel && (
        <span className={`font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  )
}