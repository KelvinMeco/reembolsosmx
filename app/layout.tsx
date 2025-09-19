import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sistema de Reembolsos",
  description: "Sistema de Gestión de Reembolsos",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${GeistSans.className} antialiased bg-gray-100 min-h-screen`}>{children}</body>
    </html>
  )
}
