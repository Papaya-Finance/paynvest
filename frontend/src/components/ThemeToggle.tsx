'use client'

import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

/**
 * Theme toggle component with system, light, and dark theme support
 * Includes smooth transitions and accessibility features
 */
export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const themes = [
    {
      name: 'Light',
      value: 'light',
      icon: Sun,
      description: 'Light theme'
    },
    {
      name: 'Dark', 
      value: 'dark',
      icon: Moon,
      description: 'Dark theme'
    },
    {
      name: 'System',
      value: 'system', 
      icon: Monitor,
      description: 'System theme'
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="relative overflow-hidden transition-colors hover:bg-muted/80"
          aria-label="Toggle theme"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isActive = theme === themeOption.value
          
          return (
            <DropdownMenuItem 
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className="cursor-pointer focus:bg-muted/50"
              aria-label={themeOption.description}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{themeOption.name}</span>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}