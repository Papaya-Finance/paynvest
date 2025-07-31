"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useBalance } from "wagmi";

/**
 * Hook for getting Papaya balance with automatic updates
 * Uses polling to keep balance up to date
 */
export function usePapayaBalance() {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get balance using useBalance
  const { data: balanceData, isLoading: balanceLoading, refetch } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_PERIOD_PAPAYA_CONTRACT_ADDRESS as `0x${string}`,
  });

  // Update balance when balanceData changes
  useEffect(() => {
    if (balanceData) {
      setBalance(balanceData.value);
    }
  }, [balanceData]);

  /**
   * Manually refetch balance
   */
  const fetchBalance = useCallback(async () => {
    if (!address || !isConnected) {
      setBalance(BigInt(0));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await refetch();
    } catch (err) {
      console.error("Failed to fetch Papaya balance:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, refetch]);

  // Auto-refresh every 10 seconds when connected
  useEffect(() => {
    if (!isConnected || !address) return;

    // Set up polling
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [fetchBalance, isConnected, address]);

  // Format balance for display
  const formatBalance = useCallback((balance: bigint) => {
    const value = Number(balance) / 1e18; // Assuming 18 decimals
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, []);

  return {
    balance,
    formattedBalance: formatBalance(balance),
    isLoading: isLoading || balanceLoading,
    error,
    refetch: fetchBalance,
  };
} 