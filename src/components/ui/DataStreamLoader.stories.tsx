import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { DataStreamLoader } from './DataStreamLoader'

const meta = {
  title: 'Components/UI/DataStreamLoader',
  component: DataStreamLoader,
  argTypes: {
    lines: { control: { type: 'number', min: 1, max: 12 } },
    statusMessage: { control: 'text' },
  },
  args: {
    lines: 7,
    statusMessage: 'RETRIEVING TRANSMISSION',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataStreamLoader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Status message renders + loader exposes aria-busy', async () => {
      const region = canvas.getByRole('status')
      await expect(region).toHaveAttribute('aria-busy', 'true')
      await expect(canvas.getByText(new RegExp(args.statusMessage!, 'i'))).toBeInTheDocument()
    })
  },
}

export const Shorter: Story = { args: { lines: 3 } }
export const CustomMessage: Story = { args: { statusMessage: 'DECRYPTING DOSSIER' } }
