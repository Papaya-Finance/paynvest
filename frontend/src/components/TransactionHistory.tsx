'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Transaction } from '@/types'
import { ExternalLink, Clock } from 'lucide-react'

interface TransactionHistoryProps {
  transactions: Transaction[]
}

/**
 * Transaction history table component
 * @param transactions - Array of transaction data to display
 */
export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatDate = (date: Date | string | number) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatETH = (amount: number) => {
    return `${amount.toFixed(6)} ETH`
  }

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      failed: 'destructive'
    } as const

    const colors = {
      pending: 'text-yellow-600 dark:text-yellow-400',
      confirmed: 'text-green-600 dark:text-green-400',
      failed: 'text-red-600 dark:text-red-400'
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Your DCA transaction history will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No transactions yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start your DCA strategy to see your transaction history here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>
          Your recent DCA transactions and ETH purchases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>ETH Received</TableHead>
                <TableHead>ETH Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">TX Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {formatDate(transaction.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {transaction.token}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatETH(transaction.ethAmount)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(transaction.ethPrice)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => window.open(`https://etherscan.io/tx/${transaction.txHash}`, '_blank')}
                      className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-mono"
                      title={`View transaction ${transaction.txHash}`}
                    >
                      {formatTxHash(transaction.txHash)}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}