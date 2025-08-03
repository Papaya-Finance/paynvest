// hooks/useLimitOrder.ts
import { useState, useCallback } from 'react'
import { useAccount, useSignTypedData, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, parseUnits, Address } from 'viem'
import { polygon } from 'wagmi/chains'

// Константы контрактов на Polygon
const CONTRACTS = {
  USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as Address,
  WETH: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619' as Address,
  LIMIT_ORDER_PROTOCOL: '0x...' as Address, // Адрес 1inch Limit Order Protocol на Polygon
} as const

// Типы для лимитного ордера
interface LimitOrderParams {
  sellAmount: string // Количество USDC для продажи
  buyAmount: string  // Минимальное количество WETH для покупки
  expiry?: number    // Время истечения (по умолчанию 7 дней)
}

interface LimitOrder {
  id: string
  maker: Address
  makerAsset: Address
  takerAsset: Address
  makerAmount: string
  takerAmount: string
  expiry: number
  status: 'pending' | 'active' | 'filled' | 'cancelled' | 'expired'
  signature?: string
  createdAt: number
  txHash?: string
}

// EIP-712 типы для подписи ордера
const LIMIT_ORDER_TYPES = {
  LimitOrder: [
    { name: 'salt', type: 'uint256' },
    { name: 'maker', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'makerAsset', type: 'address' },
    { name: 'takerAsset', type: 'address' },
    { name: 'makerAmount', type: 'uint256' },
    { name: 'takerAmount', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
  ],
}

export const useLimitOrder = () => {
  const { address } = useAccount()
  const [orders, setOrders] = useState<LimitOrder[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Хук для подписи типизированных данных
  const { signTypedDataAsync } = useSignTypedData()
  
  // Хук для записи в контракт
  const { writeContractAsync } = useWriteContract()

  // Функция для создания лимитного ордера
  const createLimitOrder = useCallback(async (params: LimitOrderParams) => {
    if (!address) {
      throw new Error('Кошелек не подключен')
    }

    setIsCreating(true)
    setError(null)

    try {
      // 1. Подготавливаем данные ордера
      const expiry = params.expiry || Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 дней
      const salt = Math.floor(Math.random() * 1000000000) // Случайная соль
      
      const orderData = {
        salt: BigInt(salt),
        maker: address,
        receiver: address, // Адрес получателя (обычно тот же, что и maker)
        makerAsset: CONTRACTS.USDC,
        takerAsset: CONTRACTS.WETH,
        makerAmount: parseUnits(params.sellAmount, 6), // USDC имеет 6 decimals
        takerAmount: parseEther(params.buyAmount), // WETH имеет 18 decimals
        expiry: BigInt(expiry),
      }

      // 2. Создаем объект для подписи EIP-712
      const domain = {
        name: '1inch Limit Order Protocol',
        version: '3',
        chainId: polygon.id,
        verifyingContract: CONTRACTS.LIMIT_ORDER_PROTOCOL,
      }

      // 3. Подписываем ордер
      console.log('Подписание ордера...')
      const signature = await signTypedDataAsync({
        domain,
        types: LIMIT_ORDER_TYPES,
        primaryType: 'LimitOrder',
        message: orderData,
      })

      // 4. Создаем объект ордера
      const order: LimitOrder = {
        id: `${salt}_${Date.now()}`,
        maker: address,
        makerAsset: CONTRACTS.USDC,
        takerAsset: CONTRACTS.WETH,
        makerAmount: orderData.makerAmount.toString(),
        takerAmount: orderData.takerAmount.toString(),
        expiry,
        status: 'active',
        signature,
        createdAt: Date.now(),
      }

      // 5. Сохраняем ордер локально (в реальном проекте отправляли бы в 1inch API)
      setOrders(prev => [...prev, order])

      console.log('Лимитный ордер создан:', order)
      return order

    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при создании ордера'
      setError(errorMessage)
      console.error('Ошибка создания ордера:', err)
      throw new Error(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }, [address, signTypedDataAsync])

  // Функция для отмены ордера
  const cancelOrder = useCallback(async (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) {
      throw new Error('Ордер не найден')
    }

    try {
      // В реальном проекте здесь был бы вызов смарт-контракта для отмены
      // const tx = await writeContractAsync({
      //   address: CONTRACTS.LIMIT_ORDER_PROTOCOL,
      //   abi: limitOrderABI,
      //   functionName: 'cancelOrder',
      //   args: [orderData],
      // })

      // Обновляем статус ордера
      setOrders(prev => 
        prev.map(o => 
          o.id === orderId 
            ? { ...o, status: 'cancelled' as const }
            : o
        )
      )

      console.log(`Ордер ${orderId} отменен`)
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при отмене ордера'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [orders])

  // Функция для получения цены ордера
  const getOrderPrice = useCallback((order: LimitOrder) => {
    const makerAmount = parseFloat(order.makerAmount) / 1e6 // USDC 6 decimals
    const takerAmount = parseFloat(order.takerAmount) / 1e18 // WETH 18 decimals
    return makerAmount / takerAmount // Цена в USDC за 1 WETH
  }, [])

  // Функция для проверки истечения ордера
  const isOrderExpired = useCallback((order: LimitOrder) => {
    return Date.now() / 1000 > order.expiry
  }, [])

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Состояние
    orders,
    isCreating,
    error,
    
    // Функции
    createLimitOrder,
    cancelOrder,
    getOrderPrice,
    isOrderExpired,
    clearError,
    
    // Константы
    CONTRACTS,
  }
}