import type { GlobalConfig } from 'payload'

export const SiteChrome: GlobalConfig = {
  slug: 'site-chrome',
  label: 'Site Chrome',
  admin: {
    group: 'Settings',
    description:
      'Footer tagline copy and the member-count floor used when Ashley is unreachable.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'tagline',
      type: 'group',
      fields: [
        {
          name: 'live',
          type: 'textarea',
          defaultValue:
            'Casual gaming community for adults 25+. {members} operators on the one server that feels like home.',
          admin: {
            description:
              'Shown when Ashley is reachable. The literal token {members} is replaced with the live count plus "+" (e.g. 247+). If you omit the token, the sentence renders verbatim.',
          },
        },
        {
          name: 'fallback',
          type: 'textarea',
          defaultValue:
            'Casual gaming community for adults 25+. The one server that feels like home.',
          admin: {
            description:
              'Shown verbatim when Ashley is unreachable. No token substitution.',
          },
        },
      ],
    },
    {
      name: 'memberCountFloor',
      type: 'number',
      defaultValue: 200,
      admin: {
        description:
          'StatsTicker fallback value when Ashley is unreachable. Rendered with a "+" suffix. Bump occasionally so the fallback stays honest.',
      },
    },
  ],
}
