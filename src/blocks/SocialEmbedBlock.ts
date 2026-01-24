import { Block } from 'payload'
import { isSupportedSocialUrl, getSupportedSocialPlatforms } from '@/lib/social-embed'

/**
 * Social media embed block for rich text editor.
 * Supports Twitter/X, Instagram, and TikTok platforms.
 */
export const SocialEmbedBlock: Block = {
  slug: 'socialEmbed',
  interfaceName: 'SocialEmbedBlockType',
  labels: {
    singular: 'Social Embed',
    plural: 'Social Embeds',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Social Media URL',
      admin: {
        placeholder: 'Paste a Twitter/X, Instagram, or TikTok URL',
        description: 'Supports tweets, posts, reels, and videos from public accounts',
        components: {
          afterInput: ['@/components/admin/SocialEmbedPreview'],
        },
      },
      validate: (value: string | null | undefined) => {
        if (!value) {
          return 'URL is required'
        }

        if (!isSupportedSocialUrl(value)) {
          return `Unsupported URL. Please use: ${getSupportedSocialPlatforms().join(', ')}`
        }

        return true
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
      admin: {
        placeholder: 'Optional caption to display below the embed',
        description: 'Additional context shown beneath the embedded post',
      },
    },
  ],
}
