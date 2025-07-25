'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Copy, LogOut, Wallet, ChevronDown, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ThemeToggle } from './ThemeToggle'

/**
 * Wallet connection button with dropdown menu
 * Handles wallet connection, address display, and user actions
 */
export function WalletButton() {
  const { open } = useAppKit()
  const { address, isConnected, isConnecting } = useAppKitAccount()
  const [isCopied, setIsCopied] = useState(false)

  /**
   * Copy wallet address to clipboard
   */
  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address)
        setIsCopied(true)
        toast.success('Address copied to clipboard')
        setTimeout(() => setIsCopied(false), 2000)
      } catch (error) {
        toast.error('Failed to copy address')
      }
    }
  }

  /**
   * Format wallet address for display
   * @param addr - Full wallet address
   * @returns Formatted address string
   */
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  /**
   * Disconnect wallet
   */
  const handleDisconnect = () => {
    open({ view: 'Account' })
    toast.info('Wallet disconnected')
  }

  // Loading state during connection
  if (isConnecting) {
    return (
      <Button disabled variant="outline">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    )
  }

  // Connect wallet button when not connected
  if (!isConnected) {
    return (
      <Button 
        onClick={() => open()} 
        variant="default"
        className="font-semibold hover:scale-105 transition-transform duration-200"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  // Connected wallet dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="font-mono hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>{formatAddress(address || '')}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Connected Wallet</span>
            <span className="text-xs font-mono text-muted-foreground break-all">
              {address}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <div className="flex items-center w-full">
            {isCopied ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            <span>{isCopied ? 'Copied!' : 'Copy Address'}</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => open({ view: 'Account' })} className="cursor-pointer">
          <Wallet className="mr-2 h-4 w-4" />
          Account Details
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggle />
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDisconnect} 
          className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}