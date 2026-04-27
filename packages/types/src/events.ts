export type ListeningEventType =
  | 'play'
  | 'pause'
  | 'skip'
  | 'complete'
  | 'replay'
  | 'like'
  | 'dislike'
  | 'save'
  | 'unsave'
  | 'rate'
  | 'add_to_playlist'
  | 'remove_from_playlist'
  | 'share'
  | 'report'

export interface ListeningEvent {
  id: string
  userId: string
  trackId: string
  eventType: ListeningEventType
  positionSeconds: number | null
  sessionId: string
  createdAt: string
  context: EventContext
}

export interface EventContext {
  source: 'home_feed' | 'discover' | 'playlist' | 'style_page' | 'search' | 'create'
  playlistId?: string
  styleId?: string
  sessionPosition?: number   // which track # in session
}

export interface PlayEventDto {
  eventType: ListeningEventType
  positionSeconds?: number
  sessionId: string
  context: EventContext
  dislikeReason?: import('./track.js').DislikeReason
  rating?: number
}

// Weights used to update taste profile
export const EVENT_WEIGHTS: Record<ListeningEventType, number> = {
  like: 5,
  save: 6,
  add_to_playlist: 8,
  complete: 3,
  replay: 7,
  skip: -3,            // default skip weight; adjusted by position
  dislike: -8,
  rate: 0,             // computed from rating value
  play: 0,
  pause: 0,
  unsave: -4,
  remove_from_playlist: -4,
  share: 4,
  report: -10,
}
