export type SubscriptionTier = 'free' | 'plus' | 'pro'

export interface User {
  id: string
  email: string
  username: string
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
  subscriptionTier: SubscriptionTier
  onboardingCompleted: boolean
  country: string | null
  language: string
}

export interface TasteProfile {
  userId: string
  genres: Record<string, number>        // genre slug → weight 0–1
  moods: Record<string, number>         // mood slug → weight 0–1
  attributes: TasteAttributes
  noveltyTolerance: number              // 0–1, how open to unfamiliar styles
  lastUpdatedAt: string
}

export interface TasteAttributes {
  instrumental: number    // 0–1 preference for instrumental
  vocals: number          // 0–1 preference for vocals
  tempoMin: number        // BPM
  tempoMax: number        // BPM
  energy: number          // 0–1
  complexity: number      // 0–1
  danceability: number    // 0–1
  brightness: number      // 0–1 (bright vs dark sound)
  acoustic: number        // 0–1 (acoustic vs electronic)
}

export interface OnboardingPreferences {
  selectedStyles: string[]    // style slugs
  selectedMoods: string[]     // mood slugs
}
