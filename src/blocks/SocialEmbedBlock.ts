import { Block } from 'payload'
import { isSupportedSocialUrl, getSupportedSocialPlatforms } from '@/lib/social-embed'

/**
 * Social media embed block for rich text editor.
 * Supports Twitter/X, Instagram, and TikTok platforms.
 */
export const SocialEmbedBlock: Block = {
  slug: 'socialEmbed',
  imageURL:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23a1a1aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="18" cy="5" r="3"/%3E%3Ccircle cx="6" cy="12" r="3"/%3E%3Ccircle cx="18" cy="19" r="3"/%3E%3Cline x1="8.59" x2="15.42" y1="13.51" y2="17.49"/%3E%3Cline x1="15.41" x2="8.59" y1="6.51" y2="10.49"/%3E%3C/svg%3E',
  imageAltText: 'Social embed block',
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
