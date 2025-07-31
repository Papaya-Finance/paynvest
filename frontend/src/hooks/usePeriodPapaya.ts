"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { toast } from "sonner";
import PeriodPapayaABI from "@/lib/abi/PeriodPapaya.json";
import type { UsePeriodPapayaReturn, SubscriptionData, TotalInvestedCalculation } from "@/types";

/**
 * Hook for interacting with PeriodPapaya contract
 * Provides methods for deposit, withdraw and subscription calculations
 */
export function usePeriodPapaya(): UsePeriodPapayaReturn {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const { readContract } = useReadContract();

  // Contract configuration
  const contractConfig = {
    address: process.env.NEXT_PUBLIC_PERIOD_PAPAYA_CONTRACT_ADDRESS as `0x${string}`,
    abi: PeriodPapayaABI,
  };

  /**
   * Deposit funds into PeriodPapaya contract
   * @param amount - Amount to deposit in wei
   * @param isPermit2 - Whether to use Permit2 for approval
   */
  const deposit = useCallback(
    async (amount: bigint, isPermit2: boolean = false) => {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      try {
        const tx = await writeContractAsync({
          ...contractConfig,
          functionName: "deposit",
          args: [amount, isPermit2],
        });

        toast.success("Deposit transaction sent!");
        
        // Wait for transaction confirmation
        await tx.wait();
        toast.success("Deposit confirmed!");
        
        return tx;
      } catch (error) {
        console.error("Deposit failed:", error);
        toast.error("Deposit failed. Please try again.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync]
  );

  /**
   * Withdraw funds from PeriodPapaya contract
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
        const tx = await writeContractAsync({
          ...contractConfig,
          functionName: "withdraw",
          args: [amount],
        });

        toast.success("Withdraw transaction sent!");
        
        // Wait for transaction confirmation
        await tx.wait();
        toast.success("Withdraw confirmed!");
        
        return tx;
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
   * Get subscription data for calculating total invested
   * @param userAddress - User's wallet address
   * @param paynvestAddress - Paynvest contract address
   */
  const getSubscriptionData = useCallback(
    async (userAddress: `0x${string}`, paynvestAddress: `0x${string}`): Promise<SubscriptionData> => {
      try {
        const result = await readContract({
          ...contractConfig,
          functionName: "subscriptions",
          args: [userAddress, paynvestAddress],
        });

        return {
          isActive: result[0] as boolean,
          encodedRates: result[1] as bigint,
        };
      } catch (error) {
        console.error("Failed to get subscription data:", error);
        throw error;
      }
    },
    []
  );

  /**
   * Calculate total invested amount based on subscription data
   * @param userAddress - User's wallet address
   * @param paynvestAddress - Paynvest contract address
   * @param refillDays - REFILL_DAYS constant from contract
   */
  const calculateTotalInvested = useCallback(
    async (
      userAddress: `0x${string}`,
      paynvestAddress: `0x${string}`,
      refillDays: number
    ): Promise<TotalInvestedCalculation> => {
      try {
        const { isActive, encodedRates } = await getSubscriptionData(
          userAddress,
          paynvestAddress
        );

        if (!isActive) {
          return {
            totalInvested: 0n,
            periodsPassed: 0,
            incomeRate: 0n,
            streamStarted: 0,
          };
        }

        // Decode encodedRates to get streamStarted and incomeRate
        // This is a simplified example - you'll need to implement the actual decoding logic
        // based on how the contract encodes these values
        const streamStarted = Number(encodedRates & 0xFFFFFFFFn); // First 32 bits
        const incomeRate = (encodedRates >> 32n) & 0xFFFFFFFFn; // Next 32 bits

        const now = Math.floor(Date.now() / 1000);
        const periodsPassed = Math.floor((now - streamStarted) / (refillDays * 24 * 60 * 60));
        const totalInvested = BigInt(periodsPassed) * incomeRate;

        return {
          totalInvested,
          periodsPassed,
          incomeRate,
          streamStarted,
        };
      } catch (error) {
        console.error("Failed to calculate total invested:", error);
        throw error;
      }
    },
    [getSubscriptionData]
  );

  return {
    deposit,
    withdraw,
    getSubscriptionData,
    calculateTotalInvested,
    isLoading,
  };
} 