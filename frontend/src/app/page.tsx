'use client'

import { useState } from 'react'
import { HeroSection } from '@/components/HeroSection'
import { AppSection } from '@/components/AppSection'

export default function Home() {
  const [currentSection, setCurrentSection] = useState<'hero' | 'app'>('hero')

  const handleGetStarted = () => {
    setCurrentSection('app')
  }

  const handleBackToHome = () => {
    setCurrentSection('hero')
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className={`transform transition-transform duration-500 ease-in-out ${
          currentSection === 'hero' ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          opacity: currentSection === 'hero' ? 1 : 0,
          visibility: currentSection === 'hero' ? 'visible' : 'hidden'
        }}
      >
        <HeroSection onGetStarted={handleGetStarted} />
      </div>
      
      <div
        className={`absolute inset-0 transform transition-transform duration-500 ease-in-out ${
          currentSection === 'app' ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          opacity: currentSection === 'app' ? 1 : 0,
          visibility: currentSection === 'app' ? 'visible' : 'hidden'
        }}
      >
        <AppSection onBack={handleBackToHome} />
      </div>
    </div>
  )
}
