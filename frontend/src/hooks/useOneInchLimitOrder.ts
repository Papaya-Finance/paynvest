'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAccount, useSignTypedData, useWriteContract, useWaitForTransactionReceipt, useWalletClient } from 'wagmi'
import { parseEther, parseUnits, Address as ViemAddress } from 'viem'
import { polygon } from 'wagmi/chains'
import { toast } from 'sonner'
import { useLocalStorage } from './useLocalStorage'
import { Contract, MaxUint256 } from "ethers";
import type { OneInchOrder, OneInchOrderParams, UseOneInchLimitOrderReturn, LimitOrderData, FeeExtension } from '@/types'
// Import 1inch SDK
import { 
  Sdk, 
  LimitOrderWithFee, 
  MakerTraits,
  FetchProviderConnector, 
  Address, 
  Bps,
  FeeTakerExt,
  getLimitOrderV4Domain
} from '@1inch/limit-order-sdk'

const erc20AbiFragment = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
]

// Contract addresses for Polygon
const CONTRACTS = {
  USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as ViemAddress, // USDC on Polygon
  WETH: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619' as ViemAddress, // WETH on Polygon
  LIMIT_ORDER_PROTOCOL: '0x1111111254EEB25477B68fb85Ed929f73A960582' as ViemAddress, // 1inch Limit Order Protocol on Polygon
} as const

/**
 * Hook for 1inch limit order functionality
 * Creates and manages limit orders on Polygon network
 * 
 * @returns UseOneInchLimitOrderReturn object with order management functions
 */
export function useOneInchLimitOrder(): UseOneInchLimitOrderReturn {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [isCreating, setIsCreating] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Store current order in localStorage
  const [currentOrder, setCurrentOrder] = useLocalStorage<OneInchOrder | null>('oneinch-current-order', null)
  const [currentOrderData, setCurrentOrderData] = useState<LimitOrderData | null>(null)

  // Wagmi hooks
  const { signTypedDataAsync } = useSignTypedData()
  const { writeContractAsync } = useWriteContract()

  /**
   * Initialize 1inch SDK with proper configuration
   * Uses our API routes as proxy to avoid CORS issues
   */
  const initializeSDK = useCallback(() => {
    // Create custom HTTP connector that proxies through our API routes
    const customHttpConnector = {
      get: async (url: string, headers?: any) => {
        console.log('Original URL from SDK:', url)
        
        // Handle both absolute and relative URLs
        let cleanPath: string
        
        if (url.startsWith('http')) {
          // Absolute URL - extract path
          const urlObj = new URL(url)
          cleanPath = urlObj.pathname + urlObj.search
        } else {
          // Relative URL - use as is
          cleanPath = url.startsWith('/') ? url : `/${url}`
        }
        
        // Remove any leading /api/1inch if present
        cleanPath = cleanPath.replace(/^\/api\/1inch/, '')
        
        // Ensure path starts with /
        if (!cleanPath.startsWith('/')) {
          cleanPath = `/${cleanPath}`
        }
        
        // If path contains orderbook, use orderbook route
        const proxyUrl = cleanPath.includes('orderbook') 
          ? `/api/1inch/orderbook${cleanPath.replace('/orderbook', '')}`
          : `/api/1inch${cleanPath}`
        console.log('Proxying GET request:', url, '→', proxyUrl)
        console.log('Headers:', headers)
        
        const response = await fetch(proxyUrl, { 
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      },
      post: async (url: string, data: any, headers?: any) => {
        console.log('Original POST URL from SDK:', url)
        
        // Handle both absolute and relative URLs
        let cleanPath: string
        
        if (url.startsWith('http')) {
          // Absolute URL - extract path
          const urlObj = new URL(url)
          cleanPath = urlObj.pathname
        } else {
          // Relative URL - use as is
          cleanPath = url.startsWith('/') ? url : `/${url}`
        }
        
        // Remove any leading /api/1inch if present
        cleanPath = cleanPath.replace(/^\/api\/1inch/, '')
        
        // Ensure path starts with /
        if (!cleanPath.startsWith('/')) {
          cleanPath = `/${cleanPath}`
        }
        
        // If path contains orderbook, use orderbook route
        const proxyUrl = cleanPath.includes('orderbook') 
          ? `/api/1inch/orderbook${cleanPath.replace('/orderbook', '')}`
          : `/api/1inch${cleanPath}`
        console.log('Proxying POST request:', url, '→', proxyUrl)
        console.log('Headers:', headers)
        console.log('Data:', data)
        
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify(data)
        })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      }
    }

    return new Sdk({
      authKey: process.env.NEXT_PUBLIC_1INCH_API_KEY || '',
      networkId: 137, // Polygon
      httpConnector: customHttpConnector
    })
  }, [])

  /**
   * Calculate taking amount with fees
   */
  const getTakingAmount = useCallback((taker: `0x${string}`, makingAmount?: bigint): bigint => {
    if (!currentOrderData) return BigInt(0)
    
    const amount = makingAmount || currentOrderData.makingAmount
    const takingAmount = (amount * currentOrderData.takingAmount) / currentOrderData.makingAmount
    
    if (currentOrder?.feeExtension) {
      const feeAmount = (takingAmount * BigInt(currentOrder.feeExtension.feePercent)) / BigInt(10000)
      return takingAmount + feeAmount
    }
    
    return takingAmount
  }, [currentOrderData, currentOrder])

  /**
   * Calculate making amount with fees
   */
  const getMakingAmount = useCallback((taker: `0x${string}`, takingAmount?: bigint): bigint => {
    if (!currentOrderData) return BigInt(0)
    
    const amount = takingAmount || currentOrderData.takingAmount
    const makingAmount = (amount * currentOrderData.makingAmount) / currentOrderData.takingAmount
    
    if (currentOrder?.feeExtension) {
      const feeAmount = (makingAmount * BigInt(currentOrder.feeExtension.feePercent)) / BigInt(10000)
      return makingAmount - feeAmount
    }
    
    return makingAmount
  }, [currentOrderData, currentOrder])

  /**
   * Calculate resolver fee
   */
  const getResolverFee = useCallback((taker: `0x${string}`, makingAmount?: bigint): bigint => {
    if (!currentOrderData || !currentOrder?.feeExtension || currentOrder.feeExtension.type !== 'resolver') {
      return BigInt(0)
    }
    
    const amount = makingAmount || currentOrderData.makingAmount
    const takingAmount = (amount * currentOrderData.takingAmount) / currentOrderData.makingAmount
    return (takingAmount * BigInt(currentOrder.feeExtension.feePercent)) / BigInt(10000)
  }, [currentOrderData, currentOrder])

  /**
   * Calculate integrator fee
   */
  const getIntegratorFee = useCallback((taker: `0x${string}`, makingAmount?: bigint): bigint => {
    if (!currentOrderData || !currentOrder?.feeExtension || currentOrder.feeExtension.type !== 'integrator') {
      return BigInt(0)
    }
    
    const amount = makingAmount || currentOrderData.makingAmount
    const takingAmount = (amount * currentOrderData.takingAmount) / currentOrderData.makingAmount
    return (takingAmount * BigInt(currentOrder.feeExtension.feePercent)) / BigInt(10000)
  }, [currentOrderData, currentOrder])

  /**
   * Calculate protocol fee (resolver fee + integrator share)
   */
  const getProtocolFee = useCallback((taker: `0x${string}`, makingAmount?: bigint): bigint => {
    return getResolverFee(taker, makingAmount) + getIntegratorFee(taker, makingAmount)
  }, [getResolverFee, getIntegratorFee])

  /**
   * Check USDC allowance for 1inch Limit Order Protocol
   */
  const checkUSDCAllowance = useCallback(async (amount: bigint): Promise<boolean> => {
    if (!address || !walletClient) return false

    try {
      const { ethers } = await import('ethers')
      const provider = new ethers.BrowserProvider(walletClient)
      const usdcContract = new ethers.Contract(
        CONTRACTS.USDC,
        [
          "function allowance(address owner, address spender) view returns (uint256)",
          "function approve(address spender, uint256 amount) returns (bool)"
        ],
        provider
      )
      
      const domain = getLimitOrderV4Domain(polygon.id);
      console.log('Domain!!!!:', domain)
      const limitOrderContractAddress = domain.verifyingContract;

      const allowance = await usdcContract.allowance(address, limitOrderContractAddress)
      const isApproved = allowance >= amount
      
      console.log('USDC allowance check:', {
        address,
        spender: CONTRACTS.LIMIT_ORDER_PROTOCOL,
        allowance: allowance.toString(),
        required: amount.toString(),
        isApproved
      })
      
      return isApproved
    } catch (error) {
      console.error('Failed to check USDC allowance:', error)
      return false
    }
  }, [address, walletClient])

  /**
   * Approve USDC for 1inch Limit Order Protocol
   */
  const approveUSDC = useCallback(async (amount: bigint) => {
    if (!address || !walletClient) {
      toast.error('Please connect your wallet first')
      throw new Error('Wallet not connected')
    }

    try {
      const { ethers } = await import('ethers')
      const provider = new ethers.BrowserProvider(walletClient)
      const signer = await provider.getSigner()
      
      const usdcContract = new ethers.Contract(
        CONTRACTS.USDC,
        [
          "function approve(address spender, uint256 amount) returns (bool)"
        ],
        signer
      )

      const domain = getLimitOrderV4Domain(polygon.id);
      console.log('Domain!!!!:', domain)
      const limitOrderContractAddress = domain.verifyingContract;

      const tx = await usdcContract.approve(limitOrderContractAddress, amount)
      toast.success('Approval transaction sent!')
      
      return tx
    } catch (error) {
      console.error('USDC approval failed:', error)
      toast.error('Approval failed. Please try again.')
      throw error
    }
  }, [address, walletClient])

  /**
   * Create a limit order with optional fee extension using 1inch SDK
   */
  const createOrder = useCallback(async (feeExtension?: FeeExtension) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      // Check if there's already an active order
      if (currentOrder && currentOrder.status === 'active') {
        toast.error('You already have an active order')
        return
      }

      // Order parameters: 1 USDC → 0.0002 WETH
      const orderParams: OneInchOrderParams = {
        sellAmount: '1', // 1 USDC
        buyAmount: '0.0002', // 0.0002 WETH
        expiry: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      }

      // Create order info using SDK Address class
      const orderInfo = {
        maker: new Address(address),
        receiver: new Address(feeExtension?.address || address),
        makerAsset: new Address(CONTRACTS.USDC),
        takerAsset: new Address(CONTRACTS.WETH),
        makingAmount: parseUnits(orderParams.sellAmount, 6), // USDC has 6 decimals
        takingAmount: parseEther(orderParams.buyAmount), // WETH has 18 decimals
      }

      // Store order data for fee calculations
      const orderData: LimitOrderData = {
        salt: BigInt(Math.floor(Math.random() * 1000000000)),
        maker: address,
        receiver: feeExtension?.address || address,
        makerAsset: CONTRACTS.USDC,
        takerAsset: CONTRACTS.WETH,
        makingAmount: orderInfo.makingAmount,
        takingAmount: orderInfo.takingAmount,
        extension: '0x',
        makerTraits: '0x',
      }
      setCurrentOrderData(orderData)

      // Check USDC allowance before creating order
      const isApproved = await checkUSDCAllowance(orderInfo.makingAmount)
      if (!isApproved) {
        toast.info('Approving USDC for 1inch Limit Order Protocol...')
        await approveUSDC(orderInfo.makingAmount)
        toast.success('USDC approved! Creating order...')
      }

      // Initialize 1inch SDK
      const sdk = initializeSDK()

      // Create order using SDK according to official example
      let order: LimitOrderWithFee

      if (feeExtension) {
        // Create order with fee extension
        const resolverFee = new FeeTakerExt.ResolverFee(
          new Address(feeExtension.feeReceiver),
          new Bps(BigInt(feeExtension.feePercent)),
          Bps.fromPercent(0) // No discount
        )

        const integratorFee = FeeTakerExt.IntegratorFee.ZERO
        const fees = new FeeTakerExt.Fees(resolverFee, integratorFee)

        const feeExt = FeeTakerExt.FeeTakerExtension.new(
          new Address(feeExtension.address),
          fees,
          feeExtension.whitelistedTakers?.map(taker => new Address(taker)) || [],
          {
            customReceiver: orderInfo.receiver
          }
        )

        const huy = MakerTraits.default()
        .withExpiration(BigInt(orderParams.expiry?.toString() || '0'))
        .allowMultipleFills()
        .allowPartialFills()
        
        order = new LimitOrderWithFee(orderInfo, huy, feeExt)
      } else {
        // Create basic order without fee extension
        const huy = MakerTraits.default()
        .withExpiration(BigInt(orderParams.expiry?.toString() || '0'))
        .allowMultipleFills()
        .allowPartialFills()
        order = await sdk.createOrder(orderInfo, huy)
      }

      console.log('Order!!!!!!!!!!!!:', order)

      // Get typed data for signing
      const typedData = order.getTypedData(polygon.id)

      // Sign the order
      console.log('EXPIRY:', orderParams.expiry)
      toast.info('Signing order...')
      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: 'Order',
        message: typedData.message,
      })

      // Get order hash
      const orderHash = order.getOrderHash(polygon.id)

      // Submit order to 1inch API
      toast.info('Submitting order to 1inch...')
      
      // //ALLOWANCE
      // const domain = getLimitOrderV4Domain(polygon.id);
      // console.log('Domain!!!!:', domain)
      // const limitOrderContractAddress = domain.verifyingContract;
      // const makerAssetContract = new Contract(CONTRACTS.USDC, erc20AbiFragment);
      // const currentAllowance = await makerAssetContract.allowance(
      //   address,
      //   limitOrderContractAddress,
      // );
      // if (currentAllowance < orderInfo.makingAmount) {
      //   // Approve just the necessary amount or the full MaxUint256 to avoid repeated approvals
      //   const approveTx = await makerAssetContract.approve(
      //     limitOrderContractAddress,
      //     orderInfo.makingAmount,
      //   );
      //   await approveTx.wait();
      // }
      

      // console.log('Limit order contract address:', limitOrderContractAddress)
      const result = await sdk.submitOrder(order, signature)
      console.log('Order submitted:', result)

      // Create order object for storage
      const newOrder: OneInchOrder = {
        id: orderHash,
        orderHash,
        maker: address,
        makerAsset: CONTRACTS.USDC,
        takerAsset: CONTRACTS.WETH,
        makerAmount: orderInfo.makingAmount.toString(),
        takerAmount: orderInfo.takingAmount.toString(),
        expiry: orderParams.expiry || Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        status: 'active',
        signature,
        createdAt: Date.now(),
        feeExtension,
      }

      setCurrentOrder(newOrder)
      toast.success('Limit order created successfully!')

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create order'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Order creation error:', err)
    } finally {
      setIsCreating(false)
    }
  }, [address, isConnected, currentOrder, signTypedDataAsync, setCurrentOrder, checkUSDCAllowance, approveUSDC, initializeSDK])

  /**
   * Cancel an existing order
   */
  const cancelOrder = useCallback(async (orderHash: string) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsCancelling(true)
    setError(null)

    try {
      // Find the order to cancel
      if (!currentOrder || currentOrder.orderHash !== orderHash) {
        toast.error('Order not found')
        return
      }

      // Initialize 1inch SDK
      const sdk = initializeSDK()

      // For now, we'll just update the local state
      // In a real implementation, you'd call the SDK to cancel the order

      // Update local state
      const updatedOrder = { ...currentOrder, status: 'cancelled' as const }
      setCurrentOrder(updatedOrder)
      
      toast.success('Order cancelled successfully!')

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel order'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Order cancellation error:', err)
    } finally {
      setIsCancelling(false)
    }
  }, [address, isConnected, currentOrder, setCurrentOrder, initializeSDK])

  /**
   * Check if order is expired
   */
  const isOrderExpired = useCallback((order: OneInchOrder) => {
    return Date.now() / 1000 > order.expiry
  }, [])

  /**
   * Update order status based on expiry
   */
  useEffect(() => {
    if (currentOrder && currentOrder.status === 'active' && isOrderExpired(currentOrder)) {
      const updatedOrder = { ...currentOrder, status: 'expired' as const }
      setCurrentOrder(updatedOrder)
      toast.info('Your order has expired')
    }
  }, [currentOrder, isOrderExpired, setCurrentOrder])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    createOrder,
    cancelOrder,
    checkUSDCAllowance,
    approveUSDC,
    currentOrder,
    isCreating,
    isCancelling,
    error,
    getTakingAmount,
    getMakingAmount,
    getResolverFee,
    getIntegratorFee,
    getProtocolFee,
  }
} 