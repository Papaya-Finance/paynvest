'use client'

import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DCAStrategy, Transaction } from '@/types'

export function useDCAStrategy() {
  const [strategies, setStrategies] = useLocalStorage<DCAStrategy[]>('dca-strategies', [])
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('dca-transactions', [])
  const [isLoading, setIsLoading] = useState(false)

  const createStrategy = useCallback(async (
    amount: number,
    token: 'USDT' | 'USDC',
    frequency: 'daily' | 'weekly' | 'monthly'
  ) => {
    setIsLoading(true)
    try {
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
      setStrategies(prev => [...prev, newStrategy])
      return newStrategy
    } catch (error) {
      console.error('Error creating strategy:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [setStrategies])

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
    setTransactions(prev => [...prev, newTransaction])
    
    updateStrategy(transaction.strategyId, {
      totalInvested: strategies.find(s => s.id === transaction.strategyId)?.totalInvested || 0 + transaction.amount,
      totalETHPurchased: strategies.find(s => s.id === transaction.strategyId)?.totalETHPurchased || 0 + transaction.ethAmount,
      lastExecuted: transaction.timestamp
    })
  }, [setTransactions, updateStrategy, strategies])

  return {
    strategies,
    transactions,
    isLoading,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    addTransaction
  }
}