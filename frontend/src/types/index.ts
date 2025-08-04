export interface DCAStrategy {
  id: string
  amount: number
  token: 'USDT' | 'USDC'
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

export interface DecodedRates {
  incomeAmount: bigint;
  outgoingAmount: bigint;
  projectId: number;
  timestamp: number;
}

export interface TotalInvestedCalculation {
  totalInvested: bigint;
  periodsPassed: number;
  incomeRate: bigint;
  streamStarted: number;
}

// Transaction hash type
export type TransactionHash = `0x${string}`;

export interface UsePeriodPapayaReturn {
  deposit: (amount: bigint, isPermit2?: boolean) => Promise<TransactionHash>;
  withdraw: (amount: bigint) => Promise<TransactionHash>;
  subscribe: (author: `0x${string}`, subscriptionAmount: bigint, projectId: number) => Promise<TransactionHash>;
  getSubscriptionData: (userAddress: `0x${string}`, paynvestAddress: `0x${string}`) => Promise<SubscriptionData>;
  calculateTotalInvested: (userAddress: `0x${string}`, paynvestAddress: `0x${string}`) => Promise<TotalInvestedCalculation>;
  decodeRates: (encodedRates: bigint) => DecodedRates;
  getRefillDays: () => Promise<number>;
  checkApproval: (amount: bigint) => Promise<boolean>;
  approveUSDC: (amount?: bigint) => Promise<TransactionHash>;
  isLoading: boolean;
}

// Paynvest types
export interface UsePaynvestReturn {
  getBalance: (userAddress: `0x${string}`) => Promise<bigint>;
  withdraw: (amount: bigint) => Promise<TransactionHash>;
  claim: () => Promise<TransactionHash>;
  isLoading: boolean;
}

// ETH Price types
export interface UseEthPriceReturn {
  price: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Total Invested types
export interface UseTotalInvestedReturn {
  totalInvested: bigint;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ETH Balance types
export interface UseEthBalanceReturn {
  balance: bigint;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 1inch Limit Order types with FeeTakerExtension pattern
export interface FeeExtension {
  address: `0x${string}`
  type: 'resolver' | 'integrator'
  feePercent: number // in basis points (1% = 100)
  feeReceiver: `0x${string}`
  whitelistedTakers?: `0x${string}`[]
}

export interface LimitOrderData {
  salt: bigint
  maker: `0x${string}`
  receiver: `0x${string}`
  makerAsset: `0x${string}`
  takerAsset: `0x${string}`
  makingAmount: bigint
  takingAmount: bigint
  extension: `0x${string}`
  makerTraits: `0x${string}`
}

export interface OneInchOrder {
  id: string
  orderHash: string
  maker: `0x${string}`
  makerAsset: `0x${string}`
  takerAsset: `0x${string}`
  makerAmount: string
  takerAmount: string
  expiry: number
  status: 'pending' | 'active' | 'filled' | 'cancelled' | 'expired'
  signature?: string
  createdAt: number
  txHash?: string
  feeExtension?: FeeExtension
}

export interface OneInchOrderParams {
  sellAmount: string // Amount of USDC to sell
  buyAmount: string  // Minimum amount of WETH to buy
  expiry?: number    // Expiry time (default 7 days)
  feeExtension?: FeeExtension
}

export interface UseOneInchLimitOrderReturn {
  createOrder: (feeExtension?: FeeExtension) => Promise<void>
  cancelOrder: (orderHash: string) => Promise<void>
  checkUSDCAllowance: (amount: bigint) => Promise<boolean>
  approveUSDC: (amount: bigint) => Promise<any>
  currentOrder: OneInchOrder | null
  isCreating: boolean
  isCancelling: boolean
  error: string | null
  // Fee calculation methods
  getTakingAmount: (taker: `0x${string}`, makingAmount?: bigint) => bigint
  getMakingAmount: (taker: `0x${string}`, takingAmount?: bigint) => bigint
  getResolverFee: (taker: `0x${string}`, makingAmount?: bigint) => bigint
  getIntegratorFee: (taker: `0x${string}`, makingAmount?: bigint) => bigint
  getProtocolFee: (taker: `0x${string}`, makingAmount?: bigint) => bigint
}