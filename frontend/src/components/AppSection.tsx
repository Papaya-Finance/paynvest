'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, DollarSign, Zap, BarChart3 } from 'lucide-react'

interface AppSectionProps {
  onBack: () => void
}

export function AppSection({ onBack }: AppSectionProps) {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <div className="mb-8">
          <h2 className="mb-4 text-3xl font-bold">DCA Dashboard</h2>
          <p className="text-muted-foreground">
            Create and manage your dollar-cost averaging strategies for Ethereum
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Strategy</CardTitle>
                <CardDescription>
                  Set up automated ETH purchases with your preferred amount and frequency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <DollarSign className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Investment input component will be integrated here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invested</p>
                    <p className="text-2xl font-bold">$0.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ETH Purchased</p>
                    <p className="text-2xl font-bold">0.00 ETH</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Strategies</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    View Strategies
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Transaction History
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}