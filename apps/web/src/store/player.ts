import { create } from 'zustand'
import { generateSessionId } from '@/lib/utils'
import { api } from '@/lib/api'

export interface PlayerTrack {
  id: string
  title: string
  artistName: string
  audioUrl: string
  artworkUrl: string | null
  durationSeconds: number
  primaryGenre: string
  moods: string[]
  recommendationReason: string | null
}

type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

interface TrackInteraction {
  liked: boolean
  saved: boolean
}

interface PlayerState {
  queue: PlayerTrack[]
  currentIndex: number
  status: PlayerStatus
  positionSeconds: number
  sessionId: string
  isExpanded: boolean
  volume: number
  interactions: Record<string, TrackInteraction>

  // Derived
  currentTrack: PlayerTrack | null

  // Actions
  loadQueue: (tracks: PlayerTrack[], startIndex?: number) => void
  addToQueue: (track: PlayerTrack) => void
  play: () => void
  pause: () => void
  togglePlayPause: () => void
  skipNext: () => void
  skipPrev: () => void
  seekTo: (seconds: number) => void
  setPosition: (seconds: number) => void
  setStatus: (status: PlayerStatus) => void
  setExpanded: (expanded: boolean) => void
  setVolume: (volume: number) => void
  newSession: () => void
  toggleLike: (trackId: string) => void
  toggleSave: (trackId: string) => void
  sendDislike: (trackId: string) => void
}

function sendEvent(trackId: string, eventType: string, positionSeconds: number, sessionId: string) {
  api.post(`/tracks/${trackId}/play-event`, {
    eventType,
    positionSeconds: Math.round(positionSeconds),
    sessionId,
  }).catch(() => {})
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  status: 'idle',
  positionSeconds: 0,
  sessionId: generateSessionId(),
  isExpanded: false,
  volume: 0.8,
  interactions: {},

  get currentTrack() {
    const { queue, currentIndex } = get()
    return queue[currentIndex] ?? null
  },

  loadQueue: (tracks, startIndex = 0) => {
    set({ queue: tracks, currentIndex: startIndex, status: 'loading', positionSeconds: 0 })
  },

  addToQueue: (track) => {
    set(state => ({ queue: [...state.queue, track] }))
  },

  play: () => set({ status: 'playing' }),
  pause: () => set({ status: 'paused' }),

  togglePlayPause: () => {
    const { status } = get()
    set({ status: status === 'playing' ? 'paused' : 'playing' })
  },

  skipNext: () => {
    const { queue, currentIndex } = get()
    if (currentIndex < queue.length - 1) {
      set({ currentIndex: currentIndex + 1, status: 'loading', positionSeconds: 0 })
    }
  },

  skipPrev: () => {
    const { currentIndex, positionSeconds } = get()
    if (positionSeconds > 3) {
      set({ positionSeconds: 0 })
    } else if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1, status: 'loading', positionSeconds: 0 })
    }
  },

  seekTo: (seconds) => set({ positionSeconds: seconds }),
  setPosition: (seconds) => set({ positionSeconds: seconds }),
  setStatus: (status) => set({ status }),
  setExpanded: (expanded) => set({ isExpanded: expanded }),
  setVolume: (volume) => set({ volume }),
  newSession: () => set({ sessionId: generateSessionId() }),

  toggleLike: (trackId) => {
    const { interactions, positionSeconds, sessionId } = get()
    const current = interactions[trackId] ?? { liked: false, saved: false }
    const newLiked = !current.liked
    set({ interactions: { ...interactions, [trackId]: { ...current, liked: newLiked } } })
    sendEvent(trackId, newLiked ? 'like' : 'skip', positionSeconds, sessionId)
  },

  toggleSave: (trackId) => {
    const { interactions, positionSeconds, sessionId } = get()
    const current = interactions[trackId] ?? { liked: false, saved: false }
    const newSaved = !current.saved
    set({ interactions: { ...interactions, [trackId]: { ...current, saved: newSaved } } })
    sendEvent(trackId, newSaved ? 'save' : 'unsave', positionSeconds, sessionId)
  },

  sendDislike: (trackId) => {
    const { positionSeconds, sessionId } = get()
    sendEvent(trackId, 'dislike', positionSeconds, sessionId)
    get().skipNext()
  },
}))
