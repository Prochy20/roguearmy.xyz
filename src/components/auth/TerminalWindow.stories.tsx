import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { TerminalWindow } from './TerminalWindow'

const meta = {
  title: 'Components/Auth/TerminalWindow',
  component: TerminalWindow,
  argTypes: {
    showTrafficLights: { control: 'boolean' },
    showFooter: { control: 'boolean' },
    title: { control: 'text' },
    footerText: { control: 'text' },
  },
  args: {
    title: 'TERMINAL',
    showTrafficLights: true,
    showFooter: true,
    footerText: 'SECURE CONNECTION',
    children: (
      <pre className="font-mono text-sm text-rga-green">{`> identity verified
> awaiting credentials...`}</pre>
    ),
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 540 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TerminalWindow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Title + footer text render in the chrome', async () => {
      await expect(canvas.getByText(args.title!)).toBeInTheDocument()
      await expect(canvas.getByText(args.footerText!)).toBeInTheDocument()
    })
  },
}

export const NoFooter: Story = { args: { showFooter: false } }
export const NoTrafficLights: Story = { args: { showTrafficLights: false } }
