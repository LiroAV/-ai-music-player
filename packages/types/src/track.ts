export type TrackStatus =
  | 'requested'
  | 'queued'
  | 'generating'
  | 'generated'
  | 'processing'
  | 'quality_check'
  | 'ready_private'
  | 'ready_public'
  | 'rejected'
  | 'archived'

export type TrackVisibility = 'public' | 'private'

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged'

export interface TrackAttributes {
  bpm: number | null
  energy: number           // 0–1
  tempo: string | null     // 'slow' | 'medium-slow' | 'medium' | 'medium-fast' | 'fast'
  key: string | null
  timeSignature: string | null
  instruments: string[]
  vocals: boolean
  danceability: number     // 0–1
  complexity: number       // 0–1
  brightness: number       // 0–1
  acousticBalance: number  // 0–1 (0=electronic, 1=acoustic)
  loopable: boolean
  activitySuitability: string[]  // 'focus' | 'study' | 'gym' | 'sleep' | ...
}

export interface Track {
  id: string
  title: string
  artistName: string
  audioUrl: string
  previewUrl: string | null
  artworkUrl: string | null
  durationSeconds: number
  status: TrackStatus
  visibility: TrackVisibility
  createdByUserId: string | null
  generationJobId: string | null
  primaryGenre: string
  subgenres: string[]
  moods: string[]
  attributes: TrackAttributes
  qualityScore: number        // 0–1, computed from engagement
  moderationStatus: ModerationStatus
  createdAt: string
  updatedAt: string
}

export interface TrackWithEngagement extends Track {
  playCount: number
  likeCount: number
  saveCount: number
  completionRate: number
  skipRate: number
  averageRating: number | null
  isLiked?: boolean
  isSaved?: boolean
  userRating?: number | null
}

export interface TrackFeedItem extends TrackWithEngagement {
  recommendationScore: number
  recommendationReason: string | null
}

export type DislikeReason =
  | 'not_my_style'
  | 'too_repetitive'
  | 'too_intense'
  | 'too_slow'
  | 'bad_quality'
  | 'wrong_mood'
  | 'bad_vocals'
  | 'too_generic'
  | 'other'
