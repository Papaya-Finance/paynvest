'use client'

import { WalletButton } from './WalletButton'
import { ThemeToggle } from './ThemeToggle'

/**
 * Application header with logo, theme toggle, and wallet connection
 * Features sticky positioning with backdrop blur effect
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
            <span className="text-lg font-bold">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">PAYNVEST</span>
            <span className="text-xs text-muted-foreground hidden sm:block">Smart DCA for ETH</span>
          </div>
        </div>
        
        {/* Actions Section */}
        <div className="flex items-center space-x-2">
          <div className="md:block">
            <ThemeToggle />
          </div>
          <WalletButton />
        </div>
      </div>
    </header>
  )
}