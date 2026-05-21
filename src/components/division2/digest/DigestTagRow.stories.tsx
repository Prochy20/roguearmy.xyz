import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DigestTagRow } from './DigestTagRow'

const meta = {
  title: 'Components/Division2/Digest/DigestTagRow',
  component: DigestTagRow,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
    frequency: { control: 'inline-radio', options: ['weekly', 'daily'] },
    isMembersOnly: { control: 'boolean' },
  },
  args: { accent: 'cyan', frequency: 'weekly', isMembersOnly: false },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DigestTagRow>

export default meta
type Story = StoryObj<typeof meta>

export const Public: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Public + WEEKLY tags render together', async () => {
      await expect(canvas.getByText(/^PUBLIC$/)).toBeInTheDocument()
      await expect(canvas.getByText(/^WEEKLY$/)).toBeInTheDocument()
    })
  },
}

export const MembersOnly: Story = { args: { isMembersOnly: true } }
export const Daily: Story = { args: { accent: 'mod', frequency: 'daily' } }
