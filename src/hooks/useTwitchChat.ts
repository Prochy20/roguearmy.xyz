'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface TwitchMessage {
  username: string
  displayName: string
  message: string
  isMod: boolean
  isBroadcaster: boolean
  timestamp: number
}

interface UseTwitchChatOptions {
  channel: string
  enabled?: boolean
}

const TWITCH_IRC_URL = 'wss://irc-ws.chat.twitch.tv:443'
const MAX_BACKOFF = 30_000
const BASE_BACKOFF = 1_000

export function useTwitchChat({ channel, enabled = true }: UseTwitchChatOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const backoffRef = useRef(BASE_BACKOFF)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef<((msg: TwitchMessage) => void) | null>(null)

  const onMessage = useCallback((cb: (msg: TwitchMessage) => void) => {
    callbackRef.current = cb
  }, [])

  useEffect(() => {
    if (!enabled || !channel) {
      setIsConnected(false)
      return
    }

    const normalizedChannel = channel.toLowerCase().replace(/^#/, '')
    let disposed = false

    function connect() {
      if (disposed) return

      const ws = new WebSocket(TWITCH_IRC_URL)
      wsRef.current = ws

      ws.onopen = () => {
        ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands')
        const nick = `justinfan${Math.floor(Math.random() * 99999) + 1}`
        ws.send(`NICK ${nick}`)
        ws.send(`JOIN #${normalizedChannel}`)
        setIsConnected(true)
        setError(null)
        backoffRef.current = BASE_BACKOFF
      }

      ws.onmessage = (event) => {
        const raw = event.data as string
        const lines = raw.split('\r\n').filter(Boolean)

        for (const line of lines) {
          if (line.startsWith('PING')) {
            ws.send('PONG :tmi.twitch.tv')
            continue
          }

          if (!line.includes('PRIVMSG')) continue

          const parsed = parsePrivmsg(line)
          if (parsed && callbackRef.current) {
            callbackRef.current(parsed)
          }
        }
      }

      ws.onerror = () => {
        setError('WebSocket error')
      }

      ws.onclose = () => {
        setIsConnected(false)
        wsRef.current = null

        if (!disposed) {
          reconnectTimerRef.current = setTimeout(() => {
            backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF)
            connect()
          }, backoffRef.current)
        }
      }
    }

    connect()

    return () => {
      disposed = true
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [channel, enabled])

  return { isConnected, error, onMessage }
}

// ─── IRC Parsing ─────────────────────────────────────────────────────────────

function parsePrivmsg(line: string): TwitchMessage | null {
  const tagsMatch = line.match(/^@(\S+)/)
  const msgMatch = line.match(/PRIVMSG\s+#\S+\s+:(.*)$/)

  if (!msgMatch) return null

  const tags = parseTags(tagsMatch?.[1] ?? '')
  const displayName = tags['display-name'] || 'anonymous'
  const username = displayName.toLowerCase()
  const badges = tags['badges'] ?? ''
  const isMod = badges.includes('moderator') || tags['mod'] === '1'
  const isBroadcaster = badges.includes('broadcaster')

  return {
    username,
    displayName,
    message: msgMatch[1],
    isMod,
    isBroadcaster,
    timestamp: Date.now(),
  }
}

function parseTags(raw: string): Record<string, string> {
  const tags: Record<string, string> = {}
  if (!raw) return tags
  for (const pair of raw.split(';')) {
    const eqIdx = pair.indexOf('=')
    if (eqIdx === -1) continue
    tags[pair.slice(0, eqIdx)] = pair.slice(eqIdx + 1)
  }
  return tags
}
