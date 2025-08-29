'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Heart, Zap, Wind, Clock, Play, Pause, RotateCcw, CheckCircle, ArrowRight } from 'lucide-react'

interface Exercise {
  id: string
  title: string
  description: string
  duration: number
  category: 'breathing' | 'meditation' | 'grounding' | 'cognitive'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: React.ReactNode
  color: string
}

const exercises: Exercise[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    description: 'A simple 4-4-4-4 breathing technique to reduce anxiety and promote calm.',
    duration: 300,
    category: 'breathing',
    difficulty: 'beginner',
    icon: <Wind className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  {
    id: '54321-grounding',
    title: '5-4-3-2-1 Grounding',
    description: 'Use your senses to ground yourself in the present moment.',
    duration: 180,
    category: 'grounding',
    difficulty: 'beginner',
    icon: <Brain className="w-6 h-6" />,
    color: 'bg-green-500'
  },
  {
    id: 'body-scan',
    title: 'Progressive Body Scan',
    description: 'Systematically relax each part of your body to release tension.',
    duration: 600,
    category: 'meditation',
    difficulty: 'intermediate',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-purple-500'
  },
  {
    id: 'cognitive-reframing',
    title: 'Thought Reframing',
    description: 'Learn to identify and challenge negative thought patterns.',
    duration: 420,
    category: 'cognitive',
    difficulty: 'intermediate',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-orange-500'
  },
  {
    id: 'loving-kindness',
    title: 'Loving Kindness Meditation',
    description: 'Cultivate compassion for yourself and others.',
    duration: 480,
    category: 'meditation',
    difficulty: 'beginner',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-pink-500'
  },
  {
    id: 'power-breathing',
    title: 'Power Breathing',
    description: 'Energizing breath work to boost confidence and focus.',
    duration: 240,
    category: 'breathing',
    difficulty: 'advanced',
    icon: <Wind className="w-6 h-6" />,
    color: 'bg-red-500'
  }
]

interface BreathingExerciseProps {
  exercise: Exercise
  onComplete: () => void
  onClose: () => void
}

const BreathingExercise = ({ exercise, onComplete, onClose }: BreathingExerciseProps) => {
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale')
  const [isActive, setIsActive] = useState(false)
  const [currentCycle, setCurrentCycle] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(exercise.duration)

  const phaseInstructions = {
    inhale: 'Breathe In',
    hold1: 'Hold',
    exhale: 'Breathe Out',
    hold2: 'Hold'
  }

  const phaseDurations = {
    inhale: 4000,
    hold1: 4000,
    exhale: 4000,
    hold2: 4000
  }

  useState(() => {
    let interval: NodeJS.Timeout
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false)
            onComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  })

  useState(() => {
    let phaseInterval: NodeJS.Timeout
    
    if (isActive) {
      const cyclePhases = ['inhale', 'hold1', 'exhale', 'hold2'] as const
      let currentPhaseIndex = 0
      
      phaseInterval = setInterval(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % cyclePhases.length
        setPhase(cyclePhases[currentPhaseIndex])
        
        if (currentPhaseIndex === 0) {
          setCurrentCycle(prev => prev + 1)
        }
      }, 4000)
    }

    return () => clearInterval(phaseInterval)
  })

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCircleSize = () => {
    switch (phase) {
      case 'inhale': return 'scale-150'
      case 'hold1': return 'scale-150'
      case 'exhale': return 'scale-100'
      case 'hold2': return 'scale-100'
      default: return 'scale-100'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">{exercise.title}</h3>
          <p className="text-gray-600">{formatTime(timeRemaining)} remaining</p>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white transition-transform duration-4000 ease-in-out ${getCircleSize()}`}>
            <Wind className="w-12 h-12" />
          </div>
          <p className="text-xl font-semibold mt-4">{phaseInstructions[phase]}</p>
          <p className="text-sm text-gray-600">Cycle {currentCycle + 1}</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          
          <button
            onClick={() => {
              setIsActive(false)
              setTimeRemaining(exercise.duration)
              setCurrentCycle(0)
              setPhase('inhale')
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface GroundingExerciseProps {
  exercise: Exercise
  onComplete: () => void
  onClose: () => void
}

const GroundingExercise = ({ exercise, onComplete, onClose }: GroundingExerciseProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)

  const steps = [
    { count: 5, sense: 'see', instruction: 'Name 5 things you can see around you' },
    { count: 4, sense: 'touch', instruction: 'Name 4 things you can touch' },
    { count: 3, sense: 'hear', instruction: 'Name 3 things you can hear' },
    { count: 2, sense: 'smell', instruction: 'Name 2 things you can smell' },
    { count: 1, sense: 'taste', instruction: 'Name 1 thing you can taste' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setCompleted(true)
      onComplete()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full"
      >
        {!completed ? (
          <>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">{exercise.title}</h3>
              <div className="flex justify-center mb-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full mx-1 ${
                      index === currentStep ? 'bg-primary' : index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="text-center mb-8">
              <div className={`w-24 h-24 rounded-full ${exercise.color} flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4`}>
                {steps[currentStep].count}
              </div>
              <p className="text-lg font-semibold mb-2">{steps[currentStep].instruction}</p>
              <p className="text-gray-600">Take your time to notice each one</p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white mx-auto mb-4">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Well Done!</h3>
            <p className="text-gray-600 mb-6">You've completed the grounding exercise. How do you feel?</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function ExercisesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)
  const [completedExercises, setCompletedExercises] = useState<string[]>([])

  const categories = [
    { value: 'all', label: 'All Exercises' },
    { value: 'breathing', label: 'Breathing' },
    { value: 'meditation', label: 'Meditation' },
    { value: 'grounding', label: 'Grounding' },
    { value: 'cognitive', label: 'Cognitive' },
  ]

  const filteredExercises = selectedCategory === 'all' 
    ? exercises 
    : exercises.filter(exercise => exercise.category === selectedCategory)

  const handleExerciseComplete = () => {
    if (activeExercise && !completedExercises.includes(activeExercise.id)) {
      setCompletedExercises(prev => [...prev, activeExercise.id])
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100'
      case 'advanced': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapeutic-calm to-therapeutic-soothing">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Brain className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Therapeutic Exercises</h1>
              <p className="text-gray-600">Evidence-based activities to support your mental wellness</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Your Progress</h2>
              <p className="text-gray-600">Keep up the great work!</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{completedExercises.length}</div>
              <p className="text-sm text-gray-600">Exercises Completed</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round((completedExercises.length / exercises.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedExercises.length / exercises.length) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise, index) => {
            const isCompleted = completedExercises.includes(exercise.id)
            
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all cursor-pointer ${
                  isCompleted ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setActiveExercise(exercise)}
              >
                {isCompleted && (
                  <div className="flex justify-end mb-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-full ${exercise.color} flex items-center justify-center text-white mb-4`}>
                  {exercise.icon}
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{exercise.title}</h3>
                <p className="text-gray-600 mb-4">{exercise.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{formatDuration(exercise.duration)}</span>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className={`w-full text-center py-2 rounded-lg font-medium transition-colors ${
                    isCompleted 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}>
                    {isCompleted ? 'Completed' : 'Start Exercise'}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8"
        >
          <h2 className="text-lg font-semibold text-blue-800 mb-4">💡 Exercise Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h3 className="font-medium mb-1">Find a quiet space</h3>
              <p>Choose a comfortable environment where you won't be disturbed.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Be patient with yourself</h3>
              <p>It's normal for your mind to wander. Gently bring your attention back.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Practice regularly</h3>
              <p>Even 5 minutes daily can make a significant difference.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Use headphones if helpful</h3>
              <p>Audio guidance can enhance your experience during exercises.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Exercise Modals */}
      <AnimatePresence>
        {activeExercise && (
          <>
            {activeExercise.category === 'breathing' && (
              <BreathingExercise
                exercise={activeExercise}
                onComplete={handleExerciseComplete}
                onClose={() => setActiveExercise(null)}
              />
            )}
            {activeExercise.category === 'grounding' && (
              <GroundingExercise
                exercise={activeExercise}
                onComplete={handleExerciseComplete}
                onClose={() => setActiveExercise(null)}
              />
            )}
            {(activeExercise.category === 'meditation' || activeExercise.category === 'cognitive') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
                >
                  <div className={`w-16 h-16 rounded-full ${activeExercise.color} flex items-center justify-center text-white mx-auto mb-4`}>
                    {activeExercise.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{activeExercise.title}</h3>
                  <p className="text-gray-600 mb-6">{activeExercise.description}</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Duration: {formatDuration(activeExercise.duration)}
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        handleExerciseComplete()
                        setActiveExercise(null)
                      }}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => setActiveExercise(null)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}