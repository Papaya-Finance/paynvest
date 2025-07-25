'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DCAStrategy, Transaction } from '@/types'
import { fetchMockETHPrice, mockCreateDCAStrategy, mockClaimETH, mockStopStrategy, generateMockTransactions } from '@/lib/mockData'
import { toast } from 'sonner'

export function useDCAStrategy() {
  const [strategies, setStrategies] = useLocalStorage<DCAStrategy[]>('dca-strategies', [])
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('dca-transactions', [])
  const [ethPrice, setEthPrice] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isPriceLoading, setPriceLoading] = useState(false)

  // Initialize with mock data if empty
  useEffect(() => {
    if (transactions.length === 0) {
      const mockTransactions = generateMockTransactions(5)
      setTransactions(mockTransactions)
    }
  }, [transactions.length, setTransactions])

  // Fetch ETH price on mount and periodically
  useEffect(() => {
    const fetchPrice = async () => {
      setPriceLoading(true)
      try {
        const price = await fetchMockETHPrice()
        setEthPrice(price)
      } catch (error) {
        console.error('Failed to fetch ETH price:', error)
        toast.error('Failed to fetch ETH price')
      } finally {
        setPriceLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const totalInvested = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalETH = transactions.reduce((sum, tx) => sum + tx.ethAmount, 0)
    const activeStrategy = strategies.find(s => s.isActive)
    
    return {
      totalInvested,
      totalETH,
      currentValue: totalETH * ethPrice,
      hasActiveStrategy: !!activeStrategy,
      strategyStatus: activeStrategy?.isActive ? 'Active' : 'Inactive'
    }
  }, [transactions, strategies, ethPrice])

  // Выделяем активную стратегию для возврата наружу
  const activeStrategy = useMemo(() => strategies.find(s => s.isActive) || null, [strategies])

  /**
   * Create a new DCA strategy
   */
  const createStrategy = useCallback(async (
    amount: number,
    token: 'USDT' | 'USDC',
    frequency: 'daily' | 'weekly' | 'monthly'
  ) => {
    setIsLoading(true)
    try {
      const txHash = await mockCreateDCAStrategy(amount, token)
      
      const newStrategy: DCAStrategy = {
        id: `strategy_${Date.now()}`,
        amount,
        token,
        frequency,
        isActive: true,
        createdAt: new Date(),
        totalInvested: 0,
        totalETHPurchased: 0
      }
      
      setStrategies(prev => [...prev.map(s => ({ ...s, isActive: false })), newStrategy])
      toast.success(`DCA strategy created successfully! TX: ${txHash.slice(0, 10)}...`)
      return newStrategy
    } catch (error) {
      console.error('Error creating strategy:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create strategy')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [setStrategies])

  /**
   * Stop the active DCA strategy
   */
  const stopStrategy = useCallback(async () => {
    const activeStrategy = strategies.find(s => s.isActive)
    if (!activeStrategy) return

    setIsLoading(true)
    try {
      const txHash = await mockStopStrategy()
      
      updateStrategy(activeStrategy.id, { isActive: false })
      toast.success(`Strategy stopped successfully! TX: ${txHash.slice(0, 10)}...`)
    } catch (error) {
      console.error('Error stopping strategy:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to stop strategy')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [strategies])

  /**
   * Claim accumulated ETH
   */
  const claimETH = useCallback(async () => {
    if (portfolioMetrics.totalETH === 0) {
      toast.error('No ETH available to claim')
      return
    }

    setIsLoading(true)
    try {
      const txHash = await mockClaimETH(portfolioMetrics.totalETH)
      
      // In a real app, you'd update the balance after successful claim
      toast.success(`ETH claimed successfully! TX: ${txHash.slice(0, 10)}...`)
    } catch (error) {
      console.error('Error claiming ETH:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to claim ETH')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [portfolioMetrics.totalETH])

  const updateStrategy = useCallback((id: string, updates: Partial<DCAStrategy>) => {
    setStrategies(prev => 
      prev.map(strategy => 
        strategy.id === id ? { ...strategy, ...updates } : strategy
      )
    )
  }, [setStrategies])

  const deleteStrategy = useCallback((id: string) => {
    setStrategies(prev => prev.filter(strategy => strategy.id !== id))
    setTransactions(prev => prev.filter(tx => tx.strategyId !== id))
  }, [setStrategies, setTransactions])

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}`
    }
    setTransactions(prev => [newTransaction, ...prev])
    
    // Update strategy totals
    const strategy = strategies.find(s => s.id === transaction.strategyId)
    if (strategy) {
      updateStrategy(transaction.strategyId, {
        totalInvested: strategy.totalInvested + transaction.amount,
        totalETHPurchased: strategy.totalETHPurchased + transaction.ethAmount,
        lastExecuted: transaction.timestamp
      })
    }
  }, [setTransactions, strategies, updateStrategy])

  return {
    strategies,
    transactions,
    ethPrice,
    portfolioMetrics,
    isLoading,
    isPriceLoading,
    createStrategy,
    stopStrategy,
    claimETH,
    updateStrategy,
    deleteStrategy,
    addTransaction,
    activeStrategy
  }
}