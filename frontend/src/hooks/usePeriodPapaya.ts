"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract } from "wagmi";
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

  // Contract configuration
  const contractConfig = {
    address: process.env.NEXT_PUBLIC_PERIOD_PAPAYA_CONTRACT_ADDRESS as `0x${string}`,
    abi: PeriodPapayaABI.abi,
  };

  // USDC contract configuration for approval
  const usdcContractConfig = {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as `0x${string}`, // USDC on Ethereum
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
  };

  /**
   * Check if USDC approval is needed
   * Note: This is a placeholder - in wagmi v2 we need to use different approach
   */
  const checkApproval = useCallback(
    async (amount: bigint): Promise<boolean> => {
      if (!address) return false;

      try {
        // TODO: Implement proper approval check for wagmi v2
        // For now, return false to always require approval
        return false;
      } catch (error) {
        console.error("Failed to check approval:", error);
        return false;
      }
    },
    [address]
  );

  /**
   * Approve USDC tokens for PeriodPapaya contract
   */
  const approveUSDC = useCallback(
    async (amount: bigint = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")) => {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      try {
        const hash = await writeContractAsync({
          ...usdcContractConfig,
          functionName: "approve",
          args: [contractConfig.address, amount],
        });

        toast.success("Approval transaction sent!");
        
        return hash;
      } catch (error) {
        console.error("Approval failed:", error);
        toast.error("Approval failed. Please try again.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync]
  );

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
        const hash = await writeContractAsync({
          ...contractConfig,
          functionName: "deposit",
          args: [amount, isPermit2],
        });

        toast.success("Deposit transaction sent!");
        
        return hash;
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
   * Decode encodedRates using the same logic as _decodeRates in the contract
   * @param encodedRates - Encoded rates from subscription data
   * @returns Decoded values: incomeAmount, outgoingAmount, projectId, timestamp
   */
  const decodeRates = useCallback((encodedRates: bigint) => {
    const incomeAmount = encodedRates & BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFF");
    const outgoingAmount = (encodedRates >> BigInt(96)) & BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFF");
    const projectId = (encodedRates >> BigInt(192)) & BigInt("0xFFFFFFFF");
    const timestamp = (encodedRates >> BigInt(224)) & BigInt("0xFFFFFFFF");
    
    return {
      incomeAmount,
      outgoingAmount,
      projectId: Number(projectId),
      timestamp: Number(timestamp),
    };
  }, []);

  /**
   * Get subscription data for calculating total invested
   * Note: This is a placeholder - in wagmi v2 we need to use different approach
   */
  const getSubscriptionData = useCallback(
    async (userAddress: `0x${string}`, paynvestAddress: `0x${string}`): Promise<SubscriptionData> => {
      try {
        // TODO: Implement proper subscription data reading for wagmi v2
        // For now, return default values
        return {
          isActive: false,
          encodedRates: BigInt(0),
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
            totalInvested: BigInt(0),
            periodsPassed: 0,
            incomeRate: BigInt(0),
            streamStarted: 0,
          };
        }

        // Decode encodedRates using the proper method
        const { incomeAmount, outgoingAmount, projectId, timestamp } = decodeRates(encodedRates);
        
        const streamStarted = Number(timestamp);
        const incomeRate = incomeAmount;

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
    [getSubscriptionData, decodeRates]
  );

  return {
    deposit,
    withdraw,
    getSubscriptionData,
    calculateTotalInvested,
    decodeRates,
    checkApproval,
    approveUSDC,
    isLoading,
  };
} 