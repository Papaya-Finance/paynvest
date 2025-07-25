'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Clock, Zap } from 'lucide-react'

interface InvestmentInputProps {
  onSubmit?: (amount: number, token: 'USDT' | 'USDC', frequency: 'daily' | 'weekly' | 'monthly') => void
}

export function InvestmentInput({ onSubmit }: InvestmentInputProps) {
  const [amount, setAmount] = useState(10)
  const [selectedToken, setSelectedToken] = useState<'USDT' | 'USDC'>('USDT')
  const [selectedFrequency, setSelectedFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  const handleSubmit = () => {
    onSubmit?.(amount, selectedToken, selectedFrequency)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Investment Setup
        </CardTitle>
        <CardDescription>
          Configure your dollar-cost averaging strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Amount</label>
          <div className="flex items-center space-x-2">
            <Button
              variant={amount === 5 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAmount(5)}
            >
              $5
            </Button>
            <Button
              variant={amount === 10 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAmount(10)}
            >
              $10
            </Button>
            <Button
              variant={amount === 25 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAmount(25)}
            >
              $25
            </Button>
            <Button
              variant={amount === 50 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAmount(50)}
            >
              $50
            </Button>
          </div>
          <div className="mt-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Custom amount"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Token</label>
          <div className="flex space-x-2">
            <Button
              variant={selectedToken === 'USDT' ? 'default' : 'outline'}
              onClick={() => setSelectedToken('USDT')}
            >
              USDT
            </Button>
            <Button
              variant={selectedToken === 'USDC' ? 'default' : 'outline'}
              onClick={() => setSelectedToken('USDC')}
            >
              USDC
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Frequency</label>
          <div className="flex space-x-2">
            <Button
              variant={selectedFrequency === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFrequency('daily')}
            >
              <Clock className="mr-1 h-3 w-3" />
              Daily
            </Button>
            <Button
              variant={selectedFrequency === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFrequency('weekly')}
            >
              <Clock className="mr-1 h-3 w-3" />
              Weekly
            </Button>
            <Button
              variant={selectedFrequency === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFrequency('monthly')}
            >
              <Clock className="mr-1 h-3 w-3" />
              Monthly
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Summary</span>
            <Badge variant="secondary">
              <Zap className="mr-1 h-3 w-3" />
              DCA Strategy
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Invest ${amount} {selectedToken} {selectedFrequency} to purchase ETH automatically
          </p>
        </div>

        <Button onClick={handleSubmit} className="w-full" size="lg">
          Create Strategy
        </Button>
      </CardContent>
    </Card>
  )
}