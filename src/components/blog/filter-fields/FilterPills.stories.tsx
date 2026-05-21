import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { FilterPills } from './FilterPills'

interface SingleDemoProps {
  initial: string | null
  onChange: (value: string | null) => void
}

function SinglePillsDemo({ initial, onChange }: SingleDemoProps) {
  const [value, setValue] = useState<string | null>(initial)
  return (
    <FilterPills
      mode="single"
      label="Read status"
      value={value}
      onChange={(v) => {
        setValue(v)
        onChange(v)
      }}
      options={[
        { value: null, label: 'All' },
        { value: 'unread', label: 'Unread' },
        { value: 'in_progress', label: 'In progress' },
        { value: 'completed', label: 'Completed' },
      ]}
    />
  )
}

const meta = {
  title: 'Components/Blog/FilterFields/FilterPills',
  component: SinglePillsDemo,
  args: { initial: null, onChange: fn() },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SinglePillsDemo>

export default meta
type Story = StoryObj<typeof meta>

export const SingleSelect: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Clicking "Completed" fires onChange with that value', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /completed/i }))
      await expect(args.onChange).toHaveBeenCalledWith('completed')
    })
  },
}
