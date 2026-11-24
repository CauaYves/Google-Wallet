import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/app/theme-provider"
import { readAppConfig } from "@/lib/config"
import "./globals.css"
import "./theme.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// Só nos títulos. O texto corrido continua na Geist, a fonte do Mosaico.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
})

export function generateMetadata(): Metadata {
  return {
    title: readAppConfig().appName,
    description: "Aprenda a integrar o Google Wallet e gere passes com as suas credenciais ou em modo demonstração.",
  }
}

export const viewport: Viewport = {
  // Avisa o navegador, antes do CSS, que a página tem os dois temas.
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: a classe do tema é posta no <html> antes da hidratação.
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
