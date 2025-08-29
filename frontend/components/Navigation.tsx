'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Heart, 
  MessageCircle, 
  BarChart3, 
  Brain, 
  BookOpen, 
  User, 
  LogOut, 
  Home,
  AlertTriangle,
  HelpCircle,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const Navigation = () => {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Mood Tracker', href: '/mood', icon: BarChart3 },
    { name: 'Exercises', href: '/exercises', icon: Brain },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Crisis Help', href: '/crisis', icon: AlertTriangle },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ]

  const isActive = (href: string) => pathname === href

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">Healer</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </div>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Welcome, {user?.username || 'User'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className={`p-2 rounded-lg transition-colors ${
                  isActive('/profile')
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <User className="w-5 h-5" />
              </Link>
              
              <button
                onClick={logout}
                className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4 space-y-2"
          >
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
            
            <hr className="my-4" />
            
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/profile')
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-600 hover:text-primary hover:bg-primary/5'
              }`}
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
            
            <button
              onClick={() => {
                logout()
                setIsMobileMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
            
            <div className="px-4 py-2 text-xs text-gray-500">
              Welcome, {user?.username || 'User'}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navigation