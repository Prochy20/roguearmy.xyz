import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'
import { PointCard } from './PointCard'
import {
  MOCK_NEXT_SUGGESTIONS,
  MOCK_POINT,
  MOCK_REAR_GUARD,
  MOCK_RELIEVED_OP,
  MOCK_SUGGESTIONS,
} from './_mock'

const meta = {
  title: 'Components/Community/Leaderboard/Formation/PointCard',
  component: PointCard,
  args: {
    onDesignate: fn(),
    onConfirmSuggested: fn(),
    onDismissSuggested: fn(),
    onOpenRoster: fn(),
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof PointCard>

export default meta
type Story = StoryObj<typeof meta>

export const Standard: Story = {
  args: {
    state: {
      kind: 'standard',
      point: MOCK_POINT,
      gap: 230,
      designatedAgo: '4D 12H',
      pointLevelLabel: 'OPERATOR',
      suggestions: MOCK_SUGGESTIONS,
      rosterCountAbove: 33,
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Point operative name renders', async () => {
      await expect(canvas.getAllByText(MOCK_POINT.displayName).length).toBeGreaterThan(0)
    })
  },
}

export const Suggest: Story = {
  args: {
    state: {
      kind: 'suggest',
      suggested: MOCK_POINT,
      gap: 230,
      suggestedLevelLabel: 'OPERATOR',
      rosterCountAbove: 33,
    },
  },
}

export const Relieved: Story = {
  args: {
    state: {
      kind: 'relieved',
      relievedOp: MOCK_RELIEVED_OP,
      rankDelta: 3,
      relievedAgo: '2H AGO',
      callerXp: 13000,
      suggestions: MOCK_NEXT_SUGGESTIONS,
      rosterCountAbove: 30,
    },
  },
}

export const Top: Story = {
  args: {
    state: {
      kind: 'top',
      rearGuard: MOCK_REAR_GUARD,
      rearGap: 5110,
      rearGuardLevelLabel: 'OPERATOR',
    },
  },
}

export const Unranked: Story = {
  args: { state: { kind: 'unranked' } },
}
