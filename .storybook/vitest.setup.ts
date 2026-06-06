import { beforeAll } from 'vitest'
import { setProjectAnnotations } from '@storybook/nextjs-vite'
import preview from './preview'

const project = setProjectAnnotations([preview])

// Silence Next.js Image hints that are false-positives in the Storybook
// Vitest environment. The framework's stubbed loader handles width but uses
// destructuring, which trips next/image's `loader.length === 1` legacy-loader
// heuristic. The other hints (fill+sizes, priority/LCP) are production
// performance nudges that don't apply when the test harness is the consumer.
const SUPPRESSED = [
  /loader.+property that does not implement width/i,
  /has "fill" but is missing "sizes"/i,
  /was detected as the Largest Contentful Paint/i,
  /Please ensure that the container has a non-static position/i,
]

const originalError = console.error
console.error = (...args: unknown[]) => {
  const msg = String(args[0] ?? '')
  if (SUPPRESSED.some((re) => re.test(msg))) return
  originalError(...args)
}

const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
  const msg = String(args[0] ?? '')
  if (SUPPRESSED.some((re) => re.test(msg))) return
  originalWarn(...args)
}

beforeAll(project.beforeAll)
