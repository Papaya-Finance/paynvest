"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTotalInvested } from "@/hooks/useTotalInvested";
import { useEthBalance } from "@/hooks/useEthBalance";
import { useEthPrice } from "@/hooks/useEthPrice";
import { Loader2 } from "lucide-react";

/**
 * Component to display dashboard metrics with real data
 */
export function DashboardMetrics() {
  const { totalInvested, isLoading: totalInvestedLoading } = useTotalInvested();
  const { balance: ethBalance, isLoading: ethBalanceLoading } = useEthBalance();
  const { price: ethPrice, isLoading: ethPriceLoading } = useEthPrice();

  // Calculate portfolio value
  const portfolioValue = useMemo(() => {
    if (!ethBalance || !ethPrice) return 0;
    
    // Convert balance from wei to ETH, then multiply by price
    const ethAmount = Number(ethBalance) / 1e18;
    return ethAmount * ethPrice;
  }, [ethBalance, ethPrice]);

  // Format values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatEthBalance = (balance: bigint) => {
    const ethAmount = Number(balance) / 1e18;
    return ethAmount.toFixed(6);
  };

  const isLoading = totalInvestedLoading || ethBalanceLoading || ethPriceLoading;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Invested */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              formatCurrency(Number(totalInvested) / 1e18)
            )}
          </div>
        </CardContent>
      </Card>

      {/* ETH Balance */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ETH Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              formatEthBalance(ethBalance)
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current ETH Price */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current ETH Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              ethPrice ? formatCurrency(ethPrice) : "N/A"
            )}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              formatCurrency(portfolioValue)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 