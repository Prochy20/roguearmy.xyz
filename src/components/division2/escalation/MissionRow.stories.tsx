import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { MissionRow } from './MissionRow'
import { MOCK_DAY_LOOT_BY_POSITION, MOCK_MISSIONS } from '../_mock'

const meta = {
  title: 'Components/Division2/Escalation/MissionRow',
  component: MissionRow,
  args: {
    missions: MOCK_MISSIONS,
    dayLootByPosition: MOCK_DAY_LOOT_BY_POSITION,
    selectedDay: '2026-05-21',
    sectionLabel: '// ACTIVE MISSIONS',
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1080 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MissionRow>

export default meta
type Story = StoryObj<typeof meta>

export const WithDayLoot: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('All 5 mission names render', async () => {
      // Mission names appear in both the day-card slot and the active row,
      // so getAllByText is the right query here.
      for (const mission of MOCK_MISSIONS) {
        await expect(canvas.getAllByText(mission.name).length).toBeGreaterThan(0)
      }
    })
  },
}

export const PendingUpstream: Story = {
  args: { dayLootByPosition: new Map() },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Without loot, every row shows "PENDING UPSTREAM"', async () => {
      await expect(canvas.getAllByText(/pending upstream/i).length).toBeGreaterThan(0)
    })
  },
}

export const Empty: Story = {
  args: { missions: [] },
  play: async ({ canvasElement, step }) => {
    await step('Empty mission list returns null — no chrome', async () => {
      // canvasElement > globalFontDecorator > localMaxWidthDecorator > (null).
      // Drill two levels to assert the innermost wrapper has zero children.
      await expect(
        canvasElement.firstElementChild?.firstElementChild?.children.length ?? -1,
      ).toBe(0)
    })
  },
}
