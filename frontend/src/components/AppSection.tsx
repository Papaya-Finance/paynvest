'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, DollarSign, Zap, BarChart3, TrendingUp, Coins, Activity, Loader2 } from 'lucide-react'
import InvestmentInput from './InvestmentInput'
import { TransactionHistory } from './TransactionHistory'
import { useDCAStrategy } from '@/hooks/useDCAStrategy'
import { useAppKitAccount } from '@reown/appkit/react'

interface AppSectionProps {
  onBack: () => void
}

/**
 * Main application section with DCA dashboard
 * @param onBack - Callback function to navigate back to hero section
 */
export function AppSection({ onBack }: AppSectionProps) {
  const { isConnected } = useAppKitAccount()
  const { 
    portfolioMetrics, 
    transactions, 
    ethPrice, 
    isLoading, 
    isPriceLoading,
    createStrategy,
    stopStrategy,
    claimETH
  } = useDCAStrategy()
  
  const [showTransactions, setShowTransactions] = useState(false)
  const [amount, setAmount] = useState('');

  const handleCreateStrategy = async (
    amount: number, 
    token: 'USDT' | 'USDC', 
    frequency: 'daily' | 'weekly' | 'monthly'
  ) => {
    if (!isConnected) {
      return
    }
    
    try {
      await createStrategy(amount, token, frequency)
    } catch (error) {
      console.error('Failed to create strategy:', error)
    }
  }

  const handleStopStrategy = async () => {
    try {
      await stopStrategy()
    } catch (error) {
      console.error('Failed to stop strategy:', error)
    }
  }

  const handleClaimETH = async () => {
    try {
      await claimETH()
    } catch (error) {
      console.error('Failed to claim ETH:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatETH = (amount: number) => {
    return `${amount.toFixed(6)} ETH`
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="hover:bg-muted/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Activity className="mr-1 h-3 w-3" />
              {portfolioMetrics.strategyStatus}
            </Badge>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="mb-4 text-3xl font-bold">DCA Dashboard</h2>
          <p className="text-muted-foreground text-lg">
            Create and manage your dollar-cost averaging strategies for Ethereum
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold">{formatCurrency(portfolioMetrics.totalInvested)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ETH Balance</p>
                  <p className="text-2xl font-bold">{formatETH(portfolioMetrics.totalETH)}</p>
                </div>
                <Coins className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current ETH Price</p>
                  <p className="text-2xl font-bold flex items-center">
                    {isPriceLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : null}
                    {formatCurrency(ethPrice)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(portfolioMetrics.currentValue)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Investment Input */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {portfolioMetrics.hasActiveStrategy ? 'Active Strategy' : 'Create New Strategy'}
                </CardTitle>
                <CardDescription>
                  {portfolioMetrics.hasActiveStrategy 
                    ? 'Manage your active DCA strategy' 
                    : 'Set up automated ETH purchases with your preferred amount and frequency'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!portfolioMetrics.hasActiveStrategy ? (
                  <>
                    <InvestmentInput
                      value={amount}
                      onChange={setAmount}
                      placeholder="Enter amount"
                      currency="USD"
                      maxDecimals={4}
                      fontSize={36}
                      fontWeight={700}
                      classNameNumber="text-primary"
                    />
                    <Button
                      onClick={() => {
                        const num = parseFloat(amount.replace(',', '.'));
                        if (!isNaN(num)) {
                          handleCreateStrategy(num, 'USDT', 'weekly');
                        }
                      }}
                      disabled={!amount || isNaN(parseFloat(amount))}
                    >
                      Create Strategy
                    </Button>
                    {!isConnected && (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Please connect your wallet to create a DCA strategy
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">Strategy Active</h4>
                          <p className="text-sm text-muted-foreground">
                            Your DCA strategy is running automatically
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="destructive" 
                        onClick={handleStopStrategy}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Stopping...
                          </>
                        ) : (
                          'Stop Strategy'
                        )}
                      </Button>
                      
                      <Button 
                        onClick={handleClaimETH}
                        disabled={isLoading || portfolioMetrics.totalETH === 0}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          'Claim ETH'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transaction History */}
            {showTransactions && <TransactionHistory transactions={transactions} />}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowTransactions(!showTransactions)}
                  >
                    {showTransactions ? 'Hide' : 'View'} Transaction History
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    Strategy Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Summary</CardTitle>
                <CardDescription>
                  Overview of your DCA performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Transactions</span>
                    <span className="font-semibold">{transactions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average ETH Price</span>
                    <span className="font-semibold">
                      {portfolioMetrics.totalInvested > 0 
                        ? formatCurrency(portfolioMetrics.totalInvested / Math.max(portfolioMetrics.totalETH, 0.000001))
                        : '$0.00'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">P&L</span>
                    <span className={`font-semibold ${
                      portfolioMetrics.currentValue > portfolioMetrics.totalInvested 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(portfolioMetrics.currentValue - portfolioMetrics.totalInvested)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}