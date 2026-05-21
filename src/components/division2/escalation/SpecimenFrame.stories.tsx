import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { SpecimenFrame } from './SpecimenFrame'

const meta = {
  title: 'Components/Division2/Escalation/SpecimenFrame',
  component: SpecimenFrame,
  argTypes: {
    color: { control: 'inline-radio', options: ['cyan', 'magenta', 'mod'] },
    pending: { control: 'boolean' },
    square: { control: 'boolean' },
    padPx: { control: { type: 'number', min: 0, max: 48 } },
  },
  args: {
    color: 'mod',
    pending: false,
    square: true,
    padPx: 20,
    children: (
      <span className="font-mono text-2xl tracking-[0.3em] uppercase text-rga-mod">SHOTGUN</span>
    ),
  },
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 220, height: 220 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpecimenFrame>

export default meta
type Story = StoryObj<typeof meta>

export const Filled: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Content slot renders the supplied label', async () => {
      await expect(canvas.getByText('SHOTGUN')).toBeInTheDocument()
    })
  },
}

export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Pending state renders the // PENDING placeholder', async () => {
      await expect(canvas.getByText(/pending/i)).toBeInTheDocument()
    })
  },
}

export const Cyan: Story = { args: { color: 'cyan' } }
export const Magenta: Story = { args: { color: 'magenta' } }
