'use client'

import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { HeroSection } from '@/components/HeroSection'
import { AppSection } from '@/components/AppSection'

/**
 * Main page component with smooth GSAP animations between sections
 * Handles section transitions with slide and fade effects
 */
export default function Home() {
  const [currentSection, setCurrentSection] = useState<'hero' | 'app'>('hero')
  const heroRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<HTMLDivElement>(null)
  const isAnimating = useRef(false)

  /**
   * Animate to app section with GSAP
   */
  const handleGetStarted = () => {
    if (isAnimating.current) return
    
    isAnimating.current = true
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentSection('app')
        isAnimating.current = false
      }
    })

    // Animate hero section out (slide left + fade)
    tl.to(heroRef.current, {
      x: '-100%',
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut'
    })
    
    // Set app section initial position (right side)
    tl.set(appRef.current, {
      x: '100%',
      opacity: 0,
      visibility: 'visible'
    })
    
    // Animate app section in (slide from right + fade)
    tl.to(appRef.current, {
      x: '0%',
      opacity: 1,
      duration: 0.6,
      ease: 'power2.inOut'
    }, '-=0.3')
  }

  /**
   * Animate back to hero section with GSAP
   */
  const handleBackToHome = () => {
    if (isAnimating.current) return
    
    isAnimating.current = true
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentSection('hero')
        isAnimating.current = false
      }
    })

    // Animate app section out (slide right + fade)
    tl.to(appRef.current, {
      x: '100%',
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut'
    })
    
    // Set hero section initial position (left side)
    tl.set(heroRef.current, {
      x: '-100%',
      opacity: 0,
      visibility: 'visible'
    })
    
    // Animate hero section in (slide from left + fade)
    tl.to(heroRef.current, {
      x: '0%',
      opacity: 1,
      duration: 0.6,
      ease: 'power2.inOut'
    }, '-=0.3')
  }

  // Initialize sections on mount
  useEffect(() => {
    if (heroRef.current && appRef.current) {
      gsap.set(heroRef.current, { x: '0%', opacity: 1 })
      gsap.set(appRef.current, { x: '100%', opacity: 0, visibility: 'hidden' })
    }
  }, [])

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="absolute inset-0 w-full"
        style={{ 
          visibility: currentSection === 'hero' ? 'visible' : 'hidden'
        }}
      >
        <HeroSection onGetStarted={handleGetStarted} />
      </div>
      
      {/* App Section */}
      <div
        ref={appRef}
        className="absolute inset-0 w-full"
        style={{ 
          visibility: currentSection === 'app' ? 'visible' : 'hidden'
        }}
      >
        <AppSection onBack={handleBackToHome} />
      </div>
    </div>
  )
}
