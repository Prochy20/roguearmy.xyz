import type { GlobalConfig, Field } from 'payload'
import { publicRead } from '@/access'

const TONE_OPTIONS = [
  { label: 'Green', value: 'green' },
  { label: 'Cyan', value: 'cyan' },
  { label: 'Magenta', value: 'magenta' },
] as const

const ICON_OPTIONS = [
  { label: 'Shield', value: 'shield' },
  { label: 'Users', value: 'users' },
  { label: 'Heart', value: 'heart' },
  { label: 'Target', value: 'target' },
  { label: 'Flag', value: 'flag' },
  { label: 'Swords', value: 'swords' },
  { label: 'Compass', value: 'compass' },
  { label: 'Crown', value: 'crown' },
  { label: 'Zap', value: 'zap' },
  { label: 'Radio', value: 'radio' },
] as const

/**
 * CTA pair (label + href) laid out in a row. Used wherever a section has a
 * button slot. The component decides external/internal rendering from the
 * href shape — anchors (#…), absolute URLs (https://…), and path links (/…)
 * all coexist on this page, so we don't store an explicit `external` flag.
 */
function ctaFields(defaults: { label: string; href: string }): Field[] {
  return [
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          defaultValue: defaults.label,
          admin: { width: '50%' },
        },
        {
          name: 'href',
          type: 'text',
          required: true,
          defaultValue: defaults.href,
          admin: {
            width: '50%',
            description: 'Absolute URL, /path, or #anchor.',
          },
        },
      ],
    },
  ]
}

const tonePillFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'tone',
        type: 'select',
        required: true,
        defaultValue: 'green',
        options: [...TONE_OPTIONS],
        admin: { width: '30%' },
      },
      {
        name: 'label',
        type: 'text',
        required: true,
        admin: { width: '70%' },
      },
    ],
  },
]

/**
 * All editorial copy + structural lists for the /community page. Every field
 * carries a defaultValue matching the previously-hardcoded copy so the page
 * renders correctly on first deploy without anyone touching the admin.
 *
 * Live stats (members, joined14d, voice, messages, generatedAt) stay on the
 * Ashley API — this global owns only the editorial frame around them. The
 * Hero's "live count" middle row falls back to SiteChrome.memberCountFloor
 * when Ashley is unreachable; no fallback string lives here.
 */
export const CommunityPage: GlobalConfig = {
  slug: 'community-page',
  access: {
    read: publicRead,
  },
  admin: {
    group: 'Identity',
    description:
      'All copy + content for the /community page. Live numbers come from Ashley.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─── HERO ──────────────────────────────────────────────────────────
        {
          name: 'hero',
          label: 'Hero',
          fields: [
            {
              name: 'kicker',
              type: 'text',
              defaultValue: '// CASUAL GAMING · ADULTS · SA · UK · EU',
              admin: { description: 'Mono kicker above the headline.' },
            },
            {
              name: 'breadcrumbLabel',
              type: 'text',
              defaultValue: 'Community',
              admin: { description: 'Trail label after RGA root in the sticky ribbon.' },
            },
            {
              type: 'collapsible',
              label: 'Snapshot Ribbon',
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ribbonLabelMembers',
                      type: 'text',
                      defaultValue: 'MEMBERS',
                      admin: { width: '33%' },
                    },
                    {
                      name: 'ribbonLabelJoined14d',
                      type: 'text',
                      defaultValue: 'JOINED · 14D',
                      admin: { width: '33%' },
                    },
                    {
                      name: 'ribbonLabelTaken',
                      type: 'text',
                      defaultValue: 'TAKEN',
                      admin: { width: '34%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ribbonPillLive',
                      type: 'text',
                      defaultValue: 'LIVE',
                      admin: {
                        width: '50%',
                        description: 'Pill text when Ashley is reachable.',
                      },
                    },
                    {
                      name: 'ribbonPillOffline',
                      type: 'text',
                      defaultValue: 'OFFLINE',
                      admin: {
                        width: '50%',
                        description: 'Pill text when Ashley is unreachable.',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'preLine',
              type: 'text',
              defaultValue: 'WE ARE',
              admin: { description: 'Headline first row. Live count renders between this and postLine.' },
            },
            {
              name: 'postLine',
              type: 'text',
              defaultValue: 'OPERATIVES',
              admin: { description: 'Headline third row.' },
            },
            {
              name: 'subline',
              type: 'textarea',
              defaultValue:
                'A casual gaming community for adults across South Africa, the UK, and Europe — together since 2019. No drama, no skill gates, no engagement metrics. Life’s stressful enough — your gaming shouldn’t be.',
              admin: { description: 'Paragraph under the headline.' },
            },
            {
              name: 'primaryCta',
              type: 'group',
              admin: { description: 'Discord CTA — rendered as a green CyberButton with Discord icon.' },
              fields: ctaFields({
                label: 'ENLIST · DISCORD',
                href: 'https://dc.roguearmy.xyz',
              }),
            },
            {
              name: 'secondaryCta',
              type: 'group',
              admin: {
                description: 'Inline text link — typically points to a #anchor on the page.',
              },
              fields: ctaFields({
                label: 'SEE THE NUMBERS',
                href: '#sec-01',
              }),
            },
          ],
        },

        // ─── PULL STRIP ────────────────────────────────────────────────────
        {
          name: 'pullStrip',
          label: 'Pull Strip',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Toggle the full-bleed quote band between Hero and Stats.' },
            },
            {
              name: 'quote',
              type: 'text',
              defaultValue: 'BEYOND RANDOM LOBBIES.',
              admin: { description: 'Large display-font quote.' },
            },
            {
              name: 'caption',
              type: 'text',
              defaultValue: '// QUALITY GAMING · QUALITY PEOPLE · SINCE 2019',
              admin: { description: 'Mono caption under the quote.' },
            },
          ],
        },

        // ─── STATS ─────────────────────────────────────────────────────────
        {
          name: 'stats',
          label: 'Stats',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Toggle the entire numbers section.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sectionNum',
                  type: 'text',
                  defaultValue: '01',
                  admin: { width: '20%', description: 'Section marker (e.g. "01").' },
                },
                {
                  name: 'sectionEyebrow',
                  type: 'text',
                  defaultValue: 'LIVE METRICS',
                  admin: { width: '40%' },
                },
                {
                  name: 'sectionTitle',
                  type: 'text',
                  defaultValue: 'BY THE NUMBERS',
                  admin: { width: '40%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'kickerLive',
                  type: 'text',
                  defaultValue: '// SNAPSHOT {time}',
                  admin: {
                    width: '50%',
                    description: 'Kicker shown when Ashley is up. `{time}` is replaced with HH:MM UTC.',
                  },
                },
                {
                  name: 'kickerOffline',
                  type: 'text',
                  defaultValue: '// SNAPSHOT UNAVAILABLE',
                  admin: {
                    width: '50%',
                    description: 'Kicker shown when Ashley is down (FailNote takes over the grid).',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Stat Cell Labels',
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'statLabelMembers',
                      type: 'text',
                      defaultValue: 'OPERATIVES',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'statLabelJoined14d',
                      type: 'text',
                      defaultValue: 'JOINED · LAST 14 DAYS',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'statLabelVoice',
                      type: 'text',
                      defaultValue: 'MINUTES IN VOICE',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'statLabelMessages',
                      type: 'text',
                      defaultValue: 'CHAT MESSAGES',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'commitmentsLabel',
              type: 'text',
              defaultValue: '// STANDING COMMITMENTS',
              admin: { description: 'Mono label above the commitments pills row.' },
            },
            {
              name: 'commitments',
              type: 'array',
              minRows: 0,
              maxRows: 8,
              defaultValue: [
                { tone: 'green', label: '$0 · FOREVER' },
                { tone: 'cyan', label: '0 ADS · 0 DATA SOLD' },
                { tone: 'magenta', label: 'VOLUNTEER-RUN' },
              ],
              admin: {
                description: 'Standing commitments shown as pills below the stats grid.',
                initCollapsed: false,
              },
              fields: tonePillFields,
            },
          ],
        },

        // ─── LEADERBOARD TEASER ────────────────────────────────────────────
        {
          name: 'leaderboardTeaser',
          label: 'Leaderboard Teaser',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Master switch over the auth gate. When off, hides the teaser even for signed-in members. When on, renders only for signed-in members.',
              },
            },
            {
              name: 'kicker',
              type: 'text',
              defaultValue: '// MEMBERS-ONLY DOSSIER',
            },
            {
              name: 'heading',
              type: 'textarea',
              defaultValue: 'RISE THROUGH\nTHE RANKS',
              admin: {
                description:
                  'Display headline. Newlines render as line breaks (white-space: pre-line).',
              },
            },
            {
              name: 'body',
              type: 'textarea',
              defaultValue:
                'Every message, every voice minute counts toward your XP. Sign in to see where you stand on the live leaderboard — top 20, your rank, your cohort.',
            },
            {
              name: 'bullets',
              type: 'array',
              minRows: 0,
              maxRows: 6,
              defaultValue: [
                { tone: 'green', label: 'LIVE XP RANKING' },
                { tone: 'cyan', label: 'TOP 20 + YOUR COHORT' },
                { tone: 'magenta', label: 'MEMBERS ONLY' },
              ],
              admin: { initCollapsed: false },
              fields: tonePillFields,
            },
            {
              name: 'cta',
              type: 'group',
              fields: ctaFields({
                label: 'VIEW LEADERBOARD',
                href: '/leaderboard',
              }),
            },
            {
              name: 'footer',
              type: 'text',
              defaultValue: '// SIGN-IN REQUIRED',
              admin: { description: 'Mono note under the CTA button.' },
            },
          ],
        },

        // ─── BEYOND LOBBIES ────────────────────────────────────────────────
        {
          name: 'beyondLobbies',
          label: 'Beyond Lobbies',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sectionNum',
                  type: 'text',
                  defaultValue: '02',
                  admin: { width: '20%' },
                },
                {
                  name: 'sectionEyebrow',
                  type: 'text',
                  defaultValue: 'DIFFERENTIATION',
                  admin: { width: '40%' },
                },
                {
                  name: 'sectionTitle',
                  type: 'text',
                  defaultValue: 'NOT YOUR AVERAGE LOBBY',
                  admin: { width: '40%' },
                },
              ],
            },
            {
              name: 'kicker',
              type: 'text',
              defaultValue: '// THE INVENTORY OF DIFFERENCES',
            },
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                'Most Discord servers are chat rooms with a member count. We’ve all been in them. Here’s the short list of things we did on purpose differently.',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'columnHeaderLeft',
                  type: 'text',
                  defaultValue: 'ELSEWHERE',
                  admin: { width: '50%' },
                },
                {
                  name: 'columnHeaderRight',
                  type: 'text',
                  defaultValue: 'ROGUE ARMY',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'rows',
              type: 'array',
              minRows: 1,
              maxRows: 16,
              defaultValue: [
                { elsewhere: 'Skill gates and tryouts', here: 'Mixed skill — show up, jump in' },
                { elsewhere: 'Engagement-bait pings', here: 'Game roles · opt in to what you play' },
                { elsewhere: 'Toxic randos drowning the chat', here: 'Mature 25+ regulars · zero tolerance for hate' },
                { elsewhere: '"Active 24/7" promises', here: 'Working adults · evenings and weekends' },
                { elsewhere: 'Algorithmic feed · ad-supported', here: 'Volunteer-run · $0, forever' },
                { elsewhere: 'Single-title gatekeeping', here: 'Game-agnostic · Division 2 to Sea of Thieves' },
                { elsewhere: 'Member-count flexing', here: 'Quality over quantity · friendship first' },
              ],
              admin: {
                description: 'Comparison rows. Left column shows the pain-point, right column shows the RGA answer.',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'elsewhere',
                  type: 'text',
                  required: true,
                  admin: { description: 'Pain-point in random Discord servers.' },
                },
                {
                  name: 'here',
                  type: 'text',
                  required: true,
                  admin: { description: 'What RGA does instead.' },
                },
              ],
            },
          ],
        },

        // ─── LORE ──────────────────────────────────────────────────────────
        {
          name: 'lore',
          label: 'Lore',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sectionNum',
                  type: 'text',
                  defaultValue: '03',
                  admin: { width: '20%' },
                },
                {
                  name: 'sectionEyebrow',
                  type: 'text',
                  defaultValue: 'DOCTRINE',
                  admin: { width: '40%' },
                },
                {
                  name: 'sectionTitle',
                  type: 'text',
                  defaultValue: 'WHY THIS EXISTS',
                  admin: { width: '40%' },
                },
              ],
            },
            {
              name: 'kicker',
              type: 'text',
              defaultValue: '// FOUNDED ON A SHORT LIST',
            },
            {
              name: 'leadParagraph',
              type: 'textarea',
              defaultValue:
                'Rogue Army is what happens when you take adult gamers seriously. We don’t recruit for headcount, we don’t farm engagement, and we don’t pretend the chat is family. It’s not. It’s a community of people who like games, run their own lives, and choose to show up here on the evenings and weekends they actually have free.',
              admin: { description: 'First paragraph — rendered larger than the body.' },
            },
            {
              name: 'bodyParagraphs',
              type: 'array',
              minRows: 0,
              maxRows: 6,
              defaultValue: [
                {
                  text: 'Started in 2019 by a small group who couldn’t find a server that wasn’t either drama-soaked or recruiting like a corporate Slack — so they built one. The bar to enter is honest: be 25-ish or older, behave like an adult regardless of age, and be willing to log off when life calls.',
                },
                {
                  text: 'No vote-to-kick. No engagement bait. No bots monetizing your time. Levels exist — Newcomer through Paragon — but they’re recognition, not gates. Mods are members on rotation. The only metric that matters is whether the place still feels like ours.',
                },
              ],
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'text',
                  type: 'textarea',
                  required: true,
                },
              ],
            },
            {
              name: 'values',
              type: 'array',
              minRows: 1,
              maxRows: 6,
              defaultValue: [
                {
                  iconKey: 'shield',
                  title: 'DRAMA-FREE',
                  description: 'Harassment, gatekeeping, sweatlord energy: zero tolerance. Three warnings, then out. The mod log is public.',
                  tone: 'green',
                },
                {
                  iconKey: 'users',
                  title: 'ADULTS WITH LIVES',
                  description: 'Recommended 25+. Working hours respected. No attendance quotas, no daily-streak guilt-trips.',
                  tone: 'cyan',
                },
                {
                  iconKey: 'heart',
                  title: 'FRIENDSHIP FIRST',
                  description: 'Member count is not a metric. We measure success by whether the place still feels like ours.',
                  tone: 'magenta',
                },
              ],
              admin: {
                description: 'Value cards rendered to the right of the body copy.',
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'iconKey',
                      type: 'select',
                      required: true,
                      defaultValue: 'shield',
                      options: [...ICON_OPTIONS],
                      admin: { width: '40%' },
                    },
                    {
                      name: 'tone',
                      type: 'select',
                      required: true,
                      defaultValue: 'green',
                      options: [...TONE_OPTIONS],
                      admin: { width: '60%' },
                    },
                  ],
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  admin: { description: 'Short uppercase title.' },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Pull Quote',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'pullQuoteText',
                  type: 'textarea',
                  defaultValue:
                    'You don’t need an algorithm to tell you where you belong. You need a door, a handle, and a few good people who show up.',
                },
                {
                  name: 'pullQuoteAttribution',
                  type: 'text',
                  defaultValue: '// FOUNDING DOCTRINE',
                },
              ],
            },
          ],
        },

        // ─── JOIN CTA ──────────────────────────────────────────────────────
        {
          name: 'joinCta',
          label: 'Join CTA',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sectionNum',
                  type: 'text',
                  defaultValue: '04',
                  admin: { width: '20%' },
                },
                {
                  name: 'sectionEyebrow',
                  type: 'text',
                  defaultValue: 'JOIN',
                  admin: { width: '40%' },
                },
                {
                  name: 'sectionTitle',
                  type: 'text',
                  defaultValue: 'STAND THE WATCH',
                  admin: { width: '40%' },
                },
              ],
            },
            {
              name: 'kicker',
              type: 'text',
              defaultValue: '// RECRUITMENT ORDER · OPEN STANDING',
            },
            {
              name: 'body',
              type: 'textarea',
              defaultValue:
                'The door stays open. Drop your platform and timezone in #general once you’re in — that’s the whole onboarding.',
            },
            {
              name: 'eligibility',
              type: 'array',
              minRows: 0,
              maxRows: 10,
              defaultValue: [
                { tone: 'green', label: '25+' },
                { tone: 'cyan', label: 'SA · UK · EU' },
                { tone: 'green', label: 'NO SKILL FLOOR' },
                { tone: 'cyan', label: 'OPTIONAL ATTENDANCE' },
                { tone: 'magenta', label: '$0 · FOREVER' },
              ],
              admin: {
                description: 'Eligibility tags above the buttons.',
                initCollapsed: false,
              },
              fields: tonePillFields,
            },
            {
              name: 'primaryButton',
              type: 'group',
              admin: { description: 'Primary CyberButton — Discord by default.' },
              fields: ctaFields({
                label: 'ENLIST · DISCORD',
                href: 'https://dc.roguearmy.xyz',
              }),
            },
            {
              name: 'secondaryButton',
              type: 'group',
              admin: { description: 'Secondary CyberButton — internal page link by default.' },
              fields: ctaFields({
                label: 'READ THE MANIFESTO',
                href: '/manifesto',
              }),
            },
            {
              name: 'footer',
              type: 'text',
              defaultValue: '// ACCEPTING · STATUS LIVE',
              admin: { description: 'Mono footer next to the pulsing dot.' },
            },
          ],
        },

        // ─── SEO ───────────────────────────────────────────────────────────
        {
          name: 'seo',
          label: 'SEO',
          fields: [
            {
              name: 'title',
              type: 'text',
              defaultValue: 'Community | Rogue Army',
            },
            {
              name: 'description',
              type: 'textarea',
              defaultValue:
                'A casual gaming community for adults across South Africa, the UK, and Europe. Drama-free, no skill gates, no engagement metrics — just the people, by the numbers.',
            },
          ],
        },
      ],
    },
  ],
}
