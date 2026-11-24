import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
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

export function generateMetadata(): Metadata {
  return {
    title: readAppConfig().appName,
    description: "Aprenda a integrar o Google Wallet e gere passes com as suas credenciais ou em modo demonstração.",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
