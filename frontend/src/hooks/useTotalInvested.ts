"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { usePeriodPapaya } from "./usePeriodPapaya";

/**
 * Hook for calculating Total Invested amount
 * Uses the formula from the instructions: totalStreamed = periodsPassed * incomeRate
 */
export function useTotalInvested() {
  const { address } = useAccount();
  const { calculateTotalInvested } = usePeriodPapaya();
  const [totalInvested, setTotalInvested] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // REFILL_DAYS constant from contract (should be fetched from contract)
  const REFILL_DAYS = 30; // Default value, should be fetched from contract

  /**
   * Calculate total invested amount
   */
  const calculateTotal = useCallback(async () => {
    if (!address) {
      setTotalInvested(BigInt(0));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const paynvestAddress = process.env.NEXT_PUBLIC_PAYNVEST_CONTRACT_ADDRESS as `0x${string}`;
      
      const result = await calculateTotalInvested(
        address,
        paynvestAddress,
        REFILL_DAYS
      );

      setTotalInvested(result.totalInvested);
    } catch (err) {
      console.error("Failed to calculate total invested:", err);
      setError(err instanceof Error ? err.message : "Failed to calculate");
      setTotalInvested(BigInt(0));
    } finally {
      setIsLoading(false);
    }
  }, [address, calculateTotalInvested]);

  // Calculate on mount and when address changes
  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(calculateTotal, 60000);
    return () => clearInterval(interval);
  }, [calculateTotal]);

  return {
    totalInvested,
    isLoading,
    error,
    refetch: calculateTotal,
  };
} 