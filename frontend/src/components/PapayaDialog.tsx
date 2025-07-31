"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";
import { usePeriodPapaya } from "@/hooks/usePeriodPapaya";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { createPortal } from "react-dom";

interface PapayaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "deposit" | "withdraw";
}

/**
 * Dialog component for Papaya deposit/withdraw operations
 * Includes approval flow for deposits
 */
export function PapayaDialog({ isOpen, onClose, mode }: PapayaDialogProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);

  const { deposit, withdraw, checkApproval, approveUSDC } = usePeriodPapaya();
  const { usdc, papaya } = useWalletBalance();

  // Check approval status when dialog opens for deposit mode
  useEffect(() => {
    if (isOpen && mode === "deposit") {
      checkApprovalStatus();
    }
  }, [isOpen, mode]);

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

  const checkApprovalStatus = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsCheckingApproval(true);
    try {
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e6)); // USDC has 6 decimals
      const isApproved = await checkApproval(amountInWei);
      setNeedsApproval(!isApproved);
    } catch (error) {
      console.error("Failed to check approval status:", error);
      setNeedsApproval(true); // Default to requiring approval on error
    } finally {
      setIsCheckingApproval(false);
    }
  };

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    try {
      await approveUSDC();
      setNeedsApproval(false);
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    try {
      if (mode === "deposit") {
        const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e6)); // USDC has 6 decimals
        await deposit(amountInWei);
      } else {
        const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18)); // Papaya has 18 decimals
        await withdraw(amountInWei);
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
      return usdc?.formatted || "0";
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

  const isButtonDisabled = () => {
    if (isLoading || !amount || parseFloat(amount) <= 0) return true;
    if (mode === "deposit" && isCheckingApproval) return true;
    return false;
  };

  const handleButtonClick = () => {
    if (mode === "deposit" && needsApproval) {
      handleApprove();
    } else {
      handleSubmit();
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
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              className="text-lg"
            />
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