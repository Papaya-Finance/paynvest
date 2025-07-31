export interface DCAStrategy {
  id: string
  amount: number
  token: 'USDT' | 'USDC'
  frequency: 'daily' | 'weekly' | 'monthly'
  isActive: boolean
  createdAt: Date
  lastExecuted?: Date
  totalInvested: number
  totalETHPurchased: number
}

export interface Transaction {
  id: string
  strategyId: string
  amount: number
  token: 'USDT' | 'USDC'
  ethAmount: number
  ethPrice: number
  txHash: string
  timestamp: Date
  status: 'pending' | 'confirmed' | 'failed'
}

export interface WalletState {
  address?: string
  isConnected: boolean
  balance?: {
    eth: number
    usdt: number
    usdc: number
  }
}

export type { WalletBalance } from '@/hooks/useWalletBalance'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppSection {
  id: 'hero' | 'app'
  title: string
}

// PeriodPapaya types
export interface SubscriptionData {
  isActive: boolean;
  encodedRates: bigint;
}

export interface TotalInvestedCalculation {
  totalInvested: bigint;
  periodsPassed: number;
  incomeRate: bigint;
  streamStarted: number;
}

export interface UsePeriodPapayaReturn {
  deposit: (amount: bigint, isPermit2?: boolean) => Promise<any>;
  withdraw: (amount: bigint) => Promise<any>;
  getSubscriptionData: (userAddress: `0x${string}`, paynvestAddress: `0x${string}`) => Promise<SubscriptionData>;
  calculateTotalInvested: (userAddress: `0x${string}`, paynvestAddress: `0x${string}`, refillDays: number) => Promise<TotalInvestedCalculation>;
  checkApproval: (amount: bigint) => Promise<boolean>;
  approveUSDC: (amount?: bigint) => Promise<any>;
  isLoading: boolean;
}