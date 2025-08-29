'use client'

import { motion } from 'framer-motion'
import { Heart, Brain, Sun, Moon, Coffee } from 'lucide-react'

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void
}

export default function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  const prompts = [
    {
      icon: Heart,
      text: "I'm feeling overwhelmed and need someone to talk to",
      category: "Support"
    },
    {
      icon: Brain,
      text: "Can you help me with some anxiety management techniques?",
      category: "Coping"
    },
    {
      icon: Sun,
      text: "I want to work on building better daily habits",
      category: "Wellness"
    },
    {
      icon: Moon,
      text: "I'm having trouble sleeping and it's affecting my mood",
      category: "Sleep"
    },
    {
      icon: Coffee,
      text: "How can I manage stress at work or school?",
      category: "Stress"
    }
  ]

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        Not sure what to say? Try one of these:
      </p>
      <div className="grid gap-2">
        {prompts.map((prompt, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onSelectPrompt(prompt.text)}
            className="flex items-start gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-border hover:bg-white hover:shadow-md transition-all text-left group"
          >
            <prompt.icon className="w-5 h-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-sm font-medium text-foreground block">
                {prompt.text}
              </span>
              <span className="text-xs text-muted-foreground">
                {prompt.category}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}