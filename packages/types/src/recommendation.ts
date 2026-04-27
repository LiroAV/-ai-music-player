export interface Recommendation {
  id: string
  userId: string
  trackId: string
  score: number
  reason: string | null
  shownAt: string
  interacted: boolean
  interactionType: string | null
}

export interface FeedOptions {
  limit?: number
  offset?: number
  source?: 'home' | 'discover' | 'style'
  styleId?: string
  discoveryLevel?: 'safe' | 'medium' | 'wild'
}

export interface FeedComposition {
  personalized: number   // ratio 0–1
  adjacent: number
  experimental: number
}

export const DEFAULT_FEED_COMPOSITION: FeedComposition = {
  personalized: 0.70,
  adjacent: 0.20,
  experimental: 0.10,
}
