'use client'

import Navigation from './Navigation'
import ProtectedRoute from './ProtectedRoute'

interface PageLayoutProps {
  children: React.ReactNode
  requireAuth?: boolean
}

const PageLayout = ({ children, requireAuth = true }: PageLayoutProps) => {
  if (requireAuth) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-therapeutic-calm to-therapeutic-soothing">
          <Navigation />
          <main>{children}</main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapeutic-calm to-therapeutic-soothing">
      {children}
    </div>
  )
}

export default PageLayout