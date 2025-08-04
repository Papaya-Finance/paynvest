'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WalletButton } from '@/components/WalletButton'
import { useOneInchLimitOrder } from '@/hooks/useOneInchLimitOrder'
import { useAccount } from 'wagmi'
import { Loader2, X, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { parseUnits } from 'viem'

/**
 * Orders page component for 1inch limit order functionality
 * Displays order creation, current order status, and cancellation
 */
export default function OrdersPage() {
  const { isConnected } = useAccount()
  const { 
    createOrder, 
    cancelOrder, 
    checkUSDCAllowance,
    approveUSDC,
    currentOrder, 
    isCreating, 
    isCancelling, 
    error 
  } = useOneInchLimitOrder()

  /**
   * Get status badge for order
   */
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        variant: 'default' as const, 
        icon: Clock, 
        text: 'Active',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      },
      pending: { 
        variant: 'secondary' as const, 
        icon: Clock, 
        text: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      },
      filled: { 
        variant: 'default' as const, 
        icon: CheckCircle, 
        text: 'Filled',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      },
      cancelled: { 
        variant: 'destructive' as const, 
        icon: X, 
        text: 'Cancelled',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      },
      expired: { 
        variant: 'destructive' as const, 
        icon: AlertCircle, 
        text: 'Expired',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={cn("flex items-center gap-1", config.className)}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  /**
   * Format order amount for display
   */
  const formatAmount = (amount: string, decimals: number) => {
    const value = parseFloat(amount) / Math.pow(10, decimals)
    return value.toFixed(6)
  }

  /**
   * Handle order creation
   */
  const handleCreateOrder = async () => {
    try {
      await createOrder()
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }

  /**
   * Handle order cancellation
   */
  const handleCancelOrder = async (orderHash: string) => {
    try {
      await cancelOrder(orderHash)
    } catch (error) {
      console.error('Failed to cancel order:', error)
    }
  }

  /**
   * Handle allowance check
   */
  const handleCheckAllowance = async () => {
    try {
      const amount = parseUnits('1', 6) // 1 USDC
      const isApproved = await checkUSDCAllowance(amount)
      if (isApproved) {
        toast.success('USDC is already approved for 1inch Limit Order Protocol')
      } else {
        toast.info('USDC needs approval. Click "Approve USDC" to continue.')
      }
    } catch (error) {
      console.error('Failed to check allowance:', error)
      toast.error('Failed to check allowance')
    }
  }

  /**
   * Handle USDC approval
   */
  const handleApproveUSDC = async () => {
    try {
      const amount = parseUnits('1', 6) // 1 USDC
      await approveUSDC(amount)
    } catch (error) {
      console.error('Failed to approve USDC:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">1inch Limit Orders</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage limit orders on Polygon network
          </p>
        </div>
        <WalletButton />
      </div>

      {/* Order Description Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>
            Create a limit order to exchange USDC for WETH
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1</div>
                <div className="text-sm text-muted-foreground">USDC</div>
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0.0002</div>
                <div className="text-sm text-muted-foreground">WETH</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Rate</div>
              <div className="font-semibold">5,000 USDC/WETH</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Order Button */}
      {!currentOrder || currentOrder.status !== 'active' ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Button 
                onClick={handleCreateOrder}
                disabled={!isConnected || isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  'Create Limit Order'
                )}
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCheckAllowance}
                  disabled={!isConnected}
                  variant="outline"
                  className="flex-1"
                >
                  Check USDC Allowance
                </Button>
                <Button 
                  onClick={handleApproveUSDC}
                  disabled={!isConnected}
                  variant="outline"
                  className="flex-1"
                >
                  Approve USDC
                </Button>
              </div>
              
              {!isConnected && (
                <p className="text-sm text-muted-foreground text-center">
                  Please connect your wallet to create an order
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Current Order Display */}
      {currentOrder && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Order
              {getStatusBadge(currentOrder.status)}
            </CardTitle>
            <CardDescription>
              Order created on {new Date(currentOrder.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Selling</div>
                  <div className="text-lg font-semibold">
                    {formatAmount(currentOrder.makerAmount, 6)} USDC
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Buying</div>
                  <div className="text-lg font-semibold">
                    {formatAmount(currentOrder.takerAmount, 18)} WETH
                  </div>
                </div>
              </div>

              {/* Order Hash */}
              <div>
                <div className="text-sm font-medium text-muted-foreground">Order Hash</div>
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  {currentOrder.orderHash}
                </div>
              </div>

              {/* Expiry */}
              <div>
                <div className="text-sm font-medium text-muted-foreground">Expires</div>
                <div className="text-sm">
                  {new Date(currentOrder.expiry * 1000).toLocaleString()}
                </div>
              </div>

              {/* Cancel Button */}
              {currentOrder.status === 'active' && (
                <Button
                  onClick={() => handleCancelOrder(currentOrder.orderHash)}
                  disabled={isCancelling}
                  variant="destructive"
                  className="w-full"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancel Order
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="mt-6 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 