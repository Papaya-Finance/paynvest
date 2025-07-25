'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react'

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl text-center">
        <div className="mb-8 inline-flex items-center rounded-full border px-3 py-1 text-sm">
          <TrendingUp className="mr-2 h-4 w-4" />
          DCA Strategy for Ethereum
        </div>
        
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Automate Your{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ethereum
          </span>{' '}
          Investments
        </h1>
        
        <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
          Set up dollar-cost averaging with USDT/USDC and let smart contracts handle your ETH purchases automatically.
        </p>
        
        <div className="mb-12 flex justify-center">
          <Button size="lg" onClick={onGetStarted} className="text-lg">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center">
            <Shield className="mb-4 h-12 w-12 text-blue-600" />
            <h3 className="mb-2 text-lg font-semibold">Secure</h3>
            <p className="text-sm text-muted-foreground">
              Smart contracts ensure your funds are safe and transactions are transparent
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="mb-4 h-12 w-12 text-green-600" />
            <h3 className="mb-2 text-lg font-semibold">Automated</h3>
            <p className="text-sm text-muted-foreground">
              Set it once and let the system handle regular ETH purchases for you
            </p>
          </div>
          <div className="flex flex-col items-center">
            <TrendingUp className="mb-4 h-12 w-12 text-purple-600" />
            <h3 className="mb-2 text-lg font-semibold">Strategic</h3>
            <p className="text-sm text-muted-foreground">
              Dollar-cost averaging reduces risk and smooths out market volatility
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}