"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook for getting current ETH price
 * Uses CoinGecko API for price data
 */
export function useEthPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current ETH price from CoinGecko API
   */
  const fetchEthPrice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch ETH price");
      }
      
      const data = await response.json();
      const ethPrice = data.ethereum?.usd;
      
      if (ethPrice) {
        // console.log("ETH Price (FIXED):", ethPrice);
        setPrice(ethPrice);
      } else {
        throw new Error("Invalid price data");
      }
    } catch (err) {
      console.error("Failed to fetch ETH price:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch price");
    } finally {
      setIsLoading(false);
    }
  }, []); // Пустой массив зависимостей - функция создается только один раз

  // Fetch price on mount
  useEffect(() => {
    // console.log("useEthPrice: fetchEthPrice effect triggered");
    fetchEthPrice();
  }, []); // Пустой массив - эффект срабатывает только один раз

  // Auto-refresh price every 30 seconds
  useEffect(() => {
    // console.log("Creating interval for ETH PRICE");
    const interval = setInterval(fetchEthPrice, 30000);
    return () => {
      // console.log("Clearing interval for ETH PRICE");
      clearInterval(interval);
    };
  }, []); // Пустой массив - интервал создается только один раз

  return {
    price,
    isLoading,
    error,
    refetch: fetchEthPrice,
  };
} 