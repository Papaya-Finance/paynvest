"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { usePeriodPapaya } from "./usePeriodPapaya";
import { usePaynvest } from "./usePaynvest";

/**
 * Combined hook for all dashboard data
 * Optimizes blockchain requests by combining multiple hooks into one
 */
export function useDashboardData() {
  const { address } = useAccount();
  const { calculateTotalInvested } = usePeriodPapaya();
  const { getBalance } = usePaynvest();
  
  // State for all dashboard data
  const [totalInvested, setTotalInvested] = useState<bigint>(BigInt(0));
  const [ethBalance, setEthBalance] = useState<bigint>(BigInt(0));
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all dashboard data in one function
   */
  const fetchDashboardData = useCallback(async () => {
    if (!address) {
      setTotalInvested(BigInt(0));
      setEthBalance(BigInt(0));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Temporarily disabled blockchain requests to stop errors
      // const paynvestAddress = process.env.NEXT_PUBLIC_PAYNVEST_CONTRACT_ADDRESS as `0x${string}`;
      
      // Fetch all data in parallel
      // const [totalInvestedResult, ethBalanceResult, ethPriceResult] = await Promise.all([
      //   // Total invested calculation
      //   calculateTotalInvested(address, paynvestAddress).catch(() => ({ totalInvested: BigInt(0) })),
      //   // ETH balance
      //   getBalance(address).catch(() => BigInt(0)),
      //   // ETH price from API
      //   fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      //     .then(res => res.json())
      //     .then(data => data.ethereum?.usd)
      //     .catch(() => null)
      // ]);

      // setTotalInvested(totalInvestedResult.totalInvested);
      // setEthBalance(ethBalanceResult);
      // setEthPrice(ethPriceResult);
      
      // Temporary fallback values
      setTotalInvested(BigInt(0));
      setEthBalance(BigInt(0));
      setEthPrice(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [address, calculateTotalInvested, getBalance]);

  // Fetch data on mount and when address changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes (much less frequent)
  // TODO: Temporarily disabled auto-refresh to stop frequent requests
  // useEffect(() => {
  //   const interval = setInterval(fetchDashboardData, 300000); // 5 minutes
  //   return () => clearInterval(interval);
  // }, [fetchDashboardData]);

  // Calculate portfolio value
  const portfolioValue = useMemo(() => {
    if (!ethBalance || !ethPrice) return 0;
    const ethAmount = Number(ethBalance) / 1e18;
    return ethAmount * ethPrice;
  }, [ethBalance, ethPrice]);

  return {
    totalInvested,
    ethBalance,
    ethPrice,
    portfolioValue,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
} 