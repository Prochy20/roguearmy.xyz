import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { ProgressionBand, type AshleyLevel } from './ProgressionBand'

const DEFAULT_LEVEL: AshleyLevel = {
  level: 14,
  levelLabel: 'VETERAN',
  xp: 42_180,
  progress: 0.6,
  xpToNextLevel: 4_320,
  nextLevel: { level: 15, xpRequired: 50_000, label: 'ELITE' },
}

const MAX_LEVEL: AshleyLevel = {
  level: 50,
  levelLabel: 'ASCENDED',
  xp: 999_999,
  progress: 1,
  xpToNextLevel: null,
  nextLevel: null,
}

const meta = {
  title: 'Components/Me/ProgressionBand',
  component: ProgressionBand,
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof ProgressionBand>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { level: { ok: true, data: DEFAULT_LEVEL } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Eyebrows render', async () => {
      await expect(canvas.getByText('CURRENT LEVEL')).toBeInTheDocument()
      await expect(canvas.getByText('TOTAL XP')).toBeInTheDocument()
    })
    await step('Brief and CTA render', async () => {
      await expect(canvas.getByText('// brief')).toBeInTheDocument()
      await expect(canvas.getByText('OPEN FORMATION')).toBeInTheDocument()
    })
  },
}

export const MaxLevel: Story = {
  args: { level: { ok: true, data: MAX_LEVEL } },
}

export const FailUnauth: Story = {
  args: {
    level: {
      ok: false,
      error: { code: 'unauthenticated', status: 401, message: 'session expired' },
    },
  },
}
