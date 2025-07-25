'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Clock, Target, Zap } from 'lucide-react'

interface HeroSectionProps {
  onGetStarted: () => void
}

/**
 * Hero section component with landing page content
 * @param onGetStarted - Callback function to trigger navigation to app section
 */
export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="flex-1">
      <div className="h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl bg-background shadow-sm flex flex-col transition-transform duration-700 px-4 py-12">
        <div className="max-w-5xl text-center mx-auto">
          <div className="mb-8 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
            <Zap className="mr-2 h-4 w-4" />
            Smart DCA Strategy for Ethereum
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-4xl lg:text-6xl">
            Smart DCA Strategy for <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Ethereum
            </span>
          </h1>
          
          <p className="mb-8 max-w-2xl mx-auto text-muted-foreground text-sm leading-relaxed">
            Eliminate market timing stress with automated dollar-cost averaging. 
            Set your investment amount, choose your frequency, and let smart contracts 
            handle consistent ETH purchases for optimal long-term growth.
          </p>
          
          <div className="mb-16 flex justify-center">
            <Button 
              size="lg" 
              onClick={onGetStarted} 
              className="text-md px-2 py-2 h-auto font-regular"
            >
              Start Investing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors duration-200">
              <div className="mb-4 rounded-xl bg-blue-100 p-2 dark:bg-blue-900/30">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-md font-semibold">Reduce Volatility Risk</h3>
              <p className="text-sm text-muted-foreground text-center">
                Spread investments over time to minimize the impact of market fluctuations
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors duration-200">
              <div className="mb-4 rounded-xl bg-green-100 p-2 dark:bg-green-900/30">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 text-md font-semibold">Automated Investing</h3>
              <p className="text-sm text-muted-foreground text-center">
                Set it once and let smart contracts handle regular purchases automatically
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors duration-200">
              <div className="mb-4 rounded-xl bg-purple-100 p-2 dark:bg-purple-900/30">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 text-md font-semibold">No Timing Stress</h3>
              <p className="text-sm text-muted-foreground text-center">
                Remove the guesswork and emotion from investment timing decisions
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors duration-200">
              <div className="mb-4 rounded-xl bg-orange-100 p-2 dark:bg-orange-900/30">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mb-2 text-md font-semibold">Smart Execution</h3>
              <p className="text-sm text-muted-foreground text-center">
                Transparent smart contracts ensure secure and efficient transactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}