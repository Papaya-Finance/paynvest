"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { readContract } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { toast } from "sonner";
import PeriodPapayaABI from "@/lib/abi/PeriodPapaya.json";
import { decodeRates } from "@papaya_fi/sdk";
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
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" as `0x${string}`, // USDC on Polygon
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
   */
  const checkApproval = useCallback(
    async (amount: bigint): Promise<boolean> => {
      if (!address) return false;

      try {
        // TEMPORARY: Return true to test if approval flow works
        // This will show "Deposit" button instead of "Approve"
        // console.log("Checking approval for amount:", amount.toString());
        // console.log("User address:", address);
        // console.log("PeriodPapaya contract:", contractConfig.address);
        
        // For testing: return true to simulate approved state
        return true; // Change this to false to test approval flow
        
        // TODO: Implement proper approval check when wagmi v2 API is stable
        // return false;
      } catch (error) {
        console.error("Failed to check approval:", error);
        return false; // Default to requiring approval on error
      }
    },
    [address]
  );

   /**
   * Subscribe to a creator's stream
   * @param author - Creator's address
   * @param subscriptionAmount - Amount to subscribe in wei
   * @param projectId - Project ID
   */
   const subscribe = useCallback(
    async (author: `0x${string}`, subscriptionAmount: bigint, projectId: number) => {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      try {
        const hash = await writeContractAsync({
          ...contractConfig,
          functionName: "subscribe",
          args: [author, subscriptionAmount, projectId],
        });

        toast.success("Subscribe transaction sent!");
        
        return hash;
      } catch (error) {
        console.error("Subscribe failed:", error);
        toast.error("Subscribe failed. Please try again.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync]
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
            // console.log("Withdrawing amount:", amount.toString());
    // console.log("Contract address:", contractConfig.address);
        
        const hash = await writeContractAsync({
          ...contractConfig,
          functionName: "withdraw",
          args: [amount],
          gas: BigInt(300000), // Set reasonable gas limit
        });

        toast.success("Withdraw transaction sent!");
        // console.log("Withdraw transaction hash:", hash);
        
        return hash;
      } catch (error) {
        console.error("Withdraw failed:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        // Check if it's a contract error
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = (error as any).message;
          console.error("Error message:", errorMessage);
          
          if (errorMessage.includes("insufficient balance") || errorMessage.includes("InsufficialBalance")) {
            toast.error("Insufficient balance for withdrawal");
          } else if (errorMessage.includes("revert")) {
            toast.error("Transaction failed. Please check your balance and try again.");
          } else if (errorMessage.includes("gas")) {
            toast.error("Transaction failed due to gas issues. Please try again.");
          } else {
            toast.error(`Withdraw failed: ${errorMessage}`);
          }
        } else {
          toast.error("Withdraw failed. Please try again.");
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, writeContractAsync]
  );

  /**
   * Decode rates from encoded subscription data
   * Mirrors the Solidity _decodeRates function
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
   * Get subscription data for user
   * @param userAddress - User's wallet address
   * @param paynvestAddress - Paynvest contract address
   */
  const getSubscriptionData = useCallback(
    async (userAddress: `0x${string}`, paynvestAddress: `0x${string}`): Promise<SubscriptionData> => {
      try {
        // TODO: Fix contract reading - temporarily commented out
        const subscriptionResult = await readContract(wagmiConfig, {
          ...contractConfig,
          functionName: 'subscriptions',
          args: [userAddress, paynvestAddress],
        });
        // console.log("SUBSCRIPTION RESULT", subscriptionResult);
        if (!subscriptionResult) {
          return {
            isActive: false,
            encodedRates: BigInt(0),
          };
        }

        const [isActive, encodedRates] = subscriptionResult as [boolean, bigint];
        
        return {
          isActive,
          encodedRates,
        };
        
        // Temporary fallback
          // return {
          //   isActive: false,
          //   encodedRates: BigInt(0),
          // };
      } catch (error) {
        console.error("Failed to get subscription data:", error);
        throw error;
      }
    },
    [contractConfig]
  );

  /**
   * Get REFILL_DAYS constant from contract
   */
  const getRefillDays = useCallback(async (): Promise<number> => {
    try {
      // TODO: Fix contract reading - temporarily commented out
      const refillDays = await readContract(wagmiConfig, {
        ...contractConfig,
        functionName: 'REFILL_DAYS',
      });
      // console.log("REFILL DAYS", refillDays);
      return Number(refillDays) || 7; // Default to 7 days if not available
      // return 7; // Temporary fallback
    } catch (error) {
      console.error("Failed to get REFILL_DAYS:", error);
      return 7; // Default fallback
    }
  }, [contractConfig]);

  /**
   * Calculate total invested amount based on subscription data
   * @param userAddress - User's wallet address
   * @param paynvestAddress - Paynvest contract address
   */
  const calculateTotalInvested = useCallback(
    async (userAddress: `0x${string}`, paynvestAddress: `0x${string}`): Promise<TotalInvestedCalculation> => {
      try {
        const subscriptionData = await getSubscriptionData(userAddress, paynvestAddress);
        
        if (!subscriptionData.isActive) {
          return {
            totalInvested: BigInt(0),
            periodsPassed: 0,
            incomeRate: BigInt(0),
            streamStarted: 0,
          };
        }

        const decodedRates = decodeRates(subscriptionData.encodedRates);
        const refillDays = await getRefillDays();
        const currentTime = Math.floor(Date.now() / 1000);
        // console.log("DECODED RATES", decodedRates);

        // Calculate periods passed: (now() - streamStarted) / REFILL_DAYS
        const periodsPassed = Math.floor((currentTime - decodedRates.timestamp) / (refillDays * 24 * 60 * 60));
        
        // Calculate total invested: periodsPassed * incomeRate
        // const totalInvested = decodedRates.outgoingAmount * BigInt(periodsPassed);
        const totalInvested = decodedRates.outgoingAmount;

        return {
          totalInvested,
          periodsPassed,
          incomeRate: decodedRates.incomeAmount,
          streamStarted: decodedRates.timestamp,
        };
      } catch (error) {
        console.error("Failed to calculate total invested:", error);
        throw error;
      }
    },
    [getSubscriptionData, decodeRates, getRefillDays]
  );

  return {
    deposit,
    withdraw,
    getSubscriptionData,
    calculateTotalInvested,
    decodeRates,
    getRefillDays,
    checkApproval,
    approveUSDC,
    subscribe,
    isLoading,
  };
} 