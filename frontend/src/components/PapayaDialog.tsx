"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";
import { usePapayaDCAStrategy } from "@/hooks/usePapayaDCAStrategy";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface PapayaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "deposit" | "withdraw";
}

/**
 * Dialog component for Papaya deposit/withdraw operations
 * Uses PapayaDCAStrategy for all operations including approval
 */
export function PapayaDialog({ isOpen, onClose, mode }: PapayaDialogProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);

  // Use PapayaDCAStrategy for all operations
  const { 
    deposit, 
    withdraw, 
    checkUSDCApproval, 
    approveUSDC 
  } = usePapayaDCAStrategy();
  const { usdc, usdt, papaya } = useWalletBalance();

  // Check approval status when dialog opens for deposit mode
  useEffect(() => {
    if (isOpen && mode === "deposit") {
      checkApprovalStatus();
    }
  }, [isOpen, mode]);

  // Check approval status when amount changes for deposit mode
  useEffect(() => {
    if (isOpen && mode === "deposit" && amount && parseFloat(amount) > 0) {
      checkApprovalStatus();
    }
  }, [amount, isOpen, mode]);

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset amount when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAmount("");
    }
  }, [isOpen]);

  const checkApprovalStatus = async () => {
    if (!amount) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsCheckingApproval(true);
    try {
      const amountInWei = BigInt(Math.floor(parsedAmount * 1e6)); // USDC has 6 decimals
      const isApproved = await checkUSDCApproval(amountInWei);
      setNeedsApproval(!isApproved);
    } catch (error) {
      console.error("Failed to check approval status:", error);
      setNeedsApproval(true); // Default to requiring approval on error
    } finally {
      setIsCheckingApproval(false);
    }
  };

  const handleApprove = async () => {
    if (!amount) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsLoading(true);
    try {
      await approveUSDC();
      // Force re-check approval status after successful approval
      setTimeout(() => {
        checkApprovalStatus();
      }, 2000); // Wait 2 seconds for transaction to be mined
      setNeedsApproval(false);
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsLoading(true);
    try {
      if (mode === "deposit") {        
        await deposit(BigInt(parsedAmount*10**6));
        // Reset approval status after successful deposit
        setNeedsApproval(false);
      } else {        
        // Check if user has enough balance
        const availableBalance = getAvailableBalance();
        if (parsedAmount > availableBalance) {
          toast.error("Insufficient balance for withdrawal");
          return;
        }
        
        await withdraw(BigInt(parsedAmount*10**18));
      }
      
      setAmount("");
      onClose();
    } catch (error) {
      console.error(`${mode} failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = () => {
    if (mode === "deposit") {
      return usdt?.formatted || "0";
    } else {
      return papaya?.formatted || "0";
    }
  };

  const getBalanceLabel = () => {
    return mode === "deposit" ? "USDC Balance" : "Papaya Balance";
  };

  const getTitle = () => {
    return mode === "deposit" ? "Deposit USDC" : "Withdraw Papaya";
  };

  const getButtonText = () => {
    if (isLoading) {
      if (mode === "deposit" && needsApproval) {
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Approving...
          </>
        );
      }
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === "deposit" ? "Depositing..." : "Withdrawing..."}
        </>
      );
    }
    
    if (mode === "deposit" && needsApproval) {
      return "Approve";
    }
    
    return mode === "deposit" ? "Deposit" : "Withdraw";
  };

  // Validation functions
  const getAmountInWei = () => {
    if (!amount) return BigInt(0);
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return BigInt(0);
    // For withdraw, we need to convert Papaya tokens to wei (18 decimals)
    // For deposit, we need to convert USDC to wei (6 decimals)
    const multiplier = mode === "deposit" ? 1e6 : 1e18;
    return BigInt(Math.floor(parsedAmount * multiplier));
  };

  const getAvailableBalance = () => {
    if (mode === "deposit") {
      return usdc?.value || BigInt(0);
    } else {
      return papaya?.value || BigInt(0);
    }
  };

  const isAmountValid = () => {
    const amountInWei = getAmountInWei();
    const availableBalance = getAvailableBalance();
    return amountInWei > 0 && amountInWei <= availableBalance;
  };

  const isButtonDisabled = () => {
    if (isLoading || !amount) return true;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return true;
    if (mode === "deposit" && isCheckingApproval) return true;
    if (!isAmountValid()) return true;
    return false;
  };

  const handleButtonClick = () => {
    if (mode === "deposit" && needsApproval) {
      handleApprove();
    } else {
      handleSubmit();
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  if (!isOpen) return null;

  // Use portal to render modal at the root level
  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-sm p-4 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pr-0 pl-0">
          <CardTitle className="text-lg font-semibold">{getTitle()}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 pr-0 pl-0">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="text"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              disabled={isLoading}
              className={`text-lg ${!isAmountValid() && amount ? 'border-red-500' : ''}`}
            />
            {!isAmountValid() && amount && (
              <p className="text-xs text-red-500">
                {mode === "deposit" 
                  ? "Amount exceeds USDC balance" 
                  : "Amount exceeds Papaya balance"
                }
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{getBalanceLabel()}</span>
            <span className="font-medium">{getBalance()}</span>
          </div>

          {/* {mode === "deposit" && needsApproval && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              <p>You need to approve USDC tokens before depositing.</p>
            </div>
          )} */}

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleButtonClick}
              disabled={isButtonDisabled()}
              className="flex-1"
            >
              {getButtonText()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
} 