import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { FilterMultiDropdown, type MultiDropdownOption } from './FilterMultiDropdown'

const OPTIONS: MultiDropdownOption[] = [
  { value: 'div2', label: 'The Division 2', tint: 'orange' },
  { value: 'sot', label: 'Sea of Thieves', tint: 'cyan' },
  { value: 'helldivers', label: 'Helldivers 2', tint: 'magenta' },
  { value: 'destiny', label: 'Destiny 2' },
]

interface DemoProps {
  initial: string[]
  onChange: (values: string[]) => void
}

function MultiDemo({ initial, onChange }: DemoProps) {
  const [values, setValues] = useState<string[]>(initial)
  const [open, setOpen] = useState(true)
  return (
    <FilterMultiDropdown
      label="Games"
      values={values}
      onChange={(v) => {
        setValues(v)
        onChange(v)
      }}
      options={OPTIONS}
      placeholder="Pick games"
      isOpen={open}
      onToggle={() => setOpen((v) => !v)}
    />
  )
}

const meta = {
  title: 'Components/Blog/FilterFields/FilterMultiDropdown',
  component: MultiDemo,
  args: { initial: [], onChange: fn() },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultiDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Selecting an option fires onChange with the value', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /the division 2/i }))
      await expect(args.onChange).toHaveBeenCalledWith(['div2'])
    })
  },
}

export const PreSelected: Story = {
  args: { initial: ['div2', 'sot'] },
}
