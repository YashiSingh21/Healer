'use client'

import { motion } from 'framer-motion'
import { Heart, Brain, Users, Shield, Zap, Globe, Award, Target } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Powered Support',
      description: 'Advanced AI technology provides personalized mental health support and crisis intervention.'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Evidence-Based Care',
      description: 'Our therapeutic approaches are grounded in proven clinical practices and research.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Privacy First',
      description: 'Your data is encrypted and secure. We never share personal information without consent.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: '24/7 Availability',
      description: 'Support is available around the clock, whenever you need someone to talk to.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Crisis Detection',
      description: 'Advanced algorithms detect crisis situations and provide immediate intervention resources.'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Accessible Design',
      description: 'Inclusive design ensures our platform works for everyone, regardless of ability.'
    }
  ]

  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Chief Clinical Officer',
      bio: 'Licensed clinical psychologist with 15+ years in digital mental health innovation.',
      image: '👩‍⚕️'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Lead AI Engineer',
      bio: 'PhD in Machine Learning, specializing in natural language processing for healthcare.',
      image: '👨‍💻'
    },
    {
      name: 'Dr. Amira Patel',
      role: 'Head of Research',
      bio: 'Researcher in computational psychology and mental health technology ethics.',
      image: '👩‍🔬'
    },
    {
      name: 'Jordan Kim',
      role: 'UX Director',
      bio: 'Accessibility advocate focused on inclusive design for mental health platforms.',
      image: '👨‍🎨'
    }
  ]

  const stats = [
    { label: 'Users Supported', value: '50K+', icon: <Users className="w-6 h-6" /> },
    { label: 'Sessions Completed', value: '1M+', icon: <Heart className="w-6 h-6" /> },
    { label: 'Crisis Interventions', value: '2.5K+', icon: <Shield className="w-6 h-6" /> },
    { label: 'Countries Served', value: '25+', icon: <Globe className="w-6 h-6" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapeutic-calm to-therapeutic-soothing">
      {/* Hero Section */}
      <section className="bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Heart className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About Healer
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              We're on a mission to make mental health support accessible, personalized, and available 
              to everyone who needs it. Our AI-powered platform combines cutting-edge technology with 
              compassionate care to provide 24/7 mental wellness support.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/chat"
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Start Your Journey
              </Link>
              <Link
                href="/resources"
                className="px-8 py-3 bg-white text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Mental health challenges affect millions of people worldwide, yet access to quality care 
                    remains limited by geography, cost, and stigma. We believe everyone deserves compassionate, 
                    professional mental health support when they need it most.
                  </p>
                  <p>
                    Healer bridges this gap by combining artificial intelligence with evidence-based therapeutic 
                    approaches to provide immediate, personalized support. Our platform is designed to complement, 
                    not replace, traditional therapy while being there for you 24/7.
                  </p>
                  <p>
                    We're committed to creating a safe, inclusive space where people can explore their mental 
                    wellness journey without judgment, while ensuring crisis situations are handled with immediate 
                    professional intervention.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-6 text-center"
                  >
                    <div className="flex justify-center mb-2 text-primary">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines the latest in AI technology with compassionate care principles 
              to deliver personalized mental health support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
              >
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our diverse team of clinicians, researchers, and technologists work together to create 
              the most effective and compassionate mental health platform possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6 text-center"
              >
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These principles guide everything we do at Healer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Compassion First</h3>
                    <p className="text-gray-600">Every interaction is guided by empathy and understanding.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy & Safety</h3>
                    <p className="text-gray-600">Your personal information and wellbeing are our top priorities.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Clinical Excellence</h3>
                    <p className="text-gray-600">All our approaches are based on evidence and best practices.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Accessibility</h3>
                    <p className="text-gray-600">Mental health support should be available to everyone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Continuous Improvement</h3>
                    <p className="text-gray-600">We're always learning and evolving to serve you better.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Impact</h3>
                    <p className="text-gray-600">Working to make mental wellness accessible worldwide.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Begin Your Journey?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of people who have found support, healing, and growth with Healer. 
              Your mental wellness journey starts with a single conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Get Started Free
              </Link>
              <Link
                href="/resources"
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Explore Resources
              </Link>
              <Link
                href="/help"
                className="px-8 py-3 bg-white text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Get in Touch</h2>
              <p className="text-blue-700 mb-6">
                Have questions about our platform or need support? We're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@healer.com"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Email Support
                </a>
                <Link
                  href="/help"
                  className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Visit Help Center
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}