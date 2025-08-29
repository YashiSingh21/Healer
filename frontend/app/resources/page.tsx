'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Phone, Heart, Users, ExternalLink, Search, Filter, Clock, Star, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Resource {
  id: string
  title: string
  description: string
  category: 'crisis' | 'therapy' | 'support' | 'education' | 'tools' | 'community'
  type: 'article' | 'hotline' | 'website' | 'app' | 'book' | 'video' | 'directory'
  url?: string
  phone?: string
  rating?: number
  featured: boolean
  free: boolean
  tags: string[]
}

const resources: Resource[] = [
  {
    id: 'crisis-text-line',
    title: 'Crisis Text Line',
    description: '24/7 crisis support via text message. Text HOME to 741741 to connect with a crisis counselor.',
    category: 'crisis',
    type: 'hotline',
    phone: '741741',
    rating: 4.8,
    featured: true,
    free: true,
    tags: ['crisis', 'text', '24/7', 'immediate']
  },
  {
    id: 'suicide-lifeline',
    title: '988 Suicide & Crisis Lifeline',
    description: 'Free and confidential emotional support to people in suicidal crisis or emotional distress.',
    category: 'crisis',
    type: 'hotline',
    phone: '988',
    rating: 4.9,
    featured: true,
    free: true,
    tags: ['crisis', 'suicide', 'phone', '24/7']
  },
  {
    id: 'headspace',
    title: 'Headspace',
    description: 'Meditation and mindfulness app with guided sessions for anxiety, stress, and sleep.',
    category: 'tools',
    type: 'app',
    url: 'https://headspace.com',
    rating: 4.5,
    featured: true,
    free: false,
    tags: ['meditation', 'anxiety', 'sleep', 'mindfulness']
  },
  {
    id: 'nami',
    title: 'National Alliance on Mental Illness (NAMI)',
    description: 'Education, support groups, and advocacy for individuals and families affected by mental illness.',
    category: 'support',
    type: 'website',
    url: 'https://nami.org',
    rating: 4.7,
    featured: true,
    free: true,
    tags: ['support groups', 'education', 'family', 'advocacy']
  },
  {
    id: 'psychology-today',
    title: 'Psychology Today Therapist Directory',
    description: 'Find mental health professionals in your area. Search by location, insurance, and specialties.',
    category: 'therapy',
    type: 'directory',
    url: 'https://psychologytoday.com',
    rating: 4.4,
    featured: false,
    free: true,
    tags: ['therapist', 'directory', 'insurance', 'local']
  },
  {
    id: 'calm',
    title: 'Calm',
    description: 'Sleep stories, meditation, and relaxation programs to reduce anxiety and improve sleep.',
    category: 'tools',
    type: 'app',
    url: 'https://calm.com',
    rating: 4.6,
    featured: false,
    free: false,
    tags: ['sleep', 'meditation', 'anxiety', 'relaxation']
  },
  {
    id: 'samhsa',
    title: 'SAMHSA National Helpline',
    description: 'Information and referrals for mental health and substance abuse treatment services.',
    category: 'crisis',
    type: 'hotline',
    phone: '1-800-662-4357',
    rating: 4.3,
    featured: false,
    free: true,
    tags: ['information', 'referrals', 'treatment', 'substance abuse']
  },
  {
    id: 'mental-health-america',
    title: 'Mental Health America',
    description: 'Mental health screening tools, resources, and advocacy for mental health awareness.',
    category: 'education',
    type: 'website',
    url: 'https://mhanational.org',
    rating: 4.5,
    featured: false,
    free: true,
    tags: ['screening', 'awareness', 'education', 'advocacy']
  },
  {
    id: 'betterhelp',
    title: 'BetterHelp',
    description: 'Online counseling and therapy services with licensed professional counselors.',
    category: 'therapy',
    type: 'website',
    url: 'https://betterhelp.com',
    rating: 4.2,
    featured: false,
    free: false,
    tags: ['online therapy', 'counseling', 'licensed', 'professional']
  },
  {
    id: 'anxiety-depression-association',
    title: 'Anxiety & Depression Association of America',
    description: 'Resources, support groups, and educational materials for anxiety and depression.',
    category: 'education',
    type: 'website',
    url: 'https://adaa.org',
    rating: 4.6,
    featured: false,
    free: true,
    tags: ['anxiety', 'depression', 'support groups', 'education']
  },
  {
    id: 'mindfulness-book',
    title: 'The Mindful Way Through Depression',
    description: 'Book combining mindfulness techniques with cognitive therapy for depression recovery.',
    category: 'education',
    type: 'book',
    rating: 4.4,
    featured: false,
    free: false,
    tags: ['mindfulness', 'depression', 'cognitive therapy', 'self-help']
  },
  {
    id: '7-cups',
    title: '7 Cups',
    description: 'Free emotional support from trained listeners and affordable online therapy.',
    category: 'support',
    type: 'website',
    url: 'https://7cups.com',
    rating: 4.1,
    featured: false,
    free: true,
    tags: ['peer support', 'listeners', 'online therapy', 'emotional support']
  }
]

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showFreeOnly, setShowFreeOnly] = useState(false)

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'crisis', label: 'Crisis Support' },
    { value: 'therapy', label: 'Therapy' },
    { value: 'support', label: 'Support Groups' },
    { value: 'education', label: 'Education' },
    { value: 'tools', label: 'Tools & Apps' },
    { value: 'community', label: 'Community' },
  ]

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'hotline', label: 'Hotlines' },
    { value: 'website', label: 'Websites' },
    { value: 'app', label: 'Apps' },
    { value: 'book', label: 'Books' },
    { value: 'directory', label: 'Directories' },
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesType = selectedType === 'all' || resource.type === selectedType
    const matchesFree = !showFreeOnly || resource.free
    
    return matchesSearch && matchesCategory && matchesType && matchesFree
  })

  const featuredResources = resources.filter(resource => resource.featured)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crisis': return <Phone className="w-5 h-5" />
      case 'therapy': return <Heart className="w-5 h-5" />
      case 'support': return <Users className="w-5 h-5" />
      case 'education': return <BookOpen className="w-5 h-5" />
      case 'tools': return <Star className="w-5 h-5" />
      default: return <BookOpen className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crisis': return 'bg-red-100 text-red-800'
      case 'therapy': return 'bg-blue-100 text-blue-800'
      case 'support': return 'bg-green-100 text-green-800'
      case 'education': return 'bg-purple-100 text-purple-800'
      case 'tools': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotline': return <Phone className="w-4 h-4" />
      case 'website': return <ExternalLink className="w-4 h-4" />
      case 'app': return <Star className="w-4 h-4" />
      case 'book': return <BookOpen className="w-4 h-4" />
      case 'directory': return <MapPin className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapeutic-calm to-therapeutic-soothing">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <BookOpen className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mental Health Resources</h1>
              <p className="text-gray-600">Curated tools, support, and information for your wellness journey</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Crisis Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-red-800 mb-4">🚨 Need Immediate Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Crisis Hotlines</h3>
              </div>
              <p className="text-red-700 text-sm mb-2">Call <strong>988</strong> - Suicide & Crisis Lifeline</p>
              <p className="text-red-700 text-sm">Text <strong>HOME</strong> to <strong>741741</strong> - Crisis Text Line</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Emergency</h3>
              </div>
              <p className="text-red-700 text-sm mb-2">Call <strong>911</strong> for immediate emergency</p>
              <Link href="/crisis" className="text-primary hover:underline text-sm">
                View all crisis resources →
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Free Only Toggle */}
            <label className="flex items-center gap-2 px-4 py-2">
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={(e) => setShowFreeOnly(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Free only</span>
            </label>
          </div>
        </motion.div>

        {/* Featured Resources */}
        {!searchTerm && selectedCategory === 'all' && selectedType === 'all' && !showFreeOnly && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Featured Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${getCategoryColor(resource.category)}`}>
                      {getCategoryIcon(resource.category)}
                    </div>
                    <div className="flex items-center gap-2">
                      {resource.free && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Free
                        </span>
                      )}
                      {resource.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{resource.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                  <p className="text-gray-600 mb-4">{resource.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {getTypeIcon(resource.type)}
                      <span className="capitalize">{resource.type}</span>
                    </div>

                    {resource.phone ? (
                      <a
                        href={`tel:${resource.phone}`}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Call Now
                      </a>
                    ) : resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit
                      </a>
                    ) : (
                      <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg">
                        More Info
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Resources */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {searchTerm || selectedCategory !== 'all' || selectedType !== 'all' || showFreeOnly 
                ? 'Search Results' 
                : 'All Resources'
              }
            </h2>
            <span className="text-gray-600">{filteredResources.length} resources found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${getCategoryColor(resource.category)}`}>
                    {getCategoryIcon(resource.category)}
                  </div>
                  <div className="flex items-center gap-2">
                    {resource.free && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Free
                      </span>
                    )}
                    {resource.featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {getTypeIcon(resource.type)}
                    <span className="capitalize">{resource.type}</span>
                  </div>
                  {resource.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium">{resource.rating}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{resource.tags.length - 3}
                    </span>
                  )}
                </div>

                {resource.phone ? (
                  <a
                    href={`tel:${resource.phone}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call {resource.phone}
                  </a>
                ) : resource.url ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Resource
                  </a>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg">
                    <BookOpen className="w-4 h-4" />
                    More Information
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedType('all')
                  setShowFreeOnly(false)
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-blue-800 mb-4">💡 Can't find what you're looking for?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h3 className="font-medium mb-1">Contact your healthcare provider</h3>
              <p>Your doctor or therapist can provide personalized resource recommendations.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Check with your insurance</h3>
              <p>Many insurance plans offer mental health resources and covered services.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Local community centers</h3>
              <p>Community organizations often provide support groups and wellness programs.</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Employee assistance programs</h3>
              <p>Many employers offer confidential counseling and mental health support.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}