export type GenerationJobStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type GenerationProvider = 'suno' | 'udio' | 'musicgen' | 'mock'

export interface StructuredPrompt {
  primaryGenre: string
  subgenres: string[]
  moods: string[]
  tempo: string
  bpmRange: [number, number]
  instruments: string[]
  vocals: boolean
  energy: number        // 0–1
  complexity: number    // 0–1
  durationSeconds: number
  avoid: string[]
}

export interface GenerationJob {
  id: string
  userId: string
  status: GenerationJobStatus
  inputPrompt: string
  structuredPrompt: StructuredPrompt
  provider: GenerationProvider
  model: string | null
  estimatedCost: number | null
  actualCost: number | null
  resultTrackId: string | null
  errorMessage: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
}

export interface GenerationRequest {
  // Quick style
  genre?: string
  mood?: string[]
  energy?: number
  vocals?: boolean
  durationSeconds?: number
  activity?: string
  // Advanced
  freeTextPrompt?: string
  // Source
  similarToTrackId?: string
  fromPlaylistId?: string
}

export interface GenerationResponse {
  mode: 'reused_existing_tracks' | 'generation_started' | 'broadened_search'
  tracks: string[]          // track IDs
  generationJob: GenerationJob | null
  message?: string
}
