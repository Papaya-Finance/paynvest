'use client'

import { useAccount, useBalance } from 'wagmi'
import { useMemo } from 'react'

// Token addresses on Ethereum mainnet
const TOKENS = {
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  PAPAYA: process.env.NEXT_PUBLIC_PERIOD_PAPAYA_CONTRACT_ADDRESS as `0x${string}`,
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
 * Can be used anywhere in the application
 * 
 * @returns WalletBalance object with all token balances
 */
export function useWalletBalance(): WalletBalance {
  const { address, isConnected } = useAccount()

  // ETH balance (native token)
  const { data: ethBalance, isLoading: isEthLoading } = useBalance({
    address,
  })

  // USDT balance
  const { data: usdtBalance, isLoading: isUsdtLoading } = useBalance({
    address,
    token: TOKENS.USDT as `0x${string}`,
  })

  // USDC balance
  const { data: usdcBalance, isLoading: isUsdcLoading } = useBalance({
    address,
    token: TOKENS.USDC as `0x${string}`,
  })

  // Papaya balance
  const { data: papayaBalance, isLoading: isPapayaLoading } = useBalance({
    address,
    token: TOKENS.PAPAYA as `0x${string}`,
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
  const { address, isConnected } = useAccount()

  const { data: balance, isLoading } = useBalance({
    address,
    token: token === 'eth' ? undefined : TOKENS[token.toUpperCase() as keyof typeof TOKENS] as `0x${string}`,
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