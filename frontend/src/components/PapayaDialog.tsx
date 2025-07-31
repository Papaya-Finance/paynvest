"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { usePeriodPapaya } from "@/hooks/usePeriodPapaya";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "sonner";

interface PapayaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "deposit" | "withdraw";
}

/**
 * Dialog component for Papaya deposit and withdraw operations
 */
export function PapayaDialog({ isOpen, onClose, mode }: PapayaDialogProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);

  const { deposit, withdraw, checkApproval, approveUSDC } = usePeriodPapaya();
  const { usdc, papaya } = useWalletBalance();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setIsLoading(false);
      setNeedsApproval(false);
      setIsCheckingApproval(false);
    }
  }, [isOpen]);

  // Check approval when amount changes for deposit mode
  useEffect(() => {
    if (isOpen && mode === "deposit" && amount && parseFloat(amount) > 0) {
      checkApprovalStatus();
    }
  }, [amount, isOpen, mode]);

  const checkApprovalStatus = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsCheckingApproval(true);
    try {
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10 ** 6));
      const isApproved = await checkApproval(amountBigInt);
      setNeedsApproval(!isApproved);
    } catch (error) {
      console.error("Failed to check approval:", error);
      setNeedsApproval(true);
    } finally {
      setIsCheckingApproval(false);
    }
  };

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      await approveUSDC();
      setNeedsApproval(false);
      toast.success("Approval successful!");
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error("Approval failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10 ** 6)); // USDC has 6 decimals

    setIsLoading(true);
    try {
      if (mode === "deposit") {
        await deposit(amountBigInt, false);
        toast.success("Deposit successful!");
      } else {
        await withdraw(amountBigInt);
        toast.success("Withdraw successful!");
      }
      onClose();
    } catch (error) {
      console.error(`${mode} failed:`, error);
      toast.error(`${mode === "deposit" ? "Deposit" : "Withdraw"} failed. Please try again.`);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">{getTitle()}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {mode === "deposit" && needsApproval && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              <p>You need to approve USDC tokens before depositing.</p>
            </div>
          )}

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
    </div>
  );
} 