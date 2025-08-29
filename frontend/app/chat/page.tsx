'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, AlertCircle, Heart, Brain, Smile, Frown, Meh } from 'lucide-react'
import { format } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import CrisisAlert from '@/components/CrisisAlert'
import MoodIndicator from '@/components/MoodIndicator'
import SuggestedPrompts from '@/components/SuggestedPrompts'
import BreathingExercise from '@/components/BreathingExercise'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import PageLayout from '@/components/PageLayout'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  mood?: string
  sentiment?: number
}

interface CrisisIntervention {
  level: string
  resources: any[]
  de_escalation_message: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [currentMood, setCurrentMood] = useState<string>('neutral')
  const [showCrisisAlert, setShowCrisisAlert] = useState(false)
  const [crisisIntervention, setCrisisIntervention] = useState<CrisisIntervention | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `## Hello! I'm here to support you 👋

How are you feeling today?

> **Remember**: This is a safe space where you can share whatever is on your mind.

**Some ways I can help you:**
- Process difficult emotions
- Explore coping strategies  
- Practice mindfulness techniques
- Connect you with resources

*What would you like to talk about today?*`,
        timestamp: new Date(),
      },
    ])
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/message`,
        {
          message: input,
          conversation_id: conversationId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )

      const data = response.data

      // Update conversation ID
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id)
      }

      // Handle crisis intervention
      if (data.crisis_intervention) {
        setCrisisIntervention(data.crisis_intervention)
        setShowCrisisAlert(true)
      }

      // Update mood
      if (data.mood_analysis?.mood_state) {
        setCurrentMood(data.mood_analysis.mood_state)
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        mood: data.mood_analysis?.mood_state,
        sentiment: data.mood_analysis?.sentiment_scores?.compound,
      }

      setMessages(prev => [...prev, assistantMessage])

      // Show therapeutic suggestions if needed
      if (data.therapeutic_elements?.resources?.length > 0) {
        toast.success("I have suggested some helpful resources for you", {
          icon: '💡',
        })
      }

    } catch (error: any) {
      console.error('Chat error:', error)
      
      if (error.response?.status === 401) {
        toast.error('Please log in to continue')
        router.push('/auth/login')
      } else {
        toast.error('Something went wrong. Please try again.')
        
        // Add error message
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `## Connection Issue

I'm having trouble connecting right now. Please try again in a moment.

> **If you're in crisis**, please reach out immediately:
> - **Call 988** - Suicide & Crisis Lifeline
> - **Text HOME to 741741** - Crisis Text Line
> - **Call 911** for emergencies

I'll be here when you're ready to try again. 💙`,
          timestamp: new Date(),
        }])
      }
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive':
      case 'very_positive':
        return <Smile className="w-4 h-4 text-green-500" />
      case 'negative':
      case 'very_negative':
        return <Frown className="w-4 h-4 text-red-500" />
      default:
        return <Meh className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <PageLayout>
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Mental Health Support Chat</h1>
              <p className="text-sm text-muted-foreground">Your safe space for healing</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MoodIndicator mood={currentMood} />
            <button
              onClick={() => setShowBreathing(true)}
              className="px-4 py-2 bg-therapeutic-calm text-primary rounded-lg hover:opacity-90 transition-opacity"
            >
              <Brain className="w-5 h-5 inline mr-2" />
              Breathing Exercise
            </button>
          </div>
        </div>
      </header>

      {/* Crisis Alert */}
      <AnimatePresence>
        {showCrisisAlert && crisisIntervention && (
          <CrisisAlert
            intervention={crisisIntervention}
            onClose={() => setShowCrisisAlert(false)}
          />
        )}
      </AnimatePresence>

      {/* Breathing Exercise Modal */}
      <AnimatePresence>
        {showBreathing && (
          <BreathingExercise onClose={() => setShowBreathing(false)} />
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.role === 'user'
                      ? 'chat-bubble-user'
                      : 'chat-bubble-assistant'
                  }`}
                >
                  {message.role === 'assistant' && message.mood && (
                    <div className="flex items-center gap-2 mb-2 text-sm opacity-70">
                      {getMoodIcon(message.mood)}
                      <span>Mood detected: {message.mood}</span>
                    </div>
                  )}
                  {message.role === 'assistant' ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{message.content}</p>
                  )}
                  <p className="text-xs opacity-50 mt-2">
                    {format(message.timestamp, 'HH:mm')}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="chat-bubble-assistant flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="max-w-4xl mx-auto">
            <SuggestedPrompts onSelectPrompt={handlePromptSelect} />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind... (Press Enter to send)"
              className="flex-1 px-4 py-3 bg-white rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            If you're in crisis, call 988 or text HOME to 741741 for immediate support
          </p>
        </div>
      </div>
    </div>
    </PageLayout>
  )
}