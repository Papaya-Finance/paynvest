'use client'

import { useAccount, useBalance } from 'wagmi'
import { useMemo } from 'react'

// Token addresses for different networks
const TOKENS = {
  // Ethereum mainnet
  ethereum: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  },
  // Polygon
  polygon: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
} as const

export interface WalletBalance {
  eth: {
    value: bigint
    formatted: string
    symbol: string
    decimals: number
  } | null
  usdt: {
    value: bigint
    formatted: string
    symbol: string
    decimals: number
  } | null
  usdc: {
    value: bigint
    formatted: string
    symbol: string
    decimals: number
  } | null
  papaya: {
    value: bigint
    formatted: string
    symbol: string
    decimals: number
  } | null
  isLoading: boolean
  isConnected: boolean
  address: string | undefined
}

/**
 * Hook to get wallet balances for ETH, USDT, USDC, and Papaya
 * Supports both Ethereum mainnet and Polygon
 * 
 * @returns WalletBalance object with all token balances
 */
export function useWalletBalance(): WalletBalance {
  const { address, isConnected, chain } = useAccount()

  // Determine current network
  const isPolygon = chain?.id === 137
  const currentTokens = isPolygon ? TOKENS.polygon : TOKENS.ethereum

  // ETH/MATIC balance (native token)
  const { data: ethBalance, isLoading: isEthLoading } = useBalance({
    address,
  })

  // USDT balance
  const { data: usdtBalance, isLoading: isUsdtLoading } = useBalance({
    address,
    token: currentTokens.USDT as `0x${string}`,
  })

  // USDC balance
  const { data: usdcBalance, isLoading: isUsdcLoading } = useBalance({
    address,
    token: currentTokens.USDC as `0x${string}`,
  })

  // Papaya balance
  const { data: papayaBalance, isLoading: isPapayaLoading } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_PERIOD_PAPAYA_CONTRACT_ADDRESS as `0x${string}`,
  })

  const isLoading = isEthLoading || isUsdtLoading || isUsdcLoading || isPapayaLoading

  const balance = useMemo(() => ({
    eth: ethBalance || null,
    usdt: usdtBalance || null,
    usdc: usdcBalance || null,
    papaya: papayaBalance || null,
    isLoading,
    isConnected,
    address,
  }), [ethBalance, usdtBalance, usdcBalance, papayaBalance, isLoading, isConnected, address])

  return balance
}

/**
 * Hook to get specific token balance
 * 
 * @param token - 'eth' | 'usdt' | 'usdc' | 'papaya'
 * @returns Balance data for specific token
 */
export function useTokenBalance(token: 'eth' | 'usdt' | 'usdc' | 'papaya') {
  const { address, isConnected, chain } = useAccount()

  // Determine current network
  const isPolygon = chain?.id === 137
  const currentTokens = isPolygon ? TOKENS.polygon : TOKENS.ethereum

  const { data: balance, isLoading } = useBalance({
    address,
    token: token === 'eth' ? undefined : currentTokens[token.toUpperCase() as keyof typeof currentTokens] as `0x${string}`,
  })

  return {
    balance: balance || null,
    isLoading,
    isConnected,
    address,
  }
}

/**
 * Hook to get formatted balance string
 * 
 * @param token - 'eth' | 'usdt' | 'usdc' | 'papaya'
 * @param decimals - Number of decimal places to show
 * @returns Formatted balance string
 */
export function useFormattedBalance(token: 'eth' | 'usdt' | 'usdc' | 'papaya', decimals: number = 4) {
  const { balance, isLoading, isConnected } = useTokenBalance(token)

  const formattedBalance = useMemo(() => {
    if (!balance || !isConnected) return '0'
    
    const value = Number(balance.value) / Math.pow(10, balance.decimals)
    return value.toFixed(decimals)
  }, [balance, isConnected, decimals])

  return {
    formattedBalance,
    isLoading,
    isConnected,
  }
} 