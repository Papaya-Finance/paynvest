"use client";

import { useState, useCallback, useMemo } from "react";
import { useAccount, useWriteContract } from "wagmi";
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

  // Contract configuration - мемоизирован для стабильности
  const contractConfig = useMemo(() => ({
    address: process.env.NEXT_PUBLIC_PAYNVEST_CONTRACT_ADDRESS as `0x${string}`,
    abi: PaynvestABI.abi,
  }), []); // Пустой массив - объект создается только один раз

  /**
   * Get user's ETH balance from Paynvest contract using balanceOf method
   * @param userAddress - User's wallet address
   */
  const getBalance = useCallback(
    async (userAddress: `0x${string}`) => {
      try {
        // const balance = await readContract(wagmiConfig, {
        //   ...contractConfig,
        //   functionName: "balanceOf",
        //   args: [userAddress],
        // });
        // console.log(balance);
        // return balance as bigint;
        return BigInt(0); // Temporary fallback
      } catch (error) {
        console.error("Failed to get balance:", error);
        throw error;
      }
    },
    [] // Убрали contractConfig из зависимостей
  );

  /**
   * Withdraw funds from Paynvest contract
   * @param amount - Amount to withdraw in wei
   */
  const withdraw = useCallback(
    async (amount: bigint) => {
      if (!address) {
        toast.error("Please connect your wallet first");
        throw new Error("Wallet not connected");
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
    [address, writeContractAsync, contractConfig]
  );

  /**
   * Claim rewards from Paynvest contract
   */
  const claim = useCallback(async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      throw new Error("Wallet not connected");
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
  }, [address, writeContractAsync, contractConfig]);

  return {
    getBalance,
    withdraw,
    claim,
    isLoading,
  };
} 