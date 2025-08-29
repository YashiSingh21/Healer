'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Phone, MessageSquare, X } from 'lucide-react'

interface CrisisResource {
  name: string
  contact: string
}

interface CrisisIntervention {
  level: string
  resources: CrisisResource[]
  de_escalation_message: string
  immediate_actions?: string[]
}

interface CrisisAlertProps {
  intervention: CrisisIntervention
  onClose: () => void
}

export default function CrisisAlert({ intervention, onClose }: CrisisAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4"
    >
      <div className="crisis-alert bg-white rounded-lg shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-red-700">
              Immediate Support Available
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
        </div>

        <p className="text-gray-700 mb-4">{intervention.de_escalation_message}</p>

        {intervention.resources && intervention.resources.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Crisis Resources:</h4>
            {intervention.resources.map((resource, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-red-50 rounded-lg"
              >
                {resource.contact.includes('Text') ? (
                  <MessageSquare className="w-5 h-5 text-red-600" />
                ) : (
                  <Phone className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium text-gray-800">{resource.name}</p>
                  <p className="text-sm text-gray-600">{resource.contact}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Remember:</strong> You don't have to go through this alone. 
            Professional help is available 24/7, and reaching out is a sign of strength.
          </p>
        </div>
      </div>
    </motion.div>
  )
}