import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { StatRibbon } from './StatRibbon'

const meta = {
  title: 'Components/UI/StatRibbon',
  component: StatRibbon,
  args: {
    prefix: '// SYNC',
    fields: [
      { label: 'level', value: '27', accent: 'green' },
      { label: 'xp', value: '42,100', accent: 'cyan' },
      { label: 'rank', value: '#2', accent: 'mod' },
    ],
    pill: { text: 'ONLINE', ok: true, accent: 'green' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StatRibbon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Renders the prefix, all field values and status pill', async () => {
      await expect(canvas.getByText('// SYNC')).toBeInTheDocument()
      await expect(canvas.getByText('27')).toBeInTheDocument()
      await expect(canvas.getByText('ONLINE')).toBeInTheDocument()
    })
  },
}

export const StatusFailing: Story = {
  args: {
    prefix: '// SYNC',
    fields: [{ label: 'last seen', value: '03:14:07 UTC' }],
    pill: { text: 'STALE', ok: false, accent: 'magenta' },
  },
}

export const ManyFields: Story = {
  args: {
    prefix: '// OPERATIVE',
    fields: [
      { label: 'tier', value: 'OPERATOR', accent: 'green' },
      { label: 'level', value: '27', accent: 'green' },
      { label: 'xp', value: '42,100', accent: 'cyan' },
      { label: 'rank', value: '#2', accent: 'mod' },
      { label: 'streak', value: '14d', accent: 'cyan' },
    ],
    pill: { text: 'SYNCED', ok: true, accent: 'green' },
  },
}
