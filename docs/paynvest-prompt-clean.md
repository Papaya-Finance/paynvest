# PAYNVEST - Prompt 1: Project Structure and Component Setup

## Project Description
PAYNVEST - DCA (Dollar Cost Averaging) strategy for buying Ethereum. Users input an amount in USDT/USDC (e.g. $10), and automatic ETH purchases occur through smart contracts.

## Context
- Next.js project is already created in frontend folder
- Dependencies are already installed (wagmi, shadcn, sonner, etc.)
- shadcn/ui components are already added

## File Structure to Create
```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main page with section switching
│   ├── globals.css             # Global styles
│   └── providers.tsx           # Web3 and Theme providers
├── components/
│   ├── ui/                     # shadcn components (already exists)
│   ├── Header.tsx              # Header with logo, wallet, themes
│   ├── HeroSection.tsx         # Landing section
│   ├── AppSection.tsx          # DCA application
│   ├── InvestmentInput.tsx     # Custom input (copy provided file)
│   ├── WalletButton.tsx        # Wallet button with dropdown
│   └── ThemeToggle.tsx         # Theme switcher
├── hooks/
│   ├── useLocalStorage.ts      # Hook for localStorage
│   └── useDCAStrategy.ts       # Hook for DCA logic
├── lib/
│   ├── utils.ts                # shadcn utilities (already exists)
│   ├── wagmi.ts                # Wagmi configuration
│   └── constants.ts            # Project constants
└── types/
    └── index.ts                # TypeScript types
```

## Tasks for Claude Code:

1. **Setup providers.tsx** with Wagmi, QueryClient, ThemeProvider and AppKit configuration
2. **Create layout.tsx** with Header component and Sonner Toaster
3. **Setup wagmi.ts** configuration for Ethereum mainnet with WalletConnect
4. **Create main page.tsx** with smooth slide animations between HeroSection and AppSection
5. **Build Header component** with logo, theme toggle, and wallet connection dropdown
6. **Create component stubs** for HeroSection, AppSection, WalletButton, ThemeToggle
7. **Copy provided InvestmentInput.tsx** to components folder
8. **Add TypeScript types** in types/index.ts for DCA strategy, transactions, etc.
9. **Create constants.ts** with default values and project settings
10. **Setup basic hooks** for localStorage and DCA strategy management

## Design Requirements:
- Minimalist design with 3 theme support (system/light/dark)
- Slide + opacity animations between sections
- Header with wallet dropdown (copy address, disconnect, theme switch)
- Use Sonner for toast notifications
- Responsive design with mobile support

## Technical Requirements:
- Strict TypeScript typing for all components
- JSDoc comments for all exported functions
- Error handling for all Web3 operations
- Loading states for async operations
- localStorage persistence for user data

## Environment Setup:
- Create .env.local with NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
- Project must run without errors after completion

## Next Prompt:
Detailed implementation of HeroSection, AppSection with InvestmentInput integration, metrics cards, and transaction history table.