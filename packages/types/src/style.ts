export interface Style {
  id: string
  name: string
  slug: string
  description: string | null
  parentStyleId: string | null
  imageUrl: string | null
  tags: string[]
  popularityScore: number
  createdAt: string
  updatedAt: string
}

export interface StyleWithRelated extends Style {
  relatedStyles: Style[]
  isFollowed?: boolean
  followerCount: number
}

export type MoodTag =
  | 'calm'
  | 'energetic'
  | 'dark'
  | 'happy'
  | 'melancholic'
  | 'dreamy'
  | 'epic'
  | 'warm'
  | 'minimal'
  | 'groovy'
  | 'romantic'
  | 'mysterious'
  | 'intense'
  | 'peaceful'

export type GenreSlug =
  | 'jazz'
  | 'classical'
  | 'lofi'
  | 'house'
  | 'techno'
  | 'ambient'
  | 'cinematic'
  | 'funk'
  | 'soul'
  | 'rock'
  | 'hiphop'
  | 'electronic'
  | 'acoustic'
  | 'orchestral'
  | 'piano'
  | 'latin'
  | 'synthwave'
  | 'experimental'

export type ActivitySlug =
  | 'study'
  | 'workout'
  | 'sleep'
  | 'focus'
  | 'cooking'
  | 'walking'
  | 'gaming'
  | 'reading'
  | 'party'
  | 'deepwork'
