import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { FilterSingleDropdown, type SingleDropdownOption } from './FilterSingleDropdown'

const OPTIONS: SingleDropdownOption[] = [
  { value: null, label: 'All series', count: 18 },
  { value: 'operator-onboarding', label: 'Operator Onboarding', count: 5 },
  { value: 'incident-reports', label: 'Incident Reports', count: 6 },
  { value: 'community-postmortems', label: 'Community Postmortems', count: 3 },
]

interface DemoProps {
  initial: string | null
  onChange: (value: string | null) => void
}

function SingleDemo({ initial, onChange }: DemoProps) {
  const [value, setValue] = useState<string | null>(initial)
  const [open, setOpen] = useState(true)
  return (
    <FilterSingleDropdown
      label="Series"
      value={value}
      onChange={(v) => {
        setValue(v)
        onChange(v)
      }}
      options={OPTIONS}
      isOpen={open}
      onToggle={() => setOpen((v) => !v)}
    />
  )
}

const meta = {
  title: 'Components/Blog/FilterFields/FilterSingleDropdown',
  component: SingleDemo,
  args: { initial: null, onChange: fn() },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SingleDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Selecting "Operator Onboarding" fires onChange', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /operator onboarding/i }))
      await expect(args.onChange).toHaveBeenCalledWith('operator-onboarding')
    })
  },
}

export const PreSelected: Story = {
  args: { initial: 'incident-reports' },
}
