import "@/app/globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { fontVariables } from "./fonts"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${fontVariables}`}>
      <body className="min-h-screen bg-void text-foreground font-body antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
