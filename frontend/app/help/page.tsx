'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, Search, MessageCircle, Mail, Phone, Book, Users, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'What is Healer and how does it work?',
    answer: 'Healer is an AI-powered mental health support platform that provides 24/7 personalized assistance. Our AI uses natural language processing to understand your concerns and provides evidence-based therapeutic responses, mood tracking, and crisis intervention when needed.',
    category: 'general'
  },
  {
    id: '2',
    question: 'Is Healer a replacement for traditional therapy?',
    answer: 'No, Healer is designed to complement, not replace, traditional therapy. While our AI can provide support and coping strategies, we encourage users to work with licensed mental health professionals for comprehensive care. Our platform can help between sessions or when professional help isn\'t immediately available.',
    category: 'general'
  },
  {
    id: '3',
    question: 'Is my data private and secure?',
    answer: 'Yes, your privacy is our top priority. All conversations are encrypted end-to-end, and we never share your personal information without explicit consent. Our platform complies with HIPAA guidelines and other privacy regulations. You can review our privacy policy for complete details.',
    category: 'privacy'
  },
  {
    id: '4',
    question: 'What happens if I\'m having a crisis?',
    answer: 'Our AI is trained to detect crisis situations and will immediately provide crisis intervention resources, including hotline numbers and emergency contacts. We also alert our crisis response team when appropriate. If you\'re in immediate danger, please call 911 or your local emergency services.',
    category: 'crisis'
  },
  {
    id: '5',
    question: 'How accurate is the mood tracking?',
    answer: 'Our mood tracking combines self-reported data with AI analysis of your conversations. While quite accurate for tracking trends and patterns, it\'s not a medical diagnosis. The insights are meant to help you understand your emotional patterns and share information with healthcare providers.',
    category: 'features'
  },
  {
    id: '6',
    question: 'Can I use Healer on mobile devices?',
    answer: 'Yes, Healer is fully responsive and works on all devices - desktop, tablet, and mobile. We also have dedicated mobile apps for iOS and Android with additional features like push notifications for mood reminders and offline access to coping exercises.',
    category: 'technical'
  },
  {
    id: '7',
    question: 'Is Healer free to use?',
    answer: 'Healer offers both free and premium tiers. The free version includes basic chat functionality, mood tracking, and crisis resources. Premium features include unlimited conversations, detailed analytics, personalized exercise recommendations, and priority support.',
    category: 'billing'
  },
  {
    id: '8',
    question: 'How do I get started?',
    answer: 'Simply create a free account by providing your email and creating a username. You can start chatting immediately - no lengthy forms or waiting periods. We recommend completing your profile for more personalized support.',
    category: 'getting-started'
  },
  {
    id: '9',
    question: 'What if I\'m not satisfied with the responses?',
    answer: 'Our AI continuously learns and improves. You can provide feedback on responses to help train the system. If you\'re consistently unsatisfied, consider speaking with a human therapist or counselor. We also have a support team that can help troubleshoot specific issues.',
    category: 'support'
  },
  {
    id: '10',
    question: 'Can I export my data?',
    answer: 'Yes, you have full control over your data. You can export your conversation history, mood tracking data, and profile information at any time through your account settings. This is useful for sharing with healthcare providers or for your own records.',
    category: 'privacy'
  }
]

const categories = [
  { value: 'all', label: 'All Topics' },
  { value: 'general', label: 'General Questions' },
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'features', label: 'Features & Tools' },
  { value: 'privacy', label: 'Privacy & Security' },
  { value: 'crisis', label: 'Crisis Support' },
  { value: 'technical', label: 'Technical Issues' },
  { value: 'billing', label: 'Billing & Plans' },
  { value: 'support', label: 'Support' }
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapeutic-calm to-therapeutic-soothing">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <HelpCircle className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
              <p className="text-gray-600">Find answers to common questions and get support</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Help Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <Link
            href="/chat"
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all group"
          >
            <div className="p-3 bg-primary/10 rounded-full w-fit mb-4 group-hover:bg-primary/20 transition-colors">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start Chatting</h3>
            <p className="text-gray-600 text-sm">Begin a conversation with our AI support system</p>
          </Link>

          <Link
            href="/resources"
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all group"
          >
            <div className="p-3 bg-green-100 rounded-full w-fit mb-4 group-hover:bg-green-200 transition-colors">
              <Book className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Resources</h3>
            <p className="text-gray-600 text-sm">Access mental health resources and tools</p>
          </Link>

          <Link
            href="/crisis"
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all group"
          >
            <div className="p-3 bg-red-100 rounded-full w-fit mb-4 group-hover:bg-red-200 transition-colors">
              <Phone className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Crisis Support</h3>
            <p className="text-gray-600 text-sm">Immediate help for crisis situations</p>
          </Link>

          <a
            href="mailto:support@healer.com"
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all group"
          >
            <div className="p-3 bg-blue-100 rounded-full w-fit mb-4 group-hover:bg-blue-200 transition-colors">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
            <p className="text-gray-600 text-sm">Get personalized help from our team</p>
          </a>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-w-[200px]"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'} found
            </p>
          </div>

          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-gray-200 rounded-lg"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFAQ === faq.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFAQ === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search terms or category filter.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Popular Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold mb-6">Popular Help Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Getting Started
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <Link href="#" className="hover:text-primary">How to create an account</Link></li>
                <li>• <Link href="#" className="hover:text-primary">First conversation tips</Link></li>
                <li>• <Link href="#" className="hover:text-primary">Setting up your profile</Link></li>
                <li>• <Link href="#" className="hover:text-primary">Understanding AI responses</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy & Safety
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <Link href="#" className="hover:text-primary">How we protect your data</Link></li>
                <li>• <Link href="#" className="hover:text-primary">Crisis intervention process</Link></li>
                <li>• <Link href="#" className="hover:text-primary">Data retention policies</Link></li>
                <li>• <Link href="#" className="hover:text-primary">Account deletion</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Features & Tools
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <Link href="#" className="hover:text-primary">Mood tracking guide</Link></li>
                <li>• <Link href="#" className="hover:text-primary">Using therapeutic exercises</Link></li>
                <li>• <Link href="#" className="hover:text-primary">Progress monitoring</Link></li>
                <li>• <Link href="#" className="hover:text-primary">Resource recommendations</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Book className="w-5 h-5 text-primary" />
                Best Practices
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <Link href="#" className="hover:text-primary">Maximizing your sessions</Link></li>
                <li>• <Link href="#" className="hover:text-primary">When to seek professional help</Link></li>
                <li>• <Link href="#" className="hover:text-primary">Building healthy habits</Link></li>
                <li>• <Link href="#" className="hover:text-primary">Working with therapists</Link></li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            If you can't find the answer you're looking for, our support team is here to help. 
            We typically respond to inquiries within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@healer.com"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Mail className="w-5 h-5" />
              Email Support
            </a>
            <Link
              href="/chat"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
            >
              <MessageCircle className="w-5 h-5" />
              Live Chat
            </Link>
          </div>
        </motion.div>

        {/* Emergency Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 mt-8 text-center"
        >
          <h3 className="text-lg font-semibold text-red-800 mb-2">🚨 Emergency Support</h3>
          <p className="text-red-700 mb-4">
            If you're experiencing a mental health crisis or having thoughts of self-harm, please seek immediate help.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
            <span className="text-red-700 font-medium">Call 988 - Suicide & Crisis Lifeline</span>
            <span className="text-red-700">|</span>
            <span className="text-red-700 font-medium">Text HOME to 741741</span>
            <span className="text-red-700">|</span>
            <span className="text-red-700 font-medium">Call 911 for emergencies</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}