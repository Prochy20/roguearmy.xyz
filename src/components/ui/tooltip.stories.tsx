import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Button } from './button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

interface TooltipDemoProps {
  accent: 'green' | 'cyan' | 'magenta'
  label: string
  tip: string
}

function TooltipDemo({ accent, label, tip }: TooltipDemoProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">{label}</Button>
        </TooltipTrigger>
        <TooltipContent accent={accent}>{tip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const meta = {
  title: 'Components/UI/Tooltip',
  component: TooltipDemo,
  argTypes: {
    accent: { control: 'inline-radio', options: ['green', 'cyan', 'magenta'] },
    label: { control: 'text' },
    tip: { control: 'text' },
  },
  args: {
    accent: 'green',
    label: 'Hover me',
    tip: '// system online',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TooltipDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Hover trigger reveals tooltip (portaled to body)', async () => {
      const trigger = canvas.getByRole('button', { name: args.label })
      await userEvent.hover(trigger)
      const tips = await within(document.body).findAllByText(args.tip)
      await expect(tips.length).toBeGreaterThan(0)
    })
  },
}

export const Accents: Story = {
  args: { label: '', tip: '' },
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <TooltipDemo accent="green" label="Green" tip="// primary signal" />
      <TooltipDemo accent="cyan" label="Cyan" tip="// information" />
      <TooltipDemo accent="magenta" label="Magenta" tip="// warning" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All three accent triggers render', async () => {
      await expect(canvas.getAllByRole('button')).toHaveLength(3)
    })
  },
}
