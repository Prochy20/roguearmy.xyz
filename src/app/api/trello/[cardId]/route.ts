import { NextRequest, NextResponse } from 'next/server'
import type { TrelloCardData, TrelloChecklist, TrelloLabel } from '@/lib/trello-card'

interface TrelloApiCard {
  id: string
  name: string
  desc: string
  labels: {
    id: string
    name: string
    color: string | null
  }[]
  due: string | null
  dueComplete: boolean
  shortUrl: string
  idAttachmentCover: string | null
  checklists: {
    id: string
    name: string
    checkItems: {
      id: string
      name: string
      state: 'complete' | 'incomplete'
    }[]
  }[]
  attachments: {
    id: string
    url: string
    previews?: {
      url: string
      width: number
      height: number
    }[]
  }[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params

  if (!cardId) {
    return NextResponse.json(
      { error: 'Card ID is required' },
      { status: 400 }
    )
  }

  try {
    // Fetch card from Trello API (public boards don't need API key)
    const trelloUrl = new URL(`https://api.trello.com/1/cards/${cardId}`)
    trelloUrl.searchParams.set('fields', 'name,desc,labels,due,dueComplete,idAttachmentCover,shortUrl')
    trelloUrl.searchParams.set('checklists', 'all')
    trelloUrl.searchParams.set('attachments', 'cover')

    const response = await fetch(trelloUrl.toString(), {
      next: { revalidate: 3600 }, // 1 hour cache
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Card not found. The card may have been deleted or the URL is incorrect.' },
          { status: 404 }
        )
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: 'This card is from a private board. Only cards from public boards can be embedded.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to fetch card from Trello' },
        { status: response.status }
      )
    }

    const trelloCard: TrelloApiCard = await response.json()

    // Find cover image URL from attachments
    let coverImage: string | null = null
    if (trelloCard.idAttachmentCover && trelloCard.attachments) {
      const coverAttachment = trelloCard.attachments.find(
        (att) => att.id === trelloCard.idAttachmentCover
      )
      if (coverAttachment) {
        // Try to get a preview URL for better sizing, fallback to main URL
        const preview = coverAttachment.previews?.find(
          (p) => p.width >= 400 && p.width <= 800
        )
        coverImage = preview?.url || coverAttachment.url
      }
    }

    // Transform to our format
    const cardData: TrelloCardData = {
      id: trelloCard.id,
      name: trelloCard.name,
      desc: trelloCard.desc,
      labels: trelloCard.labels.map((label): TrelloLabel => ({
        id: label.id,
        name: label.name,
        color: label.color,
      })),
      due: trelloCard.due,
      dueComplete: trelloCard.dueComplete,
      checklists: trelloCard.checklists.map((checklist): TrelloChecklist => ({
        id: checklist.id,
        name: checklist.name,
        checkItems: checklist.checkItems.map((item) => ({
          id: item.id,
          name: item.name,
          state: item.state,
        })),
      })),
      coverImage,
      shortUrl: trelloCard.shortUrl,
    }

    return NextResponse.json(cardData, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
      },
    })
  } catch (error) {
    console.error('Error fetching Trello card:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching the card' },
      { status: 500 }
    )
  }
}
