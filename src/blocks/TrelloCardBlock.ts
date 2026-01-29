import { Block } from 'payload'
import { isTrelloCardUrl } from '@/lib/trello-card'

/**
 * Trello card embed block for rich text editor.
 * Embeds Trello cards from public boards with full card details.
 */
export const TrelloCardBlock: Block = {
  slug: 'trelloCard',
  // Trello logo - blue clipboard with columns
  imageURL:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"%3E%3Crect x="2" y="2" width="20" height="20" rx="3" stroke="%230079BF" stroke-width="2"/%3E%3Crect x="5" y="5" width="5" height="10" rx="1" fill="%230079BF"/%3E%3Crect x="14" y="5" width="5" height="6" rx="1" fill="%230079BF"/%3E%3C/svg%3E',
  imageAltText: 'Trello card embed block',
  interfaceName: 'TrelloCardBlockType',
  labels: {
    singular: 'Trello Card',
    plural: 'Trello Cards',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Trello Card URL',
      admin: {
        placeholder: 'https://trello.com/c/iLGDA5JY/360-card-name',
        description: 'Paste a Trello card URL from a public board',
        components: {
          afterInput: ['@/components/admin/TrelloCardPreview'],
        },
      },
      validate: (value: string | null | undefined) => {
        if (!value) {
          return 'URL is required'
        }

        if (!isTrelloCardUrl(value)) {
          return 'Invalid Trello card URL. Please use format: trello.com/c/{cardId}/{optional-name}'
        }

        return true
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
      admin: {
        placeholder: 'Optional caption to display below the card',
        description: 'Additional context shown beneath the embedded card',
      },
    },
  ],
}
