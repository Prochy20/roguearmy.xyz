import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import type { StaffAccent } from './types'
import { StaffPortrait } from './StaffPortrait'

const ALL_ACCENTS: StaffAccent[] = ['green', 'cyan', 'magenta', 'dev', 'admin', 'mod']

const meta = {
  title: 'Components/Community/Staff/StaffPortrait',
  component: StaffPortrait,
  argTypes: {
    accent: { control: 'select', options: ALL_ACCENTS },
    size: { control: 'inline-radio', options: ['full', 'badge'] },
  },
  args: {
    displayName: 'ORACLE',
    avatarUrl: null,
    accent: 'cyan',
    size: 'badge',
  },
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 200, height: 200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StaffPortrait>

export default meta
type Story = StoryObj<typeof meta>

export const InitialsFallback: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('No avatar → renders the displayName initials', async () => {
      // initialsOf('ORACLE') → 'OR' (single-word: first two chars).
      await expect(canvas.getByText('OR')).toBeInTheDocument()
    })
  },
}

export const FullSize: Story = { args: { size: 'full' } }

export const AllAccents: Story = {
  parameters: { layout: 'padded' },
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 200px)', gap: '1.5rem' }}>
      {ALL_ACCENTS.map((accent) => (
        <div key={accent} style={{ width: 200, height: 200 }}>
          <StaffPortrait displayName={accent.toUpperCase()} avatarUrl={null} accent={accent} size="badge" />
        </div>
      ))}
    </div>
  ),
}
