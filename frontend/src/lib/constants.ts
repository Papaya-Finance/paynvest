export const APP_CONFIG = {
  name: 'PAYNVEST',
  description: 'DCA strategy for buying Ethereum',
  version: '1.0.0',
  defaultCurrency: 'USDT' as const,
  supportedTokens: ['USDT', 'USDC'] as const,
  frequencies: [
    { value: 'daily', label: 'Daily', seconds: 86400 },
    { value: 'weekly', label: 'Weekly', seconds: 604800 },
    { value: 'monthly', label: 'Monthly', seconds: 2592000 }
  ] as const
}

export const UI_CONFIG = {
  animations: {
    duration: 300,
    easing: 'ease-in-out'
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  }
}

export const DEFAULT_VALUES = {
  investmentAmount: 10,
  frequency: 'weekly' as const,
  slippage: 0.5,
  gasLimit: 100000
}

export const CONTRACT_ADDRESSES = {
  // These would be filled with actual contract addresses
  DCA_MANAGER: '0x...',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDC: '0xA0b86a33E6441986d5F18c1b78F6b2419BdF5542'
}