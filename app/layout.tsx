import { Geist, Geist_Mono, Raleway } from "next/font/google"
import Image from "next/image"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'})

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
      className={cn("antialiased", fontMono.variable, "font-sans", raleway.variable)}
    >
      <body className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <Image
            src="/background.jpg"
            alt="Background"
            fill
            priority
            className="object-cover object-center"
            quality={100}
          />
        </div>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
