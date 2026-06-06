import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StaffRosterEmpty } from './StaffRosterEmpty'

const meta = {
  title: 'Components/Community/Staff/StaffRosterEmpty',
  component: StaffRosterEmpty,
  args: { content: undefined },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StaffRosterEmpty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Default heading + pill render when no content is supplied', async () => {
      await expect(canvas.getByText(/manifest pending compilation/i)).toBeInTheDocument()
      await expect(canvas.getByText(/no records on file/i)).toBeInTheDocument()
    })
  },
}

export const Custom: Story = {
  args: {
    content: {
      pill: '// SYNCING',
      heading: 'CACHE SWEEP IN PROGRESS',
      body: 'Roster is being recompiled. Refresh once the sync stamp updates.',
      hint: '// HOLD · 30S',
    },
  },
}
