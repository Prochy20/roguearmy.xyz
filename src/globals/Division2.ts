import type { GlobalConfig } from 'payload'

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
      ],
    },
  ],
}
