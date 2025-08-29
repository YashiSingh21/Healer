'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, RotateCcw } from 'lucide-react'

interface BreathingExerciseProps {
  onClose: () => void
}

export default function BreathingExercise({ onClose }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale')
  const [isActive, setIsActive] = useState(false)
  const [cycle, setCycle] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(4)

  const phaseDurations = {
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 1
  }

  const phaseInstructions = {
    inhale: 'Breathe in slowly',
    hold: 'Hold your breath',
    exhale: 'Exhale completely',
    rest: 'Rest'
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Move to next phase
            const phases: (keyof typeof phaseDurations)[] = ['inhale', 'hold', 'exhale', 'rest']
            const currentIndex = phases.indexOf(phase)
            const nextPhase = phases[(currentIndex + 1) % phases.length]
            
            setPhase(nextPhase)
            
            if (nextPhase === 'inhale') {
              setCycle(prev => prev + 1)
            }
            
            return phaseDurations[nextPhase]
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isActive, phase])

  const handleStart = () => {
    setIsActive(true)
    setPhase('inhale')
    setTimeRemaining(phaseDurations.inhale)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setPhase('inhale')
    setCycle(0)
    setTimeRemaining(phaseDurations.inhale)
  }

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.5
      case 'hold':
        return 1.5
      case 'exhale':
        return 0.8
      case 'rest':
        return 1
      default:
        return 1
    }
  }

  const getCircleColor = () => {
    switch (phase) {
      case 'inhale':
        return 'bg-blue-400'
      case 'hold':
        return 'bg-purple-400'
      case 'exhale':
        return 'bg-green-400'
      case 'rest':
        return 'bg-gray-400'
      default:
        return 'bg-blue-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">4-7-8 Breathing</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative flex items-center justify-center h-64 mb-8">
          <motion.div
            animate={{ 
              scale: getCircleScale(),
              transition: { duration: 1, ease: "easeInOut" }
            }}
            className={`w-32 h-32 rounded-full ${getCircleColor()} opacity-70 absolute`}
          />
          <motion.div
            animate={{ 
              scale: getCircleScale() * 0.7,
              transition: { duration: 1, ease: "easeInOut" }
            }}
            className={`w-24 h-24 rounded-full ${getCircleColor()} opacity-50 absolute`}
          />
          <div className="text-center z-10">
            <p className="text-lg font-medium mb-2">
              {phaseInstructions[phase]}
            </p>
            <p className="text-3xl font-bold text-primary">
              {timeRemaining}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Cycle: {cycle}
          </p>
          <p className="text-xs text-muted-foreground">
            Inhale for 4, hold for 7, exhale for 8 seconds
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Play className="w-5 h-5" />
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>

        <div className="mt-6 p-4 bg-therapeutic-calm rounded-lg">
          <p className="text-sm text-gray-600">
            This exercise helps activate your body's relaxation response and can reduce anxiety and stress.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}