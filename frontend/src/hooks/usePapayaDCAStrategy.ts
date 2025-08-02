"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { DCAStrategy, Transaction } from "@/types";
import { fetchMockETHPrice, generateMockTransactions } from "@/lib/mockData";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { PapayaSDK, formatInput, RatePeriod } from "@papaya_fi/sdk";
import { ethers } from "ethers";
import { usePeriodPapaya } from "./usePeriodPapaya";
import { usePaynvest } from "./usePaynvest";

/**
 * usePapayaDCAStrategy - интеграция Papaya SDK для депозита, вывода, запуска и остановки DCA-стратегии
 */
export function usePapayaDCAStrategy() {
  const [strategies, setStrategies] = useLocalStorage<DCAStrategy[]>("dca-strategies", [], true);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("dca-transactions", [], true);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPriceLoading, setPriceLoading] = useState(false);
  const [papayaSDK, setPapayaSDK] = useState<any>(null);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { deposit: depositPeriodPapaya, subscribe } = usePeriodPapaya();
  const { withdraw: withdrawPaynvest, getBalance } = usePaynvest();

  // Инициализация Papaya SDK с ethers signer
  useEffect(() => {
    const initializeSDK = async () => {
      if (walletClient && address) {
        try {
          console.log("=== INITIALIZING PAPAYA SDK ===");
          
          // Create an ethers provider from the walletClient
          const provider = new ethers.BrowserProvider(walletClient);
          const signer = await provider.getSigner();
          
          console.log("Provider:", provider);
          console.log("Signer:", signer);
          console.log("Signer address:", await signer.getAddress());

          // Create a Papaya SDK instance with signer
          const sdk = PapayaSDK.create(
            signer,
            'polygon',
            'USDT',
          );
          
          console.log("PapayaSDK created:", sdk);
          setPapayaSDK(sdk);
        } catch (error) {
          console.error("Failed to initialize Papaya SDK:", error);
        }
      }
    };

    initializeSDK();
  }, [walletClient, address]);

  // Моковые транзакции для инициализации
  useEffect(() => {
    if (transactions.length === 0 && address) {
      // console.log(`📊 Initializing mock transactions for wallet: ${address}`);
      const mockTransactions = generateMockTransactions(5);
      setTransactions(mockTransactions);
    }
  }, [transactions.length, setTransactions, address]);

  // Получение цены ETH
  useEffect(() => {
    const fetchPrice = async () => {
      setPriceLoading(true);
      try {
        const price = await fetchMockETHPrice();
        setEthPrice(price);
      } catch (error) {
        console.error("Failed to fetch ETH price:", error);
        toast.error("Failed to fetch ETH price");
      } finally {
        setPriceLoading(false);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Метрики портфеля
  const portfolioMetrics = useMemo(() => {
    // Если кошелек не подключен, возвращаем пустые метрики
    if (!address) {
      // console.log(`📈 No wallet connected, showing empty metrics`);
      return {
        totalInvested: 0,
        totalETH: 0,
        currentValue: 0,
        hasActiveStrategy: false,
        strategyStatus: "Inactive",
      };
    }

    const totalInvested = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalETH = transactions.reduce((sum, tx) => sum + tx.ethAmount, 0);
    const activeStrategy = strategies.find((s) => s.isActive);
    
    // console.log(`📈 Portfolio metrics for ${address}:`, {
    //   transactionsCount: transactions.length,
    //   strategiesCount: strategies.length,
    //   totalInvested,
    //   totalETH,
    //   hasActiveStrategy: !!activeStrategy
    // });
    
    return {
      totalInvested,
      totalETH,
      currentValue: totalETH * ethPrice,
      hasActiveStrategy: !!activeStrategy,
      strategyStatus: activeStrategy?.isActive ? "Active" : "Inactive",
    };
  }, [transactions, strategies, ethPrice, address]);

  const activeStrategy = useMemo(() => {
    // Если кошелек не подключен, не показываем активную стратегию
    if (!address) {
      return null;
    }
    return strategies.find((s) => s.isActive) || null;
  }, [strategies, address]);

  const updateStrategy = useCallback(
    (id: string, updates: Partial<DCAStrategy>) => {
      setStrategies((prev) =>
        prev.map((strategy) => (strategy.id === id ? { ...strategy, ...updates } : strategy))
      );
    },
    [setStrategies]
  );

  /**
   * Депозит через Papaya SDK
   */
  const deposit = useCallback(
    async (amount: bigint) => {
      if (!papayaSDK || !address || !walletClient) {
        toast.error("Please connect your wallet first");
        return;
      }
      setIsLoading(true);
      try {
        // Format the amount correctly (USDC has 6 decimals)
        // const formattedAmount = formatInput(amount.toString(), 6);
        console.log("formattedAmount", amount);
        
        // Используем formattedAmount вместо хардкода
        const tx = await papayaSDK.deposit(amount);
        // const tx = await depositPeriodPapaya(formattedAmount);
        
        toast.success(`Deposit successful! TX: ${tx.hash.slice(0, 10)}...`);
        const newTransaction: Omit<Transaction, "id"> = {
          strategyId: "deposit",
          amount: Number(amount) / 1e6, // USDC has 6 decimals
          token: "USDC",
          ethAmount: 0,
          ethPrice,
          txHash: tx.hash,
          timestamp: new Date(),
          status: "confirmed",
        };
        setTransactions((prev) => [{ ...newTransaction, id: `tx_${Date.now()}` }, ...prev]);
        return tx;
      } catch (error) {
        console.error("Deposit failed:", error);
        toast.error("Deposit failed. Please try again.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [papayaSDK, address, walletClient, ethPrice, setTransactions]
  );

  /**
   * Вывод через Papaya SDK
   */
  const withdraw = useCallback(
    async (amount: bigint) => {
      if (!papayaSDK || !address || !walletClient) {
        toast.error("Please connect your wallet first");
        return;
      }
      setIsLoading(true);
      try {
        // Format the amount correctly (Papaya tokens have 18 decimals)
        console.log("Withdrawing amount:", amount);
        const tx = await papayaSDK.withdraw(amount);
        toast.success(`Withdrawal successful! TX: ${tx.hash.slice(0, 10)}...`);
        const newTransaction: Omit<Transaction, "id"> = {
          strategyId: "withdraw",
          amount: Number(amount) / 1e18, // Papaya tokens have 18 decimals
          token: "USDC",
          ethAmount: 0,
          ethPrice,
          txHash: tx.hash,
          timestamp: new Date(),
          status: "confirmed",
        };
        setTransactions((prev) => [{ ...newTransaction, id: `tx_${Date.now()}` }, ...prev]);
        return tx;
      } catch (error) {
        console.error("Withdrawal failed:", error);
        toast.error("Withdrawal failed. Please try again.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [papayaSDK, address, walletClient, ethPrice, setTransactions]
  );

  /**
   * Создание DCA-стратегии через Papaya SDK
   */
  const createStrategy = useCallback(
    async (
      amount: number,
      token: "USDT" | "USDC",
    ) => {
      if (!papayaSDK || !address || !walletClient) {
        toast.error("Please connect your wallet first");
        return;
      }
      setIsLoading(true);
      try {
        // Format the amount correctly (USDC has 6 decimals, USDT has 6 decimals)
        const decimals = token === "USDC" ? 6 : 6;
        const formattedAmount = formatInput(amount.toString(), 18);
        console.log("UNDEFINED", amount);
        
        // Get creator address from environment variable
        const creatorAddress = process.env.NEXT_PUBLIC_PAYNVEST_CONTRACT_ADDRESS as `0x${string}`;
        if (!creatorAddress) {
          throw new Error("NEXT_PUBLIC_PAYNVEST_CONTRACT_ADDRESS is not defined");
        }
        
        // Set period to 1 second for immediate execution
        const period = 1; // 1 second
        const projectId = 0; // Default project ID
        
        console.log("Creating strategy with:", {
          creatorAddress,
          formattedAmount,
          period,
          projectId
        });
        
        // Check if subscribe method exists
        if (!papayaSDK.subscribe) {
          throw new Error("subscribe method not available in PapayaSDK");
        }
        
        const tx = await papayaSDK.subscribe(
          creatorAddress,
          amount,
          RatePeriod.WEEK,
          0
        );
        // const am1 = BigInt(Math.floor(amount * 1e6)) * BigInt(1e12);
        // const am = am1 / BigInt(604800);

        // const tx = await subscribe(creatorAddress, am, 0);
        
        // Check if transaction was successful
        if (!tx || !tx.hash) {
          throw new Error("Transaction failed - no hash returned");
        }
        
        // Wait for transaction confirmation
        toast.info("Transaction sent! Waiting for confirmation...");
        await tx.wait();
        
        const newStrategy: DCAStrategy = {
          id: `strategy_${Date.now()}`,
          amount: Number(amount),
          token,
          isActive: true,
          createdAt: new Date(),
          totalInvested: 0,
          totalETHPurchased: 0,
        };
        setStrategies((prev) => [...prev.map((s) => ({ ...s, isActive: false })), newStrategy]);
        toast.success(`DCA strategy created successfully! TX: ${tx.hash.slice(0, 10)}...`);
        return newStrategy;
      } catch (error) {
        console.error("Error creating strategy:", error);
        toast.error(error instanceof Error ? error.message : "Failed to create strategy");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [papayaSDK, address, walletClient, setStrategies]
  );

  /**
   * Остановка активной DCA-стратегии через Papaya SDK
   */
  const stopStrategy = useCallback(
    async () => {
      if (!papayaSDK || !address || !walletClient) {
        toast.error("Please connect your wallet first");
        return;
      }
      const activeStrategy = strategies.find((s) => s.isActive);
      if (!activeStrategy) return;
      setIsLoading(true);
      try {
        // For now, we'll use a default creator address
        // In a real implementation, you'd get this from the strategy data
        const creatorAddress = process.env.NEXT_PUBLIC_PAYNVEST_CONTRACT_ADDRESS as `0x${string}`; // Default creator
        
        const tx = await papayaSDK.unsubscribe(creatorAddress);
        updateStrategy(activeStrategy.id, { isActive: false });
        toast.success(`Strategy stopped successfully! TX: ${tx.hash.slice(0, 10)}...`);
        return tx;
      } catch (error) {
        console.error("Error stopping strategy:", error);
        toast.error(error instanceof Error ? error.message : "Failed to stop strategy");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [papayaSDK, address, walletClient, strategies, updateStrategy]
  );

  /**
   * Клейм ETH через Paynvest контракт
   * Получает актуальный баланс через balanceOf и выводит весь доступный ETH
   */
  const claimETH = useCallback(
    async () => {
      if (!address) {
        toast.error("Please connect your wallet first");
        return;
      }
      setIsLoading(true);
      try {
        // Получаем актуальный баланс через balanceOf
        const currentBalance = await getBalance(address);
        
        if (currentBalance === BigInt(0)) {
          toast.error("No ETH available to claim");
          return;
        }
        
        console.log("Current ETH balance from contract:", currentBalance.toString());
        
        // Выводим весь доступный ETH
        const hash = await withdrawPaynvest(currentBalance);
        
        toast.success("ETH claim transaction sent!");
        console.log("ETH claim transaction hash:", hash);
        
        return hash;
      } catch (error) {
        console.error("Error claiming ETH:", error);
        toast.error(error instanceof Error ? error.message : "Failed to claim ETH");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, withdrawPaynvest, getBalance]
  );

  const deleteStrategy = useCallback(
    (id: string) => {
      setStrategies((prev) => prev.filter((strategy) => strategy.id !== id));
      setTransactions((prev) => prev.filter((tx) => tx.strategyId !== id));
    },
    [setStrategies, setTransactions]
  );

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, "id">) => {
      const newTransaction: Transaction = {
        ...transaction,
        id: `tx_${Date.now()}`,
      };
      setTransactions((prev) => [newTransaction, ...prev]);
      const strategy = strategies.find((s) => s.id === transaction.strategyId);
      if (strategy) {
        updateStrategy(transaction.strategyId, {
          totalInvested: strategy.totalInvested + transaction.amount,
          totalETHPurchased: strategy.totalETHPurchased + transaction.ethAmount,
          lastExecuted: transaction.timestamp,
        });
      }
    },
    [setTransactions, strategies, updateStrategy]
  );

  /**
   * Проверка allowance для USDC
   */
  const checkUSDCApproval = useCallback(
    async (amount: bigint): Promise<boolean> => {
      if (!papayaSDK || !address) return false;

      try {
        console.log("=== CHECKING USDC APPROVAL ===");
        console.log("Amount to check:", amount.toString());
        console.log("User address:", address);
        
        // Get USDC contract address from SDK
        const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Polygon USDC
        console.log("USDC contract address:", usdcAddress);
        
        // Check allowance using ethers
        if (!walletClient) {
          console.error("Wallet client not available");
          return false;
        }
        
        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(walletClient);
        const usdcContract = new ethers.Contract(
          usdcAddress,
          [
            "function allowance(address owner, address spender) view returns (uint256)",
            "function approve(address spender, uint256 amount) returns (bool)"
          ],
          provider
        );
        
        // Get contract address - use hardcoded address if SDK method doesn't exist
        const contractAddress = papayaSDK.getContractAddress ? 
          await papayaSDK.getContractAddress() : 
          "0x43CFA1D8bd93179D89BF7bF3268E5861385a1c96"; // Papaya contract address
        
        const allowance = await usdcContract.allowance(address, contractAddress);
        console.log("Current allowance:", allowance.toString());
        console.log("Required amount:", amount.toString());
        
        const isApproved = allowance >= amount;
        console.log("Is approved:", isApproved);
        
        return isApproved;
      } catch (error) {
        console.error("Failed to check USDC approval:", error);
        return false;
      }
    },
    [papayaSDK, address, walletClient]
  );

  /**
   * Установка бесконечного allowance для USDC
   */
  const approveUSDC = useCallback(
    async () => {
      if (!papayaSDK || !address || !walletClient) {
        toast.error("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      try {
        console.log("=== APPROVING USDC ===");
        console.log("User address:", address);
        
        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        
        const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Polygon USDC
        const usdcContract = new ethers.Contract(
          usdcAddress,
          [
            "function approve(address spender, uint256 amount) returns (bool)"
          ],
          signer
        );
        
        // Infinite allowance
        const infiniteAmount = ethers.MaxUint256;
        console.log("Approving infinite amount:", infiniteAmount.toString());
        
        // Get contract address - use hardcoded address if SDK method doesn't exist
        const contractAddress = papayaSDK.getContractAddress ? 
          await papayaSDK.getContractAddress() : 
          "0x43CFA1D8bd93179D89BF7bF3268E5861385a1c96"; // Papaya contract address
        
        const tx = await usdcContract.approve(contractAddress, infiniteAmount);
        console.log("Approval transaction:", tx.hash);
        
        toast.success("Approval transaction sent!");
        return tx;
      } catch (error) {
        console.error("USDC approval failed:", error);
        toast.error("Approval failed. Please try again.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [papayaSDK, address, walletClient]
  );

  return {
    strategies,
    transactions,
    ethPrice,
    portfolioMetrics,
    isLoading,
    isPriceLoading,
    deposit,
    withdraw,
    createStrategy,
    stopStrategy,
    claimETH,
    checkUSDCApproval,
    approveUSDC,
    updateStrategy,
    deleteStrategy,
    addTransaction,
    activeStrategy,
  };
}