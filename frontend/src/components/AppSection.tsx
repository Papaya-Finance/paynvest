'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, DollarSign, Zap, BarChart3, TrendingUp, Coins, Activity, Loader2, HandCoins, CircleDollarSign } from 'lucide-react'
import InvestmentInput from './InvestmentInput'
import { TransactionHistory } from './TransactionHistory'
import { useDCAStrategy } from '@/hooks/useDCAStrategy'
import { useAppKitAccount } from '@reown/appkit/react'
import { useWalletBalance } from '@/hooks/useWalletBalance'

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
    claimETH,
    activeStrategy // добавлено
  } = useDCAStrategy()
  
  
  const { eth, usdt, usdc} = useWalletBalance()
  
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
    return `${amount.toFixed(6)}`
  }

  return (
    <section className="flex-1">
      <div className="h-[calc(100vh-4rem)] overflow-y-auto bg-background shadow-sm flex flex-col transition-transform duration-700 px-4 py-8">
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
            <p className="text-muted-foreground text-md">
              Create and manage your dollar-cost averaging strategies for Ethereum
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Investment Input */}
              <Card className="border border-muted shadow-lg gap-2">
                <CardHeader>
                  <CardTitle>
                    Investment Amount
                  </CardTitle>
                </CardHeader>
                <CardContent className="mt-1">
                  {!portfolioMetrics.hasActiveStrategy ? (
                    <>
                      <InvestmentInput
                        value={amount}
                        onChange={setAmount}
                        placeholder="$0"
                        fontSize={36}
                        fontWeight={600}
                        className='!bg-background'
                        classNameContainer='bg-background'
                      />
                      <div className="flex items-center mb-2">
                        <span className="text-xs text-muted-foreground">
                          Balance: {usdt?.formatted} USDT
                        </span>
                      </div>
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
                              {activeStrategy ? (
                                <>
                                  Strategy: <span className="font-semibold">{activeStrategy.amount} {activeStrategy.token}</span> every <span className="font-semibold">{activeStrategy.frequency}</span>
                                </>
                              ) : (
                                'Your DCA strategy is running automatically'
                              )}
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

              {/* Metrics Cards */}
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                <Card className="border border-muted bg-muted shadow-none">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Total Invested</p>
                        <p className="text-xl font-bold">{formatCurrency(portfolioMetrics.totalInvested)}</p>
                      </div>
                      {/* <CircleDollarSign className="h-8 w-8 text-primary" /> */}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-purple-500 bg-purple-100 dark:bg-purple-900/30 shadow-none">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-primary/80">ETH Balance</p>
                        <p className="text-xl font-bold">{formatETH(portfolioMetrics.totalETH)}</p>
                      </div>
                      {/* <HandCoins className="h-4 w-4 text-primary" /> */}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-muted bg-muted shadow-none">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Current ETH Price</p>
                        <p className="text-xl font-bold flex items-center">
                          {isPriceLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {formatCurrency(ethPrice)}
                        </p>
                      </div>
                      {/* <TrendingUp className="h-4 w-4 text-primary" /> */}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-muted bg-muted shadow-none">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Portfolio Value</p>
                        <p className="text-xl font-bold">{formatCurrency(portfolioMetrics.currentValue)}</p>
                      </div>
                      {/* <BarChart3 className="h-4 w-4 text-primary" /> */}
                    </div>
                  </CardContent>
                </Card>
              </div>
          

              {/* Transaction History */}
              <TransactionHistory transactions={transactions} />
            </div>
            
            <div className="space-y-6">
              {/* <Card>
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
              </Card> */}

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
      </div>
    </section>
  )
}