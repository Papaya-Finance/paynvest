'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'

/**
 * Enhanced useLocalStorage hook that binds data to wallet address
 * This prevents data leakage between different wallets
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  bindToWallet: boolean = true
): [T, (value: T | ((val: T) => T)) => void] {
  const { address } = useAccount();
  const initialValueRef = useRef(initialValue);
  
  // Обновляем ref при изменении initialValue
  initialValueRef.current = initialValue;
  
  // Create wallet-specific key if bindToWallet is true
  const storageKey = bindToWallet && address 
    ? `${key}_${address.toLowerCase()}` 
    : key;

  // Debug logging - только при первом создании ключа
  if (bindToWallet && address) {
    // Логируем только один раз при инициализации
    // console.log(`🔐 LocalStorage bound to wallet: ${key} -> ${storageKey}`);
  }

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    // Если привязка к кошельку включена, но адрес отсутствует, возвращаем начальное значение
    if (bindToWallet && !address) {
      return initialValueRef.current
    }
    
    try {
      const item = window.localStorage.getItem(storageKey)
      return item ? JSON.parse(item) : initialValueRef.current
    } catch (error) {
      console.warn(`Error reading localStorage key "${storageKey}":`, error)
      return initialValueRef.current
    }
  })

  // Update stored value when wallet address changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    
    // Если привязка к кошельку включена, но адрес отсутствует, сбрасываем к начальному значению
    if (bindToWallet && !address) {
      // console.log(`🔐 Wallet disconnected, resetting ${key} to initial value`);
      setStoredValue(initialValueRef.current)
      return
    }
    
    try {
      const newStorageKey = bindToWallet && address 
        ? `${key}_${address.toLowerCase()}` 
        : key;
        
      const item = window.localStorage.getItem(newStorageKey)
      const newValue = item ? JSON.parse(item) : initialValueRef.current
      // Логируем только при изменении адреса кошелька
      if (bindToWallet && address) {
        // console.log(`🔐 Wallet connected (${address.slice(0, 6)}...), loading ${key}: ${item ? 'found data' : 'no data, using initial value'}`);
      }
      setStoredValue(newValue)
    } catch (error) {
      console.warn(`Error reading localStorage key "${storageKey}":`, error)
      setStoredValue(initialValueRef.current)
    }
  }, [address, key, bindToWallet])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${storageKey}":`, error)
    }
  }

  return [storedValue, setValue]
}