import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import type { AvatarBundle } from '@/lib/discord/avatar'

/**
 * Fetch a slim member DTO by discordId and write it into `data` so the
 * cached_* fields stay aligned with Discord. Used by the beforeChange hook
 * when a row is created or the discordId is changed.
 *
 * Returns a discriminated outcome so the hook can decide whether to fail
 * the save (new row / changed id — we need a valid Ashley member to back
 * this row) or warn and continue (same id, just a manual re-save to
 * refresh the cache — the lazy TTL on /community/staff will retry).
 *
 * The Ashley client + avatar helper are dynamically imported because
 * `@/lib/api/server` and `@/lib/discord/avatar` are marked `server-only`;
 * eager-importing them at the top of this collection file breaks the
 * Payload importmap generator, which loads collection configs outside a
 * server-component context.
 */
type RefreshOutcome =
  | { kind: 'ok' }
  | { kind: 'ashley_down' }
  | { kind: 'member_not_found' }

async function refreshCacheFromAshley(
  data: Record<string, unknown>,
  discordId: string,
): Promise<RefreshOutcome> {
  const [{ fetchAshleyService }, { pickBestAvatar }] = await Promise.all([
    import('@/lib/api/server'),
    import('@/lib/discord/avatar'),
  ])
  const result = await fetchAshleyService((client) =>
    client.GET('/api/community/members/lookup', {
      params: { query: { ids: discordId } },
    }),
  )
  if (!result.ok) return { kind: 'ashley_down' }
  const member = result.data?.[0]
  if (!member) return { kind: 'member_not_found' }

  data.cached_username = (member.username ?? null) as string | null
  data.cached_displayName = member.displayName
  data.cached_avatarUrl = pickBestAvatar(
    member.serverAvatarUrls as AvatarBundle,
    member.avatarUrls as AvatarBundle,
  )
  data.cached_joinedAt = member.joinedAt ?? null
  data.cached_accountCreatedAt = member.accountCreatedAt ?? null
  data.cached_at = new Date().toISOString()
  return { kind: 'ok' }
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
      // affordance: re-saving the record forces a re-sync.
      //
      // Failure policy is asymmetric:
      //   - create / changed discordId → throw, because we cannot
      //     responsibly persist a row whose cached_* fields don't match
      //     the new id. Editor sees the Ashley failure and can retry.
      //   - unchanged discordId         → log + continue. The cached_*
      //     fields stay as-is and the page's lazy TTL refresh will retry
      //     on next render. Failing here would block routine edits
      //     (changing roleTitle / bio / order) whenever Ashley is down.
      async ({ data, operation, originalDoc }) => {
        const newId = (data?.discordId as string | undefined)?.trim()
        if (!newId) return data

        const idChanged =
          operation === 'create' || originalDoc?.discordId !== newId

        const outcome = await refreshCacheFromAshley(data, newId)
        if (outcome.kind === 'ok') return data

        if (idChanged) {
          if (outcome.kind === 'member_not_found') {
            throw new APIError(
              `No Discord member found for ID ${newId}. Pick a different operative or check Ashley.`,
              400,
            )
          }
          throw new APIError(
            'Could not verify operative against Ashley (upstream unreachable). Try again in a moment.',
            503,
          )
        }

        console.warn(
          `StaffProfiles refresh skipped for ${newId}: ${outcome.kind}. Cached fields left as-is; lazy TTL will retry on next render.`,
        )
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
