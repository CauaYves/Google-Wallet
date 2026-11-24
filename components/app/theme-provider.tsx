"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type * as React from "react"

/**
 * Tema claro, escuro ou do sistema. O next-themes põe a classe `dark` no <html> com um script
 * no <head>, antes da primeira pintura, então a página não pisca no tema errado. A escolha
 * fica no localStorage do navegador; sem escolha, vale o tema do sistema.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
