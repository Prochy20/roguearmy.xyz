import { Block } from 'payload'
import { isSupportedVideoUrl, getSupportedPlatforms } from '@/lib/video-embed'

/**
 * Video embed block for rich text editor.
 * Supports YouTube, Vimeo, Twitch, and Kick platforms.
 */
export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  imageURL:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23a1a1aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpolygon points="6 3 20 12 6 21 6 3"/%3E%3C/svg%3E',
  imageAltText: 'Video embed block',
  interfaceName: 'VideoEmbedBlockType',
  labels: {
    singular: 'Video Embed',
    plural: 'Video Embeds',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Video URL',
      admin: {
        placeholder: 'Paste a YouTube, Vimeo, Twitch, or Kick URL',
        description: 'Supports videos, playlists, channels, clips, and live streams',
        components: {
          afterInput: ['@/components/admin/VideoEmbedPreview'],
        },
      },
      validate: (value: string | null | undefined) => {
        if (!value) {
          return 'URL is required'
        }

        if (!isSupportedVideoUrl(value)) {
          return `Unsupported URL. Please use: ${getSupportedPlatforms().join(', ')}`
        }

        return true
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title (optional)',
      admin: {
        placeholder: 'Optional title for accessibility',
        description: 'Used as the iframe title attribute for screen readers',
      },
    },
  ],
}
