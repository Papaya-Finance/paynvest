"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePapayaBalance } from "@/hooks/usePapayaBalance";
import { PapayaDialog } from "./PapayaDialog";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import Image from "next/image";

/**
 * Component to display Papaya balance with deposit/withdraw buttons
 */
export function PapayaBalance() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"deposit" | "withdraw">("deposit");
  
  const { formattedBalance, isLoading } = usePapayaBalance();
  const { papaya } = useWalletBalance();

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
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Image
                  src="/papaya.svg"
                  alt="Papaya"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
                <Image
                  src="/usdc.svg"
                  alt="USDC"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
              </div>
              <span className="text-md font-mono">
                {/* {isLoading ? "Loading..." : formattedBalance} */}
                {!papaya ? "Loading..." : (Number(papaya?.formatted).toFixed(6))}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDialog("deposit")}
                // disabled={isLoading}
              >
                Deposit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDialog("withdraw")}
                // disabled={isLoading}
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