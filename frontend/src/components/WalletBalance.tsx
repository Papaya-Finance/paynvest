'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, Loader2, Coins } from 'lucide-react'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import type { WalletBalance as WalletBalanceType } from '@/hooks/useWalletBalance'

interface WalletBalanceProps {
  showTitle?: boolean
  className?: string
  showAllTokens?: boolean
}

/**
 * Wallet balance component
 * Displays user's wallet balances for ETH, USDT, and USDC
 * 
 * @param showTitle - Whether to show the card title
 * @param className - Additional CSS classes
 * @param showAllTokens - Whether to show all tokens or just ETH
 */
export function WalletBalance({ 
  showTitle = true, 
  className = '',
  showAllTokens = false 
}: WalletBalanceProps) {
  const { eth, usdt, usdc, isLoading, isConnected, address } = useWalletBalance()

  if (!isConnected) {
    return null
  }

  const formatBalance = (balance: WalletBalanceType['eth'] | WalletBalanceType['usdt'] | WalletBalanceType['usdc'], decimals: number = 4) => {
    if (!balance) return '0'
    const value = parseFloat(balance.formatted)
    return value.toFixed(decimals)
  }

  return (
    <Card className={`border border-muted shadow-sm ${className}`}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Loading balances...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* ETH Balance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-muted-foreground">ETH</span>
              </div>
              <div className="text-right">
                <div className="font-bold">
                  {formatBalance(eth, 4)} ETH
                </div>
                {eth && (
                  <div className="text-xs text-muted-foreground">
                    ≈ ${(parseFloat(eth.formatted) * 2000).toFixed(2)} {/* Approximate USD value */}
                  </div>
                )}
              </div>
            </div>

            {/* Show USDT and USDC if requested */}
            {showAllTokens && (
              <>
                {/* USDT Balance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-muted-foreground">USDT</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatBalance(usdt, 2)} USDT
                    </div>
                    {usdt && (
                      <div className="text-xs text-muted-foreground">
                        ≈ ${formatBalance(usdt, 2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* USDC Balance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-muted-foreground">USDC</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatBalance(usdc, 2)} USDC
                    </div>
                    {usdc && (
                      <div className="text-xs text-muted-foreground">
                        ≈ ${formatBalance(usdc, 2)}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Address */}
            <div className="pt-2 border-t border-muted">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Address</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Simple wallet balance component for inline use
 * Shows only ETH balance in a compact format
 */
export function SimpleWalletBalance() {
  const { eth, isLoading, isConnected } = useWalletBalance()

  if (!isConnected) return null

  return (
    <div className="flex items-center gap-2 text-sm">
      <Coins className="h-4 w-4 text-orange-500" />
      <span className="font-medium">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          `${eth ? parseFloat(eth.formatted).toFixed(4) : '0'} ETH`
        )}
      </span>
    </div>
  )
} 