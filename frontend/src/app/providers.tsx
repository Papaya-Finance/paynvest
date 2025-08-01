'use client'

import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ThemeProvider } from 'next-themes'
import { wagmiAdapter, wagmiConfig } from '@/lib/wagmi'
import { mainnet, polygon } from 'wagmi/chains'

const queryClient = new QueryClient()

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is required')
}

const metadata = {
  name: 'PAYNVEST',
  description: 'DCA strategy for buying Ethereum with automatic ETH purchases through smart contracts',
  url: 'https://paynvest.com',
  icons: ['https://paynvest.com/icon.png']
}

const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  networks: [mainnet, polygon],
  // defaultNetwork: polygon,
  metadata,
  features: {
    analytics: true
  }
})

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}