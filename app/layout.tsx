import { Geist_Mono, Raleway, Crimson_Pro } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/navbar"

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" })
const crimson = Crimson_Pro({ subsets: ["latin"], variable: "--font-serif" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        raleway.variable,
        crimson.variable
      )}
    >
      <body
        className="relative min-h-screen bg-cover bg-center bg-no-repeat flex flex-col font-sans"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
