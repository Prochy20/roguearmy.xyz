import type { Block, GlobalConfig } from 'payload'

/* ───────────────────────── How-to step blocks ─────────────────────────
   The /division-2/clans How-To section is a list of heterogeneous steps:
   most are plain instruction text, one carries a slash-command chip, one
   carries an outbound CTA link. Modeled as three discrete blocks so the
   admin form only renders the fields that apply to the variant the editor
   picks, and the generated TypeScript is a clean discriminated union. */

const CommandStepBlock: Block = {
  slug: 'commandStep',
  interfaceName: 'CommandStepBlock',
  labels: { singular: 'Command Step', plural: 'Command Steps' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    {
      name: 'command',
      type: 'text',
      required: true,
      admin: {
        description:
          'Slash-command rendered as a terminal-style code chip (e.g. /my account).',
      },
    },
  ],
}

const InstructionStepBlock: Block = {
  slug: 'instructionStep',
  interfaceName: 'InstructionStepBlock',
  labels: { singular: 'Instruction Step', plural: 'Instruction Steps' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
  ],
}

const OutcomeStepBlock: Block = {
  slug: 'outcomeStep',
  interfaceName: 'OutcomeStepBlock',
  labels: { singular: 'Outcome Step', plural: 'Outcome Steps' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    {
      name: 'statusLabel',
      type: 'text',
      defaultValue: 'ENLISTED',
      admin: {
        description:
          'Short mono badge shown top-right (e.g. ENLISTED, MEMBER, VERIFIED). Keep under 12 chars for layout.',
      },
    },
  ],
}

const CtaStepBlock: Block = {
  slug: 'ctaStep',
  interfaceName: 'CtaStepBlock',
  labels: { singular: 'CTA Step', plural: 'CTA Steps' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaLabel',
          type: 'text',
          required: true,
          admin: { width: '40%', description: 'CTA button label.' },
        },
        {
          name: 'ctaUrl',
          type: 'text',
          required: true,
          admin: {
            width: '60%',
            description:
              'Where the CTA sends the user. Use the full URL for off-site (e.g. Discord deep link).',
          },
        },
      ],
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Open the CTA link in a new tab (adds target="_blank" + safe rel). Turn on for off-site destinations like Discord deep links.',
      },
    },
  ],
}

/**
 * Division 2 settings + editorial copy. Replaces the previous `settings`
 * global as the source of truth for D2 access and on-page text.
 *
 *   - Access tab: the game-roles relationship whose Discord-role snapshot
 *     gates `/division-2/*`. Clearing it disables the section entirely.
 *   - Escalation Page tab: every editable string on `/division-2/escalation`,
 *     including the SEC_03 Discord cross-link.
 *
 * Designed to be extended per-tool: when we add manhunt/seasonal stuff,
 * each new page gets its own tab inside this same global rather than a
 * separate global per feature.
 */
export const Division2: GlobalConfig = {
  slug: 'division2',
  label: 'Division 2',
  admin: {
    group: 'Division 2',
    description:
      'Access gate + editable copy for the Division 2 tools. Clearing the gate role disables the section for all members.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─── ACCESS ────────────────────────────────────────────────────────
        {
          name: 'gate',
          label: 'Access',
          fields: [
            {
              name: 'role',
              type: 'relationship',
              relationTo: 'game-roles',
              hasMany: false,
              admin: {
                description:
                  'Game-roles entry whose Discord roles grant access to /division-2. Clearing this disables the section for everyone.',
              },
            },
          ],
        },

        // ─── LANDING PAGE ──────────────────────────────────────────────────
        {
          name: 'landingPage',
          label: 'Landing Page',
          fields: [
            // Hero header
            {
              name: 'heroKicker',
              type: 'text',
              defaultValue: '// DIVISION 2 · OPS · COMMAND',
              admin: {
                description:
                  'Small mono kicker above the headline. The status token (STATUS · OPERATIONAL / DEGRADED / OFFLINE) is appended automatically.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroTitle',
                  type: 'text',
                  defaultValue: 'COMMAND',
                  admin: {
                    width: '50%',
                    description: 'First word of the two-line headline — rendered in white.',
                  },
                },
                {
                  name: 'heroAccent',
                  type: 'text',
                  defaultValue: 'CONSOLE',
                  admin: {
                    width: '50%',
                    description:
                      'Second word of the headline — rendered in Division 2 orange with extra glow.',
                  },
                },
              ],
            },
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                "The Division 2 ops console — live intel on the game in one panel. Today's escalation rotation, the latest content from across the community, and Ashley's weekly AI briefing.",
              admin: { description: 'Paragraph under the headline.' },
            },

            // StatRibbon
            {
              name: 'ribbonPrefix',
              type: 'text',
              defaultValue: '// DIVISION 2 · COMMAND',
              admin: {
                description:
                  'Mono prefix at the left of the StatRibbon. Fields (LOCAL, TOOLS, LAST SYNC) and the aggregate pill are appended automatically.',
              },
            },

            // Raids — SEC_04
            {
              name: 'raids',
              type: 'group',
              admin: {
                description:
                  'WEEKLY RAIDS section (SEC_04). Routes operatives to Discord #events for RSVP via the Apollo bot. Every string here is admin-editable.',
              },
              fields: [
                // Section headline
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'headlineTitle',
                      type: 'text',
                      defaultValue: 'WEEKLY',
                      admin: {
                        width: '50%',
                        description:
                          'First word of the section headline — rendered in white.',
                      },
                    },
                    {
                      name: 'headlineAccent',
                      type: 'text',
                      defaultValue: 'RAIDS',
                      admin: {
                        width: '50%',
                        description:
                          'Second word of the section headline — rendered in Division 2 green with extra glow.',
                      },
                    },
                  ],
                },

                // Blurb under the headline
                {
                  name: 'blurb',
                  type: 'textarea',
                  defaultValue:
                    'Iron Horse on Saturday. Dark Hours on Sunday. The Apollo bot handles signups in Discord #events — RSVP to lock your slot.',
                  admin: {
                    description:
                      'Body paragraph shown under the WEEKLY RAIDS headline.',
                  },
                },

                // Regular-rotation label + schedule
                {
                  name: 'rotationLabel',
                  type: 'text',
                  defaultValue: '// REGULAR ROTATION',
                  admin: {
                    description:
                      'Mono caption above the recurring-raid list.',
                  },
                },
                {
                  name: 'schedule',
                  type: 'array',
                  admin: {
                    description:
                      'Recurring weekly raids. Each row renders as an image-backed card — drop two hero images per raid under /public/division2/img/raids/ and reference them below. Image 1 is the resting background; Image 2 swipes in on hover.',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'day',
                          type: 'text',
                          admin: {
                            width: '40%',
                            description: 'Day pill (e.g., SATURDAY).',
                          },
                        },
                        {
                          name: 'title',
                          type: 'text',
                          admin: {
                            width: '60%',
                            description:
                              'Raid name (e.g., IRON HORSE).',
                          },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'imagePrimary',
                          type: 'text',
                          admin: {
                            width: '50%',
                            description:
                              'Path to the resting hero image (e.g., /division2/img/raids/dark-hours-1.jpg). Local files only — Discord CDN links expire.',
                          },
                        },
                        {
                          name: 'imageSecondary',
                          type: 'text',
                          admin: {
                            width: '50%',
                            description:
                              'Path to the hover-reveal image (e.g., /division2/img/raids/dark-hours-2.jpg). Falls back to the primary if blank.',
                          },
                        },
                      ],
                    },
                  ],
                  defaultValue: [
                    {
                      day: 'SATURDAY',
                      title: 'IRON HORSE',
                      imagePrimary: '/division2/img/raids/iron-horse-1.jpg',
                      imageSecondary: '/division2/img/raids/iron-horse-2.jpg',
                    },
                    {
                      day: 'SUNDAY',
                      title: 'DARK HOURS',
                      imagePrimary: '/division2/img/raids/dark-hours-1.jpg',
                      imageSecondary: '/division2/img/raids/dark-hours-2.jpg',
                    },
                  ],
                },

                // CTA
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ctaLabel',
                      type: 'text',
                      defaultValue: 'OPEN #EVENTS',
                      admin: {
                        width: '40%',
                        description: 'CTA button label.',
                      },
                    },
                    {
                      name: 'discordUrl',
                      type: 'text',
                      defaultValue:
                        'https://discord.com/channels/935163066432229386/',
                      admin: {
                        width: '60%',
                        description:
                          'Deep link to the Discord #events channel.',
                      },
                    },
                  ],
                },
              ],
            },

            // SEO
            {
              name: 'seo',
              label: 'SEO',
              type: 'group',
              admin: { description: 'Document title + meta description.' },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Command Console | Division 2 · Rogue Army',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'Live overview of Division 2 ops — escalation drops, content firehose, and weekly briefing, in one panel.',
                },
              ],
            },
          ],
        },

        // ─── CONTENT PAGE ──────────────────────────────────────────────────
        {
          name: 'contentPage',
          label: 'Content Page',
          fields: [
            // Hero header
            {
              name: 'heroKicker',
              type: 'text',
              defaultValue: '// DIVISION 2 · CONTENT FEED · LIVE INTEL',
              admin: {
                description:
                  'Small mono kicker above the headline. Source-count + filter token appended automatically.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroTitle',
                  type: 'text',
                  defaultValue: 'CONTENT',
                  admin: {
                    width: '50%',
                    description: 'First word of the two-line headline — rendered in white.',
                  },
                },
                {
                  name: 'heroAccent',
                  type: 'text',
                  defaultValue: 'FEED',
                  admin: {
                    width: '50%',
                    description:
                      'Second word of the headline — rendered in Division 2 orange with extra glow.',
                  },
                },
              ],
            },
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                'Aggregated dispatches from YouTube, Reddit, and Ubisoft — AI-filtered for Division 2 relevance. Every card links straight to source.',
              admin: { description: 'Paragraph under the headline.' },
            },

            // Section labels
            {
              name: 'feedSectionLabel',
              type: 'text',
              defaultValue: '// LIVE FEED',
              admin: { description: 'Mono label above the card grid.' },
            },
            {
              name: 'feedBlurb',
              type: 'textarea',
              defaultValue:
                'Filter the feed by source above — YouTube creator content, Reddit discussion, or Ubisoft official news — or leave it on ALL for the combined firehose. Strictness ladder: SCAN sweeps wide (★3 and up), TRACE narrows to sharper signals (★4+), LOCK targets top-tier intel only (★5).',
              admin: {
                description:
                  'Editorial blurb shown under the SEC_03 // LIVE FEED label. Best used to explain what the filters do, since the trigger UI is intentionally terse.',
              },
            },

            // Empty + end states
            {
              name: 'emptyFiltered',
              type: 'text',
              defaultValue: '// NO {SOURCE} CONTENT — TRY ANOTHER SOURCE',
              admin: {
                description:
                  'Shown when a source filter is active but Ashley returns zero items. `{SOURCE}` is replaced with the active source name (YOUTUBE / REDDIT / UBISOFT).',
              },
            },
            {
              name: 'emptyAll',
              type: 'text',
              defaultValue: '// CONTENT FEED OFFLINE — UPSTREAM SYNC PENDING',
              admin: {
                description:
                  'Shown when no filter is active and Ashley still returns zero items (sync may not have happened yet).',
              },
            },
            {
              name: 'endOfFeedLabel',
              type: 'text',
              defaultValue: '// END OF FEED · {COUNT} ITEMS',
              admin: {
                description:
                  'Mono marker shown after the user scrolls to the last item. `{COUNT}` is replaced with the loaded-items count.',
              },
            },

            // SEO
            {
              name: 'seo',
              label: 'SEO',
              type: 'group',
              admin: { description: 'Document title + meta description.' },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Content Feed | Division 2 · Rogue Army',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'Curated YouTube, Reddit, and Ubisoft dispatches for The Division 2 — filtered by AI relevance and linked straight to source.',
                },
              ],
            },
          ],
        },

        // ─── ESCALATION PAGE ───────────────────────────────────────────────
        {
          name: 'escalationPage',
          label: 'Escalation Page',
          fields: [
            // Hero header
            {
              name: 'heroKicker',
              type: 'text',
              defaultValue: '// DIVISION 2 · ESCALATION · TARGETED LOOT',
              admin: {
                description:
                  'Small mono kicker above the headline. The status token (TODAY / VIEWING) and date are appended automatically.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroTitle',
                  type: 'text',
                  defaultValue: 'ESCALATION',
                  admin: {
                    width: '50%',
                    description: 'First word of the two-line headline — rendered in white.',
                  },
                },
                {
                  name: 'heroAccent',
                  type: 'text',
                  defaultValue: 'PROTOCOL',
                  admin: {
                    width: '50%',
                    description:
                      'Second word of the headline — rendered in Division 2 orange with extra glow.',
                  },
                },
              ],
            },
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                'Targeted-loot rotation for the active escalation. Step through any day — back through prior days if you need older intel.',
              admin: { description: 'Paragraph under the headline.' },
            },

            // SEC_01 — Active missions
            {
              name: 'missionsSectionLabel',
              type: 'text',
              defaultValue: '// ACTIVE MISSIONS',
              admin: { description: 'Mono label next to SEC_01.' },
            },

            // SEC_02 — Vendor / prototype caches
            {
              name: 'cachesSectionLabel',
              type: 'text',
              defaultValue: '// ESCALATION VENDOR · PROTOTYPE CACHES',
              admin: { description: 'Mono label next to SEC_02.' },
            },
            {
              name: 'cachesBlurb',
              type: 'textarea',
              defaultValue:
                'Vendor in the White House · Escalation area sells one gear-slot cache and one weapon-class cache each day. Rotation is independent of the mission targeted-loot above.',
              admin: {
                description:
                  'Short paragraph under the SEC_02 header explaining the vendor and its location.',
              },
            },

            // SEC_03 — Discord cross-link
            {
              name: 'discord',
              type: 'group',
              admin: {
                description:
                  'SEC_03 card pointing members at the Discord channel that mirrors the same daily intel. Toggle off to hide the section entirely.',
              },
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { description: 'Toggle the section without losing its copy.' },
                },
                {
                  name: 'sectionLabel',
                  type: 'text',
                  defaultValue: '// DISCORD COMMS · DAILY DROPS',
                  admin: { description: 'Mono label next to SEC_03.' },
                },
                {
                  name: 'heading',
                  type: 'text',
                  defaultValue: 'ALSO POSTED ON DISCORD',
                  admin: { description: 'Section display title.' },
                },
                {
                  name: 'body',
                  type: 'textarea',
                  defaultValue:
                    'The same daily targeted-loot drop posts to Rogue Army Discord each day. Set the channel to follow if you want a pinged feed instead of checking the page.',
                  admin: { description: 'Body paragraph for the SEC_03 card.' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'channelLabel',
                      type: 'text',
                      defaultValue: '#division-2-escalation',
                      admin: {
                        width: '40%',
                        description: 'Mono channel reference shown above the CTA.',
                      },
                    },
                    {
                      name: 'ctaLabel',
                      type: 'text',
                      defaultValue: 'OPEN CHANNEL',
                      admin: { width: '60%', description: 'CTA button label.' },
                    },
                  ],
                },
                {
                  name: 'channelUrl',
                  type: 'text',
                  defaultValue:
                    'https://discord.com/channels/935163066432229386/1358354784222183435',
                  admin: {
                    description:
                      'Discord channel URL (the deep link is what desktop and mobile Discord both honour).',
                  },
                },
              ],
            },

            // SEO
            {
              name: 'seo',
              label: 'SEO',
              type: 'group',
              admin: { description: 'Document title + meta description.' },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Escalation Protocol | Division 2 · Rogue Army',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'Active targeted-loot rotation for The Division 2 escalation — step through any day to see what drops from each mission.',
                },
              ],
            },
          ],
        },

        // ─── CLANS PAGE ─────────────────────────────────────────────────────
        {
          name: 'clansPage',
          label: 'Clans Page',
          fields: [
            // Hero header
            {
              name: 'heroKicker',
              type: 'text',
              defaultValue: '// DIVISION 2 · CLANS',
              admin: { description: 'Mono kicker above the headline. Clan count is appended automatically.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroTitle',
                  type: 'text',
                  defaultValue: 'REGIMENTAL',
                  admin: {
                    width: '50%',
                    description: 'First word of the two-line headline — rendered in white.',
                  },
                },
                {
                  name: 'heroAccent',
                  type: 'text',
                  defaultValue: 'STANDARDS',
                  admin: {
                    width: '50%',
                    description: 'Second word of the headline — rendered in RGA green with extra glow.',
                  },
                },
              ],
            },
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                'Three banners. One army. Pick any — what matters is being on Discord.',
              admin: { description: 'Subtitle paragraph under the headline.' },
            },

            // Roster section label (above the three cards)
            {
              name: 'rosterSectionLabel',
              type: 'text',
              defaultValue: '// ACTIVE STANDARDS',
              admin: { description: 'Mono label above the three clan cards.' },
            },

            // Empty state — shown when no clans are published
            {
              name: 'emptyRoster',
              type: 'text',
              defaultValue: '// NO STANDARDS ON FILE — ROSTER PENDING',
              admin: {
                description: 'Shown when no clans are published yet. The rest of the page still renders.',
              },
            },

            // "How to Join" steps — heterogeneous blocks list
            {
              name: 'howTo',
              type: 'group',
              admin: {
                description:
                  'Enlistment protocol. Add as many steps as you like and reorder freely. Each step picks a variant: Command (slash-command chip), Instruction (plain text), or CTA (link button).',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'sectionKicker',
                      type: 'text',
                      defaultValue: '// JOIN PROTOCOL',
                      admin: { width: '50%', description: 'Mono section kicker.' },
                    },
                    {
                      name: 'sectionTitle',
                      type: 'text',
                      defaultValue: 'ENLISTMENT',
                      admin: { width: '50%', description: 'Section display title.' },
                    },
                  ],
                },
                {
                  name: 'steps',
                  type: 'blocks',
                  minRows: 1,
                  blocks: [CommandStepBlock, InstructionStepBlock, CtaStepBlock, OutcomeStepBlock],
                  defaultValue: [
                    {
                      blockType: 'ctaStep',
                      title: 'Join the Discord',
                      body: 'The community runs on Discord. Hop in first — everything else (clan invites, voice, events) flows from there.',
                      ctaLabel: 'JOIN DISCORD',
                      ctaUrl: 'https://dc.roguearmy.xyz',
                      openInNewTab: true,
                    },
                    {
                      blockType: 'commandStep',
                      title: 'Link your account',
                      body: 'Run this in Discord to link your Division 2 username:',
                      command: '/my account',
                    },
                    {
                      blockType: 'instructionStep',
                      title: 'Send a clan request',
                      body: 'Pick any clan above and send a join request in-game. SDC, RGA, or RGS — doesn’t matter which.',
                    },
                    {
                      blockType: 'ctaStep',
                      title: 'Tell staff in the channel',
                      body: 'Drop a note in the Division 2 channel so staff know your request is incoming and can approve it.',
                      ctaLabel: 'OPEN CHANNEL',
                      ctaUrl: '',
                      openInNewTab: true,
                    },
                    {
                      blockType: 'outcomeStep',
                      title: 'You’re in',
                      body: 'Staff accepts your in-game request and pings you. Welcome to the fireteam.',
                      statusLabel: 'ENLISTED',
                    },
                  ],
                },
              ],
            },

            // "What Really Matters" callout
            {
              name: 'callout',
              type: 'group',
              admin: { description: 'Friendly community message — the warm counterpoint to the procedural shell.' },
              fields: [
                {
                  name: 'kicker',
                  type: 'text',
                  defaultValue: '// TRANSMISSION · ALL HANDS',
                  admin: { description: 'Mono section kicker.' },
                },
                {
                  name: 'headline',
                  type: 'text',
                  defaultValue: 'THE BANNER YOU CARRY DOESN’T MATTER.',
                  admin: { description: 'Single declarative line.' },
                },
                {
                  name: 'body',
                  type: 'textarea',
                  defaultValue:
                    'What matters is who’s next to you in the fireteam — and that happens on Discord. SDC, RGA, RGS — we all friend up, run loot together, and call each other in for raids.',
                  admin: {
                    description:
                      'Body paragraph under the headline. Focused on "which clan doesn’t matter"; the parallel "joining is optional" angle lives in the openInvite interlude above.',
                  },
                },
                {
                  name: 'bullets',
                  type: 'array',
                  admin: { description: 'Bullet points emphasizing the community-first stance.' },
                  fields: [{ name: 'text', type: 'text' }],
                  defaultValue: [
                    { text: 'Discord is where it happens' },
                    { text: 'Cross-clan friendships are the norm' },
                    { text: 'Skill level isn’t the bar — vibes are' },
                    { text: 'Show up, hop in voice, hang out' },
                  ],
                },
                {
                  name: 'signature',
                  type: 'text',
                  defaultValue: 'Rogue Army · where gaming meets friendship',
                  admin: { description: 'Quiet signature line under the bullets.' },
                },
              ],
            },

            // Closing "Contact Staff" CTA
            {
              name: 'closingCta',
              type: 'group',
              admin: { description: 'The big primary CTA at the bottom of the page.' },
              fields: [
                {
                  name: 'headline',
                  type: 'text',
                  defaultValue: 'READY TO JOIN A FIRETEAM?',
                  admin: { description: 'Headline above the CTA button.' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ctaLabel',
                      type: 'text',
                      defaultValue: 'CONTACT STAFF',
                      admin: { width: '40%', description: 'CTA button label.' },
                    },
                    {
                      name: 'ctaUrl',
                      type: 'text',
                      defaultValue: '/community/staff',
                      admin: { width: '60%', description: 'Where the CTA sends the user.' },
                    },
                  ],
                },
                {
                  name: 'openInNewTab',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description:
                      'Open the CTA link in a new browser tab (adds target="_blank" + safe rel). Turn on for off-site destinations like Discord deep links so visitors don\'t lose the clans page.',
                  },
                },
                {
                  name: 'signature',
                  type: 'text',
                  defaultValue: '// ROGUE ARMY · DIV-2 OPS',
                  admin: { description: 'Mono signature line under the button.' },
                },
              ],
            },

            // SEO
            {
              name: 'seo',
              label: 'SEO',
              type: 'group',
              admin: { description: 'Document title + meta description.' },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Clans | Division 2 · Rogue Army',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'Three active Division 2 clans on PC. Pick any — what matters is being on Discord with us.',
                },
              ],
            },
          ],
        },

        // ─── BRIEFINGS PAGE ─────────────────────────────────────────────────
        {
          name: 'briefingsPage',
          label: 'Briefings Page',
          fields: [
            // Hero header
            {
              name: 'heroKicker',
              type: 'text',
              defaultValue: '// DIVISION 2 · AI BRIEFINGS',
              admin: {
                description:
                  'Small mono kicker above the headline. The active week label is appended automatically.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroTitle',
                  type: 'text',
                  defaultValue: 'AI',
                  admin: {
                    width: '50%',
                    description: 'First word of the headline — rendered in white.',
                  },
                },
                {
                  name: 'heroAccent',
                  type: 'text',
                  defaultValue: 'BRIEFINGS',
                  admin: {
                    width: '50%',
                    description:
                      'Second word of the headline — rendered in Division 2 orange with extra glow.',
                  },
                },
              ],
            },
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                'AI-summarized briefings on the Division 2 firehose. Weekly roll-ups are open to every operative; daily briefings unlock for Discord boosters.',
              admin: { description: 'Paragraph under the headline.' },
            },

            // SEC_01 — weekly card
            {
              name: 'weeklySectionLabel',
              type: 'text',
              defaultValue: '// THIS WEEK',
              admin: { description: 'Mono label next to SEC_01 (weekly roll-up).' },
            },

            // SEC_02 — dailies / perks widget
            {
              name: 'dailiesSectionLabel',
              type: 'text',
              defaultValue: '// DAILY BRIEFINGS',
              admin: { description: 'Mono label next to SEC_02 (daily cards or perks widget).' },
            },

            // SEC_03 — refs (used on the detail page)
            {
              name: 'refsSectionLabel',
              type: 'text',
              defaultValue: '// REFS · SOURCES',
              admin: { description: 'Mono label next to SEC_03 on the briefing detail page.' },
            },

            // Booster perks widget
            {
              name: 'perks',
              type: 'group',
              admin: {
                description:
                  'SEC_02 widget shown to non-boosters in place of the daily cards. Explains the booster perk and (optionally) links to a CTA.',
              },
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { description: 'Toggle the widget without losing its copy.' },
                },
                {
                  name: 'kicker',
                  type: 'text',
                  defaultValue: '// SUPPORT CHANNEL · NOT A PAYWALL',
                  admin: { description: 'Mono kicker line above the headline.' },
                },
                {
                  name: 'heading',
                  type: 'text',
                  defaultValue: 'BOOST THE SERVER, NOT THE BOTTOM LINE.',
                  admin: {
                    description:
                      'Display-font headline. Frame the perk as a thank-you, not a paywall.',
                  },
                },
                {
                  name: 'body',
                  type: 'textarea',
                  defaultValue:
                    "Server boosts pay for Discord features the entire community uses — higher stream quality, more emoji slots, voice channel effects, larger upload limits. Rogue Army doesn't keep a cent of it. As a thank-you, boosters unlock the daily AI briefings on top of the weekly roll-up everyone gets.",
                  admin: { description: 'Body paragraph explaining the non-profit framing.' },
                },
                {
                  name: 'fundBullets',
                  type: 'array',
                  admin: {
                    description:
                      'Left column — what every server boost actually funds for the community.',
                  },
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                    },
                  ],
                  defaultValue: [
                    { text: 'Stream quality up to 1080p · 60fps' },
                    { text: 'Custom emoji + sticker slots' },
                    { text: 'Voice channel sound effects' },
                    { text: 'Higher file upload limits' },
                    { text: 'Animated server icon + banner' },
                  ],
                },
                {
                  name: 'bullets',
                  type: 'array',
                  admin: {
                    description:
                      'Right column — what boosters get back as a thank-you.',
                  },
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                    },
                  ],
                  defaultValue: [
                    { text: 'Seven daily AI briefings · one per day' },
                    { text: 'Highlights surfaced six days earlier' },
                    { text: 'Detail pages with cited articles + sources' },
                    { text: 'Full archive access across all weeks' },
                  ],
                },
                {
                  name: 'cta',
                  type: 'group',
                  admin: {
                    description:
                      'Optional call-to-action button. Leave both blank to hide the button entirely.',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          defaultValue: '',
                          admin: { width: '40%', description: 'CTA button label.' },
                        },
                        {
                          name: 'url',
                          type: 'text',
                          defaultValue: '',
                          admin: {
                            width: '60%',
                            description:
                              'CTA destination — Discord boost link, Patreon, or an internal /boost page. Leave blank to hide.',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },

            // Empty + error states
            {
              name: 'emptyWeek',
              type: 'text',
              defaultValue: '// NO BRIEFING FOR THIS WEEK',
              admin: {
                description: 'Shown when the active week has no weekly briefing in the archive.',
              },
            },
            {
              name: 'emptyAll',
              type: 'text',
              defaultValue: '// BRIEFINGS ARCHIVE EMPTY — AWAITING FIRST RUN',
              admin: {
                description: 'Shown when Ashley has no briefings for the topic yet.',
              },
            },

            // SEO
            {
              name: 'seo',
              label: 'SEO',
              type: 'group',
              admin: { description: 'Document title + meta description.' },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  defaultValue: 'Briefings | Division 2 · Rogue Army',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    'AI-summarized weekly and daily briefings for The Division 2 — distilled from the YouTube, Reddit, and Ubisoft firehose.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
