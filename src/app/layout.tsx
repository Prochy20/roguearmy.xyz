import "@/app/globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"

/**
 * Root layout - minimal wrapper required by Next.js 15.
 * Route group layouts handle the actual page structure.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-void text-foreground font-body antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
