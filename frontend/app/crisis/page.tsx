'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, MapPin, Clock, Heart, Shield, AlertCircle, ExternalLink, Copy, Check, Users } from 'lucide-react'

interface CrisisResource {
  id: string
  name: string
  description: string
  type: 'hotline' | 'text' | 'chat' | 'emergency'
  contact: string
  availability: string
  languages?: string[]
  specialties?: string[]
  urgent: boolean
}

const crisisResources: CrisisResource[] = [
  {
    id: 'suicide-lifeline',
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free and confidential emotional support for people in distress or suicidal crisis.',
    type: 'hotline',
    contact: '988',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    specialties: ['Suicide prevention', 'Crisis intervention', 'Mental health'],
    urgent: true
  },
  {
    id: 'crisis-text-line',
    name: 'Crisis Text Line',
    description: 'Free, 24/7 crisis support via text message with trained crisis counselors.',
    type: 'text',
    contact: 'Text HOME to 741741',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    specialties: ['Crisis support', 'Mental health', 'Suicide prevention'],
    urgent: true
  },
  {
    id: 'emergency-services',
    name: 'Emergency Services',
    description: 'Immediate emergency response for life-threatening situations.',
    type: 'emergency',
    contact: '911',
    availability: '24/7',
    specialties: ['Medical emergencies', 'Police', 'Fire'],
    urgent: true
  },
  {
    id: 'samhsa-helpline',
    name: 'SAMHSA National Helpline',
    description: 'Treatment referral and information service for mental health and substance abuse.',
    type: 'hotline',
    contact: '1-800-662-4357',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    specialties: ['Substance abuse', 'Mental health treatment', 'Referrals'],
    urgent: false
  },
  {
    id: 'trans-lifeline',
    name: 'Trans Lifeline',
    description: 'Crisis support specifically for transgender individuals.',
    type: 'hotline',
    contact: '877-565-8860',
    availability: '24/7',
    specialties: ['Transgender support', 'Crisis intervention'],
    urgent: false
  },
  {
    id: 'trevor-project',
    name: 'The Trevor Project',
    description: 'Crisis intervention and suicide prevention for LGBTQ+ youth.',
    type: 'hotline',
    contact: '1-866-488-7386',
    availability: '24/7',
    specialties: ['LGBTQ+ youth', 'Suicide prevention', 'Crisis support'],
    urgent: false
  },
  {
    id: 'veterans-crisis',
    name: 'Veterans Crisis Line',
    description: 'Crisis support specifically for veterans and their families.',
    type: 'hotline',
    contact: '1-800-273-8255',
    availability: '24/7',
    specialties: ['Veterans support', 'Military families', 'PTSD'],
    urgent: false
  },
  {
    id: 'domestic-violence',
    name: 'National Domestic Violence Hotline',
    description: 'Support for those experiencing domestic violence and abuse.',
    type: 'hotline',
    contact: '1-800-799-7233',
    availability: '24/7',
    languages: ['English', 'Spanish', '200+ languages via interpreters'],
    specialties: ['Domestic violence', 'Abuse support', 'Safety planning'],
    urgent: false
  }
]

const copingStrategies = [
  {
    title: 'Deep Breathing',
    description: 'Take slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 4.',
    icon: '🫁'
  },
  {
    title: 'Grounding Technique',
    description: 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.',
    icon: '🌱'
  },
  {
    title: 'Safe Space',
    description: 'Go to a safe, comfortable place or call someone you trust.',
    icon: '🏠'
  },
  {
    title: 'Remove Means',
    description: 'Remove or secure any means of self-harm from your immediate environment.',
    icon: '🔒'
  },
  {
    title: 'Reach Out',
    description: 'Contact a crisis line, trusted friend, family member, or mental health professional.',
    icon: '🤝'
  },
  {
    title: 'Stay Present',
    description: 'Focus on the current moment. Remember that intense feelings will pass.',
    icon: '⏰'
  }
]

export default function CrisisPage() {
  const [copiedResource, setCopiedResource] = useState<string | null>(null)

  const copyToClipboard = (text: string, resourceId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedResource(resourceId)
      setTimeout(() => setCopiedResource(null), 2000)
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotline': return <Phone className="w-6 h-6" />
      case 'text': return <MessageCircle className="w-6 h-6" />
      case 'chat': return <MessageCircle className="w-6 h-6" />
      case 'emergency': return <AlertCircle className="w-6 h-6" />
      default: return <Phone className="w-6 h-6" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hotline': return 'bg-blue-100 text-blue-800'
      case 'text': return 'bg-green-100 text-green-800'
      case 'chat': return 'bg-purple-100 text-purple-800'
      case 'emergency': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const urgentResources = crisisResources.filter(resource => resource.urgent)
  const supportResources = crisisResources.filter(resource => !resource.urgent)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      {/* Crisis Alert Banner */}
      <div className="bg-red-600 text-white py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <p className="text-center font-semibold">
              If you're in immediate danger, call 911 or go to your nearest emergency room
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 rounded-full">
                <Heart className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Crisis Support</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              If you're in crisis or having thoughts of self-harm, you are not alone. 
              Help is available 24/7. Reach out now.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Immediate Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold text-center mb-8">Immediate Help Available Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {urgentResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6 border-2 border-red-200 hover:border-red-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-full ${getTypeColor(resource.type)}`}>
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{resource.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {resource.availability}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{resource.description}</p>

                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl text-red-800">{resource.contact}</span>
                    <button
                      onClick={() => copyToClipboard(resource.contact, resource.id)}
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedResource === resource.id ? (
                        <Check className="w-4 h-4 text-red-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-red-600" />
                      )}
                    </button>
                  </div>
                </div>

                {resource.type === 'hotline' || resource.type === 'emergency' ? (
                  <a
                    href={`tel:${resource.contact.replace(/[^0-9]/g, '')}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    <Phone className="w-5 h-5" />
                    Call Now
                  </a>
                ) : (
                  <div className="w-full text-center px-4 py-3 bg-green-600 text-white rounded-lg font-semibold">
                    Text Available 24/7
                  </div>
                )}

                {resource.specialties && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {resource.specialties.map((specialty) => (
                      <span key={specialty} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Immediate Coping Strategies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Immediate Coping Strategies</h2>
          <p className="text-center text-gray-600 mb-8">
            Try these techniques while you wait for help or to manage intense feelings:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copingStrategies.map((strategy, index) => (
              <motion.div
                key={strategy.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-blue-50 rounded-lg p-4"
              >
                <div className="text-3xl mb-3">{strategy.icon}</div>
                <h3 className="font-semibold mb-2">{strategy.title}</h3>
                <p className="text-sm text-gray-700">{strategy.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Support Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-8 text-center">Specialized Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{resource.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {resource.availability}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{resource.description}</p>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{resource.contact}</span>
                    <button
                      onClick={() => copyToClipboard(resource.contact, resource.id)}
                      className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedResource === resource.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {resource.type === 'hotline' && (
                  <a
                    href={`tel:${resource.contact.replace(/[^0-9]/g, '')}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call Now
                  </a>
                )}

                {resource.languages && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-1">Languages available:</p>
                    <p className="text-sm font-medium">{resource.languages.join(', ')}</p>
                  </div>
                )}

                {resource.specialties && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {resource.specialties.map((specialty) => (
                      <span key={specialty} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Safety Planning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Create a Safety Plan</h2>
          <p className="text-center text-gray-700 mb-8">
            Having a safety plan can help you navigate difficult moments. Consider these steps:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Warning Signs
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Identify your personal warning signs</li>
                <li>• Notice changes in thoughts or feelings</li>
                <li>• Track mood patterns or triggers</li>
                <li>• Be aware of risky situations</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                Coping Strategies
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• List activities that help you feel better</li>
                <li>• Include relaxation techniques</li>
                <li>• Identify safe places to go</li>
                <li>• Plan healthy distractions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Support Network
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• List trusted friends and family</li>
                <li>• Include professional contacts</li>
                <li>• Have multiple backup contacts</li>
                <li>• Keep contact information accessible</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-green-600" />
                Crisis Resources
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Save crisis hotline numbers</li>
                <li>• Know your nearest emergency room</li>
                <li>• Have your therapist's contact info</li>
                <li>• Include crisis text lines</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="https://suicidepreventionlifeline.org/wp-content/uploads/2016/08/Brown_StanleyGuide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <ExternalLink className="w-5 h-5" />
              Download Safety Plan Template
            </a>
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">After the Crisis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Follow Up Care</h3>
              <p className="text-gray-700 text-sm">
                Connect with a mental health professional for ongoing support and treatment.
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Support Groups</h3>
              <p className="text-gray-700 text-sm">
                Join support groups to connect with others who understand your experience.
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Stay Safe</h3>
              <p className="text-gray-700 text-sm">
                Continue using your safety plan and coping strategies to maintain wellness.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}