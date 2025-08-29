'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, Brain, Shield, MessageCircle, Activity, Users } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Support',
      description: 'Advanced RAG technology provides personalized, evidence-based mental health guidance',
      color: 'text-purple-500',
    },
    {
      icon: Heart,
      title: 'Empathetic Care',
      description: 'Compassionate responses that validate your feelings and provide emotional support',
      color: 'text-red-500',
    },
    {
      icon: Shield,
      title: 'Crisis Detection',
      description: 'Immediate intervention and resources when critical support is needed',
      color: 'text-blue-500',
    },
    {
      icon: Activity,
      title: 'Mood Tracking',
      description: 'Monitor your emotional well-being and track progress over time',
      color: 'text-green-500',
    },
    {
      icon: MessageCircle,
      title: '24/7 Availability',
      description: 'Get support whenever you need it, day or night',
      color: 'text-yellow-500',
    },
    {
      icon: Users,
      title: 'Therapeutic Exercises',
      description: 'Personalized coping strategies and mental wellness exercises',
      color: 'text-indigo-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapeutic-calm to-therapeutic-soothing">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-6">
              Your Mental Health Companion
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Experience compassionate, AI-powered mental health support designed to help you 
              navigate life's challenges with confidence and resilience.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/chat"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all transform hover:scale-105"
              >
                Start Your Journey
              </Link>
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-all"
              >
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">How We Support You</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with therapeutic best practices 
              to provide comprehensive mental health support.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all card-hover"
              >
                <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Begin Your Healing Journey?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Take the first step towards better mental health. Our AI companion is here to 
              listen, understand, and support you every step of the way.
            </p>
            <Link
              href="/chat"
              className="inline-block px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Start Chatting Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2">© 2024 Healer Platform. All rights reserved.</p>
          <p className="text-sm">
            If you're in crisis, please call 988 (Suicide & Crisis Lifeline) or text HOME to 741741
          </p>
        </div>
      </footer>
    </div>
  )
}