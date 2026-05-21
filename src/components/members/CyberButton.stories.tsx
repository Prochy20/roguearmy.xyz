import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { CyberButton } from './CyberButton'

const meta = {
  title: 'Components/Members/CyberButton',
  component: CyberButton,
  argTypes: {
    color: { control: 'inline-radio', options: ['green', 'cyan', 'magenta', 'gray'] },
  },
  args: {
    children: 'ENGAGE',
    color: 'green',
    onClick: fn(),
  },
  parameters: { layout: 'centered', nextjs: { appDirectory: true } },
} satisfies Meta<typeof CyberButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Click fires onClick exactly once', async () => {
      await userEvent.click(canvas.getByRole('button'))
      await expect(args.onClick).toHaveBeenCalledTimes(1)
    })
  },
}

export const WithIcons: Story = {
  args: {
    children: 'PROCEED',
    iconRight: <ArrowRight className="w-4 h-4" />,
  },
}

export const AsInternalLink: Story = {
  args: {
    href: '/members',
    onClick: undefined,
    children: 'OPEN DOSSIER',
  } as never,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders as an <a> with internal href', async () => {
      const link = canvas.getByRole('link', { name: /open dossier/i })
      await expect(link).toHaveAttribute('href', '/members')
      await expect(link).not.toHaveAttribute('target')
    })
  },
}

export const AsExternalLink: Story = {
  args: {
    href: 'https://discord.gg/example',
    external: true,
    onClick: undefined,
    iconRight: <ExternalLink className="w-4 h-4" />,
    children: 'OPEN DISCORD',
  } as never,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('External link uses target=_blank + rel=noopener', async () => {
      const link = canvas.getByRole('link', { name: /open discord/i })
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    })
  },
}

export const Colors: Story = {
  args: { children: null as never },
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {(['green', 'cyan', 'magenta', 'gray'] as const).map((color) => (
        <CyberButton key={color} color={color} onClick={() => {}}>
          {color.toUpperCase()}
        </CyberButton>
      ))}
    </div>
  ),
}
