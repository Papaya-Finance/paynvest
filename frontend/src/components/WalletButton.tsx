'use client'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Copy, LogOut, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { ThemeToggle } from './ThemeToggle'

export function WalletButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard')
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Button onClick={() => open()} variant="default">
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Wallet className="mr-2 h-4 w-4" />
          {formatAddress(address || '')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => open({ view: 'Account' })}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm">Theme</span>
          <ThemeToggle />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}