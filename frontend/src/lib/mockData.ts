import { Transaction } from '@/types'

/**
 * Mock ETH price feed for testing
 * @returns Promise<number> Current ETH price in USD
 */
export const fetchMockETHPrice = async (): Promise<number> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Generate a realistic ETH price with small fluctuations
  const basePrice = 3200
  const fluctuation = (Math.random() - 0.5) * 200
  return Math.round((basePrice + fluctuation) * 100) / 100
}

/**
 * Generate mock transaction data for testing
 * @param count Number of transactions to generate
 * @returns Array<Transaction> Mock transaction data
 */
export const generateMockTransactions = (count: number = 10): Transaction[] => {
  const transactions: Transaction[] = []
  const now = new Date()
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
    const amount = Math.floor(Math.random() * 50) + 5 // $5-$55
    const ethPrice = Math.floor(Math.random() * 1000) + 2500 // $2500-$3500
    const ethAmount = amount / ethPrice
    
    transactions.push({
      id: `tx_mock_${Date.now()}_${i}`,
      strategyId: 'strategy_mock',
      amount,
      token: Math.random() > 0.5 ? 'USDT' : 'USDC',
      ethAmount: Math.round(ethAmount * 1000000) / 1000000, // 6 decimal places
      ethPrice,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp,
      status: 'confirmed'
    })
  }
  
  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * Simulate Web3 operations with realistic delays
 * @param operation Operation name for logging
 * @param delay Delay in milliseconds
 * @returns Promise<void>
 */
export const simulateWeb3Operation = async (
  operation: string, 
  delay: number = 2000
): Promise<void> => {
  console.log(`Starting ${operation}...`)
  await new Promise(resolve => setTimeout(resolve, delay))
  console.log(`${operation} completed`)
}

/**
 * Mock smart contract interaction for DCA strategy
 * @param amount Investment amount
 * @param token Token type (USDT/USDC)
 * @returns Promise<string> Transaction hash
 */
export const mockCreateDCAStrategy = async (
  amount: number,
  token: 'USDT' | 'USDC'
): Promise<string> => {
  await simulateWeb3Operation('Creating DCA Strategy', 3000)
  
  // Simulate occasional failures (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Transaction failed: Insufficient gas fee')
  }
  
  return `0x${Math.random().toString(16).substr(2, 64)}`
}

/**
 * Mock ETH claim operation
 * @param amount ETH amount to claim
 * @returns Promise<string> Transaction hash
 */
export const mockClaimETH = async (amount: number): Promise<string> => {
  await simulateWeb3Operation('Claiming ETH', 2500)
  
  // Simulate occasional failures (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Claim failed: Contract error')
  }
  
  return `0x${Math.random().toString(16).substr(2, 64)}`
}

/**
 * Mock strategy stop operation
 * @returns Promise<string> Transaction hash
 */
export const mockStopStrategy = async (): Promise<string> => {
  await simulateWeb3Operation('Stopping Strategy', 1500)
  return `0x${Math.random().toString(16).substr(2, 64)}`
}