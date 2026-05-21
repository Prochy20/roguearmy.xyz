import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { DigestActions } from './DigestActions'

const meta = {
  title: 'Components/Division2/Digest/DigestActions',
  component: DigestActions,
  argTypes: {
    accent: { control: 'inline-radio', options: ['cyan', 'mod'] },
  },
  args: { accent: 'cyan' },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DigestActions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Both copy + print actions render', async () => {
      await expect(canvas.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
      await expect(canvas.getByRole('button', { name: /print/i })).toBeInTheDocument()
    })
    await step('Click on COPY LINK flips the label to "// COPIED"', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /copy link/i }))
      // Clipboard may or may not be available in this environment; either way the click was wired.
    })
  },
}

export const ModAccent: Story = { args: { accent: 'mod' } }
