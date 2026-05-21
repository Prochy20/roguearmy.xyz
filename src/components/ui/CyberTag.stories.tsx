import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'
import { CyberTag } from './CyberCorners'

const ALL_COLORS = [
  'green',
  'cyan',
  'magenta',
  'orange',
  'red',
  'gray',
  'dev',
  'admin',
  'mod',
  'source-youtube',
  'source-reddit',
  'source-ubisoft',
] as const

const meta = {
  title: 'Components/UI/CyberTag',
  component: CyberTag,
  argTypes: {
    color: { control: 'select', options: ALL_COLORS },
    children: { control: 'text' },
  },
  args: {
    color: 'green',
    children: 'ACTIVE',
  },
} satisfies Meta<typeof CyberTag>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'HOVER ME' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const tag = canvas.getByText('HOVER ME')
    await step('Hover triggers bracket-shift animation', async () => {
      await userEvent.hover(tag.parentElement ?? tag)
    })
  },
}

export const LongLabel: Story = {
  args: { children: 'MULTI WORD LABEL' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const tag = canvas.getByText('MULTI WORD LABEL')
    await step('Hover on a long-label tag', async () => {
      await userEvent.hover(tag.parentElement ?? tag)
    })
  },
}

export const AllColors: Story = {
  args: { children: null },
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      {ALL_COLORS.map((c) => (
        <CyberTag key={c} color={c}>
          {c.toUpperCase()}
        </CyberTag>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step(`All ${ALL_COLORS.length} colour variants render`, async () => {
      for (const color of ALL_COLORS) {
        await expect(canvas.getByText(color.toUpperCase())).toBeInTheDocument()
      }
    })
  },
}
