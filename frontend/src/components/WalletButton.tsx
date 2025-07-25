'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { useAppKit } from '@reown/appkit/react'
import { Copy, LogOut, Wallet, ChevronDown, Loader2, Check, PlugZap } from 'lucide-react'
import { toast } from 'sonner'
import { ThemeToggle } from './ThemeToggle'
import { useDisconnect } from 'wagmi'

/**
 * Wallet connection button with dropdown menu
 * Handles wallet connection, address display, and user actions
 */
export function WalletButton() {
  const { open } = useAppKit()
  const { address, isConnected } = require('@reown/appkit/react').useAppKitAccount();
  const [isCopied, setIsCopied] = useState(false)
  const { disconnect } = useDisconnect();

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
    disconnect();
    toast.info('Wallet disconnected');
  }

  // Loading state during connection
  if (false) { // isConnecting removed
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
      <>
        {/* Desktop button */}
        <Button 
          onClick={() => open()} 
          variant="default"
          className="font-semibold hidden md:flex items-center gap-2"
        >
          Connect Wallet
        </Button>
        {/* Mobile icon button */}
        <Button
          onClick={() => open()}
          variant="default"
          className="md:hidden flex items-center justify-center w-9 h-9 p-0"
          aria-label="Connect Wallet"
        >
          <PlugZap className="h-5 w-5" />
        </Button>
      </>
    )
  }

  // Connected wallet dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="font-mono hover:bg-muted/80 transition-colors flex items-center gap-2 px-2"
        >
          <div className="flex items-center space-x-2">
            <span className="md:inline">{formatAddress(address || '')}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        
        
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <div className="flex items-center w-full">
            {isCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-2">{isCopied ? 'Copied!' : 'Copy Address'}</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleDisconnect} 
          className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}