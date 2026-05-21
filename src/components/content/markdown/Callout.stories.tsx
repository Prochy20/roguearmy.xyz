import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { Callout } from './Callout'

const ALL_TYPES = ['info', 'warning', 'tip', 'success', 'danger', 'error', 'note'] as const

const meta = {
  title: 'Components/Content/Markdown/Callout',
  component: Callout,
  argTypes: {
    type: { control: 'select', options: ALL_TYPES },
    title: { control: 'text' },
  },
  args: {
    type: 'info',
    children: 'Ashley monitors this channel every 60s. Latency over 200ms triggers the failover.',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Default label is the type capitalized', async () => {
      await expect(canvas.getByText(/^info$/i)).toBeInTheDocument()
    })
  },
}

export const CustomTitle: Story = {
  args: { type: 'warning', title: 'OPERATOR ADVISORY' },
}

export const Gallery: Story = {
  args: { type: 'info', children: null },
  parameters: { layout: 'padded' },
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 720 }}>
      {ALL_TYPES.map((type) => (
        <Callout key={type} type={type}>
          {`Body copy for the ${type.toUpperCase()} variant — describes the channel state.`}
        </Callout>
      ))}
    </div>
  ),
}
