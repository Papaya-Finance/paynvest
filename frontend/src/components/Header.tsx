'use client'

import { WalletButton } from './WalletButton'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">P</span>
          </div>
          <span className="text-lg font-semibold">PAYNVEST</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <WalletButton />
        </div>
      </div>
    </header>
  )
}