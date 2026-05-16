import type { CollectionConfig } from 'payload'

/**
 * Fetch a slim member DTO by discordId and write it into `data` so the
 * cached_* fields stay aligned with Discord. Used by the beforeChange hook
 * when a row is created or the discordId is changed. Fail-open: if Ashley
 * is unreachable we leave the cached fields untouched and let the lazy TTL
 * refresh on page render retry later.
 *
 * The Ashley client is dynamically imported inside the hook because
 * `@/lib/api/server` is marked `server-only`; eager-importing it at the
 * top of this collection file breaks the Payload importmap generator,
 * which loads collection configs outside a server-component context.
 */
type AvatarBundle = { 64: string; 128: string; 256: string; 512: string } | null | undefined

/**
 * Pick the largest Discord-provided variant (512px) from the server-specific
 * avatar first (guild-level override), then the global avatar. Cards render
 * the avatar at ~340px wide on desktop, so 512 gives crisp 1.5× DPR coverage
 * without upscaling artefacts. Returns null when neither is set.
 */
function pickBestAvatar(server: AvatarBundle, global: AvatarBundle): string | null {
  return server?.[512] ?? global?.[512] ?? null
}

async function refreshCacheFromAshley(
  data: Record<string, unknown>,
  discordId: string,
): Promise<void> {
  const { fetchAshleyService } = await import('@/lib/api/server')
  const result = await fetchAshleyService((client) =>
    client.GET('/api/community/members/lookup', {
      params: { query: { ids: discordId } },
    }),
  )
  if (!result.ok) return
  const member = result.data?.[0]
  if (!member) return
  data.cached_username = (member.username ?? null) as string | null
  data.cached_displayName = member.displayName
  data.cached_avatarUrl = pickBestAvatar(
    member.serverAvatarUrls as AvatarBundle,
    member.avatarUrls as AvatarBundle,
  )
  data.cached_joinedAt = member.joinedAt ?? null
  data.cached_accountCreatedAt = member.accountCreatedAt ?? null
  data.cached_at = new Date().toISOString()
}

/**
 * Staff profiles for the /community/staff manifest. Each row pairs an editorial
 * layer (role title, bio, visibility, order) with synced Discord identity data
 * (display name, avatar URL, last cache timestamp). The discordId is picked
 * via an autocomplete component that hits Ashley's
 * /api/community/members/autocomplete; on save, a hook hydrates the cached_*
 * fields so the page renders correctly immediately. The lazy TTL refresh on
 * /community/staff keeps the cache fresh from then on.
 */
export const StaffProfiles: CollectionConfig = {
  slug: 'staff-profiles',
  labels: {
    singular: 'Staff Profile',
    plural: 'Staff Profiles',
  },
  admin: {
    useAsTitle: 'cached_displayName',
    group: 'Content',
    description: 'Operatives shown on /community/staff. Order ascending.',
    defaultColumns: ['order', 'cached_displayName', 'roleTitle', 'isPublic'],
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  hooks: {
    beforeChange: [
      // Every save refreshes the Discord cache. Cheap (one Ashley call per
      // save, the staff cohort is tiny) and gives editors a manual refresh
      // affordance: re-saving the record forces a re-sync, which is useful
      // when someone changes their nickname/avatar and the editor wants to
      // see it on the page without waiting for the 24h TTL.
      async ({ data }) => {
        const newId = (data?.discordId as string | undefined)?.trim()
        if (!newId) return data
        await refreshCacheFromAshley(data, newId)
        return data
      },
    ],
  },
  fields: [
    {
      name: 'discordId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Search Discord members by name and pick one. The display name and avatar are hydrated from Ashley on save and refreshed lazily on page render.',
        components: {
          Field: '@/components/admin/StaffDiscordPicker',
        },
      },
    },
    {
      name: 'roleTitle',
      type: 'text',
      required: true,
      admin: {
        description: 'Human-readable title shown under the operative name (e.g. "Community Lead").',
      },
    },
    {
      name: 'bio',
      type: 'richText',
      admin: {
        description:
          'Optional dossier text. Line-clamped to three lines on the card; click-through reveals the full bio on the future operative detail page.',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'When off, this operative only appears for signed-in members.',
      },
    },
    {
      name: 'accent',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto (hash-based variety)', value: 'auto' },
        { label: 'Green', value: 'green' },
        { label: 'Cyan', value: 'cyan' },
        { label: 'Magenta', value: 'magenta' },
        { label: 'Developer · Lime', value: 'dev' },
        { label: 'Community Admin · Pink', value: 'admin' },
        { label: 'Community Mod · Orange', value: 'mod' },
      ],
      admin: {
        description:
          'Card accent color. Leave "Auto" for hash-derived variety across the roster, or pick a specific color (the three role tints map to the brand role colors).',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      admin: {
        description:
          'Display sort, ascending. Lower numbers appear first. Leave gaps (10, 20, 30…) so reordering is cheap.',
        step: 10,
      },
    },
    {
      type: 'collapsible',
      label: 'Discord Sync (read-only)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'cached_username',
          type: 'text',
          admin: {
            readOnly: true,
            description:
              'Latest known Discord username (the @handle, not the display name). Refreshed lazily on page render past TTL.',
          },
        },
        {
          name: 'cached_displayName',
          type: 'text',
          admin: {
            readOnly: true,
            description:
              'Latest known display name from Discord. Refreshed lazily on page render past TTL.',
          },
        },
        {
          name: 'cached_avatarUrl',
          type: 'text',
          admin: {
            readOnly: true,
            description:
              'Latest known Discord avatar URL. Falls back to the tactical ID-portrait when empty.',
          },
        },
        {
          name: 'cached_joinedAt',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'When this operative joined the Discord guild (surfaced as "ENLISTED" on the card).',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'cached_accountCreatedAt',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'When this operative\'s Discord account was created (surfaced as "ON RECORD" on the card).',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'cached_at',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'When the cached fields were last refreshed from Ashley.',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
      ],
    },
  ],
}
