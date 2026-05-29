import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SectionHeader } from './SectionHeader'

const meta = {
  title: 'Components/Me/SectionHeader',
  component: SectionHeader,
  args: {
    num: '02',
    eyebrow: 'ROLE LATTICE',
    kicker: '// resolved from upstream',
    title: 'ASSIGNMENTS',
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof SectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Section number, eyebrow, kicker, and title render', async () => {
      await expect(canvas.getByText('SEC_02')).toBeInTheDocument()
      await expect(canvas.getByText('ROLE LATTICE')).toBeInTheDocument()
      await expect(canvas.getByText('// resolved from upstream')).toBeInTheDocument()
      await expect(canvas.getByText('ASSIGNMENTS')).toBeInTheDocument()
    })
  },
}

export const LongTitle: Story = {
  args: {
    num: '03',
    eyebrow: 'INTEL FEED',
    kicker: '// latest community reports',
    title: 'OPERATIONAL DECLASSIFIED BRIEFINGS',
  },
}

export const OfflineKicker: Story = {
  args: {
    num: '02',
    eyebrow: 'ROLE LATTICE',
    kicker: '// resolution failed',
    title: 'ASSIGNMENTS',
  },
}
