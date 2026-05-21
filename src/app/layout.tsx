import "@/app/globals.css"
import { Black_Ops_One, JetBrains_Mono, Outfit } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Self-hosted via next/font: no Google CSS round-trip, automatic preload of
// the body font, and size-adjust overrides eliminate the fallback-swap CLS
// the previous `@import` setup couldn't avoid. Variables are consumed by the
// `--font-{display,mono,body}` Tailwind tokens in globals.css.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  // Preloaded only when actually used (terminal UI), saves cold-load bytes.
  preload: false,
})

const blackOpsOne = Black_Ops_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-black-ops-one",
  display: "swap",
  // Fallback for Hanson Bold; loaded lazily.
  preload: false,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${outfit.variable} ${jetbrainsMono.variable} ${blackOpsOne.variable}`}
    >
      <body className="min-h-screen bg-void text-foreground font-body antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
