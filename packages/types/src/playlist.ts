export type PlaylistVisibility = 'public' | 'private'

export interface Playlist {
  id: string
  userId: string
  name: string
  description: string | null
  visibility: PlaylistVisibility
  coverUrl: string | null
  trackCount: number
  createdAt: string
  updatedAt: string
}

export interface PlaylistTrack {
  id: string
  playlistId: string
  trackId: string
  position: number
  addedAt: string
}

export interface PlaylistWithTracks extends Playlist {
  tracks: PlaylistTrackEntry[]
}

export interface PlaylistTrackEntry {
  position: number
  addedAt: string
  track: import('./track.js').TrackWithEngagement
}

export interface CreatePlaylistDto {
  name: string
  description?: string
  visibility?: PlaylistVisibility
}

export interface AddTracksToPlaylistDto {
  trackIds: string[]
}

export interface ReorderPlaylistDto {
  trackId: string
  newPosition: number
}
