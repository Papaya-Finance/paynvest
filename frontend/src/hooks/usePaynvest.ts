"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useBalance } from "wagmi";
import { toast } from "sonner";
import PaynvestABI from "@/lib/abi/Paynvest.json";
import type { UsePaynvestReturn } from "@/types";

/**
 * Hook for interacting with Paynvest contract
 * Provides methods for balance checking and withdrawals
 */
export function usePaynvest(): UsePaynvestReturn {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync } = useWriteContract();

  // Contract configuration
  const contractConfig = {
    address: process.env.NEXT_PUBLIC_PAYNVEST_CONTRACT_ADDRESS as `0x${string}`,
    abi: PaynvestABI.abi,
  };

  // Use useBalance hook at the top level
  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address,
    token: contractConfig.address,
  });

  /**
   * Get user's ETH balance from Paynvest contract
   * @param userAddress - User's wallet address
   */
  const getBalance = useCallback(
    async (userAddress: `0x${string}`) => {
      try {
        // Return the balance from the hook
        return balanceData?.value || BigInt(0);
      } catch (error) {
        console.error("Failed to get balance:", error);
        throw error;
      }
    },
    [balanceData]
  );

  /**
   * Withdraw funds from Paynvest contract
   * @param amount - Amount to withdraw in wei
   */
  const withdraw = useCallback(
    async (amount: bigint) => {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      try {
        const hash = await writeContractAsync({
          ...contractConfig,
          functionName: "withdraw",
          args: [amount],
        });

        toast.success("Withdraw transaction sent!");
        
        return hash;
      } catch (error) {
        console.error("Withdraw failed:", error);
        toast.error("Withdraw failed. Please try again.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync]
  );

  /**
   * Claim rewards from Paynvest contract
   */
  const claim = useCallback(async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      const hash = await writeContractAsync({
        ...contractConfig,
        functionName: "claim",
        args: [],
      });

      toast.success("Claim transaction sent!");
      
      return hash;
    } catch (error) {
      console.error("Claim failed:", error);
      toast.error("Claim failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [address, writeContractAsync]);

  return {
    getBalance,
    withdraw,
    claim,
    isLoading: isLoading || balanceLoading,
  };
} 