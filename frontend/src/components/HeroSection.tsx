'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, Shield, Clock, Target, Zap } from 'lucide-react'

interface HeroSectionProps {
  onGetStarted: () => void
}

/**
 * Hero section component with landing page content
 * @param onGetStarted - Callback function to trigger navigation to app section
 */
export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="max-w-5xl text-center">
        <div className="mb-8 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          <TrendingUp className="mr-2 h-4 w-4" />
          Smart DCA Strategy for Ethereum
        </div>
        
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Smart DCA Strategy for{' '}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Ethereum
          </span>
        </h1>
        
        <p className="mb-8 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl lg:text-2xl leading-relaxed">
          Eliminate market timing stress with automated dollar-cost averaging. 
          Set your investment amount, choose your frequency, and let smart contracts 
          handle consistent ETH purchases for optimal long-term growth.
        </p>
        
        <div className="mb-16 flex justify-center">
          <Button 
            size="lg" 
            onClick={onGetStarted} 
            className="text-lg px-8 py-4 h-auto font-semibold rounded-xl hover:scale-105 transition-transform duration-200"
          >
            Start Investing
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors duration-200">
            <div className="mb-4 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Reduce Volatility Risk</h3>
            <p className="text-sm text-muted-foreground text-center">
              Spread investments over time to minimize the impact of market fluctuations
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors duration-200">
            <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Automated Investing</h3>
            <p className="text-sm text-muted-foreground text-center">
              Set it once and let smart contracts handle regular purchases automatically
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors duration-200">
            <div className="mb-4 rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
              <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Timing Stress</h3>
            <p className="text-sm text-muted-foreground text-center">
              Remove the guesswork and emotion from investment timing decisions
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors duration-200">
            <div className="mb-4 rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
              <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Smart Execution</h3>
            <p className="text-sm text-muted-foreground text-center">
              Transparent smart contracts ensure secure and efficient transactions
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}