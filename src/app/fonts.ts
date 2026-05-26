import { Black_Ops_One, JetBrains_Mono, Outfit } from 'next/font/google'
import localFont from 'next/font/local'

export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
})

export const blackOpsOne = Black_Ops_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-black-ops-one',
  display: 'swap',
  preload: false,
})

export const hansonBold = localFont({
  // Patched build with Czech/Slovak diacritics composed from base glyphs + a
  // drawn caron/ring. Regenerate via `python3 scripts/patch-hanson-czech.py`
  // after replacing the source Hanson-Bold.otf.
  src: '../../public/fonts/Hanson-Bold-Czech.otf',
  weight: '700',
  style: 'normal',
  variable: '--font-hanson-bold',
  display: 'swap',
})

export const fontVariables = `${outfit.variable} ${jetbrainsMono.variable} ${blackOpsOne.variable} ${hansonBold.variable}`
