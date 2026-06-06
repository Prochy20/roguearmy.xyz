import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { FormationPanel } from './FormationPanel'
import { MOCK_ME, MOCK_ROSTER, MOCK_SUGGESTIONS, MOCK_TOP3 } from './_mock'

const meta = {
  title: 'Components/Community/Leaderboard/Formation/FormationPanel',
  component: FormationPanel,
  args: {
    myEntry: MOCK_ROSTER.find((r) => r.rank === MOCK_ME.rank) ?? MOCK_ROSTER[MOCK_ME.rank - 1],
    myLevelData: {
      level: MOCK_ME.level,
      levelLabel: MOCK_ME.levelLabel,
      progress: MOCK_ME.progress,
      xpToNextLevel: MOCK_ME.xpToNextLevel,
      nextLevel: MOCK_ME.nextLevel,
      nextLevelLabel: MOCK_ME.nextLevelLabel,
    },
    topThree: MOCK_TOP3,
    closeAbove: MOCK_SUGGESTIONS,
    totalOps: 412,
    rosterCountAbove: 46,
    showBoot: false,
    operativeName: 'axis',
  },
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof FormationPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Ranked: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Formation block + tier band render together', async () => {
      await expect(canvas.getAllByText(/formation hud/i).length).toBeGreaterThan(0)
      // "TIER" appears in the tier band, in section labels, and in tier-name
      // sub-strings — multiple matches are expected.
      await expect(canvas.getAllByText(/tier/i).length).toBeGreaterThan(0)
    })
  },
}

export const Unranked: Story = {
  args: { myEntry: null, myLevelData: null },
}

export const TopOfBoard: Story = {
  args: {
    myEntry: MOCK_TOP3[0],
    closeAbove: [],
  },
}
