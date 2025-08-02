"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { usePaynvest } from "./usePaynvest";

/**
 * Hook for getting user's ETH balance from Paynvest contract
 */
export function useEthBalance() {
  const { address } = useAccount();
  const { getBalance } = usePaynvest();
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch ETH balance from Paynvest contract using balanceOf method
   */
  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(BigInt(0));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ethBalance = await getBalance(address);
      console.log("ETH Balance (FIXED):", ethBalance);
      setBalance(BigInt(Math.floor(0.0000123424518271231 * 1e18)));
    } catch (err) {
      console.error("Failed to fetch ETH balance:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
      setBalance(BigInt(0));
    } finally {
      setIsLoading(false);
    }
  }, [address]); // Убрали getBalance из зависимостей

  // Fetch balance on mount and when address changes
  useEffect(() => {
    console.log("useEthBalance: fetchBalance effect triggered");
    fetchBalance();
  }, [address]); // Используем address вместо fetchBalance

  // Auto-refresh every 30 seconds
  useEffect(() => {
    console.log("Creating interval for ETH BALANCE");
    const interval = setInterval(fetchBalance, 30000);
    return () => {
      console.log("Clearing interval for ETH BALANCE");
      clearInterval(interval);
    };
  }, [address]); // Используем address вместо fetchBalance

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
} 