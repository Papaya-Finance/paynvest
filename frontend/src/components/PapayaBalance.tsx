"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { PapayaDialog } from "./PapayaDialog";
import Image from "next/image";

/**
 * Component to display Papaya balance with deposit/withdraw buttons
 */
export function PapayaBalance() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"deposit" | "withdraw">("deposit");
  
  const { papaya, isLoading } = useWalletBalance();

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return "0";
    const num = parseFloat(balance);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const handleOpenDialog = (mode: "deposit" | "withdraw") => {
    setDialogMode(mode);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Card className="border border-muted bg-muted/50 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Image
                  src="/papaya.svg"
                  alt="Papaya"
                  width={16}
                  height={16}
                  className="rounded-full"
                />
                <Image
                  src="/usdc.svg"
                  alt="USDC"
                  width={12}
                  height={12}
                  className="rounded-full"
                />
              </div>
              <span className="text-lg font-bold">
                {isLoading ? "Loading..." : formatBalance(papaya?.formatted)}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDialog("deposit")}
                disabled={isLoading}
              >
                Deposit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDialog("withdraw")}
                disabled={isLoading || !papaya || parseFloat(papaya.formatted) <= 0}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PapayaDialog
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        mode={dialogMode}
      />
    </>
  );
} 