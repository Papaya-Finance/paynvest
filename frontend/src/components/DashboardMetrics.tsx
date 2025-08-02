"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function MetricCard({ title, value, isLoading = false, className = "" }: MetricCardProps) {
  return (
    <Card className={`border border-muted bg-muted shadow-none ${className}`}>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <div className="h-8 flex items-center">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <p className="text-xl font-bold">
                  {value}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 