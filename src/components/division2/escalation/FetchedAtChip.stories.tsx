import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { FetchedAtChip } from './FetchedAtChip'

const MS_AGO = (ms: number) => new Date(Date.now() - ms).toISOString()

const meta = {
  title: 'Components/Division2/Escalation/FetchedAtChip',
  component: FetchedAtChip,
  argTypes: { fetchedAt: { control: 'text' } },
  args: { fetchedAt: MS_AGO(45 * 60 * 1000) },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FetchedAtChip>

export default meta
type Story = StoryObj<typeof meta>

export const Fresh: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders a "LAST SYNC" line', async () => {
      await expect(canvas.getByText(/last sync/i)).toBeInTheDocument()
    })
  },
}

export const Stale: Story = {
  args: { fetchedAt: MS_AGO(72 * 60 * 60 * 1000) },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Past the staleness threshold the chip says "MAY BE STALE"', async () => {
      await expect(canvas.getByText(/may be stale/i)).toBeInTheDocument()
    })
  },
}

export const Unknown: Story = {
  args: { fetchedAt: 'not-a-date' },
}
