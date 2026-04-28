'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Play, Trash2, MoreHorizontal, X } from 'lucide-react'
import { api } from '@/lib/api'
import { usePlayerStore, type PlayerTrack } from '@/store/player'
import { formatDuration } from '@/lib/utils'

interface Track {
  id: string
  title: string
  artistName: string
  audioUrl: string
  artworkUrl: string | null
  durationSeconds: number
  primaryGenre: string
  moodsJson: string[]
}

interface Playlist {
  id: string
  name: string
  visibility: string
  tracks: Array<{ track: Track; position: number }>
  _count: { tracks: number }
  updatedAt: string
}

function toPlayerTrack(t: Track): PlayerTrack {
  return {
    id: t.id, title: t.title, artistName: t.artistName, audioUrl: t.audioUrl,
    artworkUrl: t.artworkUrl, durationSeconds: t.durationSeconds,
    primaryGenre: t.primaryGenre, moods: t.moodsJson ?? [], recommendationReason: null,
  }
}

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { loadQueue } = usePlayerStore()
  const [menuTrackId, setMenuTrackId] = useState<string | null>(null)

  const { data: playlist, isLoading } = useQuery<Playlist>({
    queryKey: ['playlist', id],
    queryFn: () => api.get<Playlist>(`/playlists/${id}`),
  })

  const removeTrack = useMutation({
    mutationFn: (trackId: string) => api.delete(`/playlists/${id}/tracks/${trackId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', id] })
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      setMenuTrackId(null)
    },
  })

  const deletePlaylist = useMutation({
    mutationFn: () => api.delete(`/playlists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      router.push('/library')
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!playlist) return null

  const tracks = playlist.tracks.sort((a, b) => a.position - b.position).map(pt => pt.track)

  const playAll = (startIndex = 0) => {
    if (tracks.length === 0) return
    loadQueue(tracks.map(toPlayerTrack), startIndex)
  }

  const totalDuration = tracks.reduce((sum, t) => sum + t.durationSeconds, 0)
  const hours = Math.floor(totalDuration / 3600)
  const minutes = Math.floor((totalDuration % 3600) / 60)
  const durationLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`

  return (
    <div className="px-5 pt-12 pb-4">
      {/* Close menu on outside click */}
      {menuTrackId && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuTrackId(null)} />
      )}

      <Link href="/library" className="text-sm text-text-muted hover:text-text-secondary mb-6 inline-block">
        ← Library
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="w-24 h-24 rounded-2xl bg-accent/20 flex items-center justify-center text-4xl mb-4">♪</div>
        <h1 className="text-2xl font-bold text-text-primary">{playlist.name}</h1>
        <p className="text-text-muted text-sm mt-1">
          {tracks.length} tracks · {durationLabel} · {playlist.visibility}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        {tracks.length > 0 && (
          <button
            onClick={() => playAll(0)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-white font-semibold"
          >
            <Play className="w-4 h-4" fill="white" /> Play all
          </button>
        )}
        <button
          onClick={() => { if (confirm('Delete this playlist?')) deletePlaylist.mutate() }}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border border-border text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Track list */}
      {tracks.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">No tracks yet</p>
          <p className="text-sm">Add tracks using the + button while listening.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {tracks.map((track, i) => (
          <div key={track.id} className="relative flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
            <button
              onClick={() => playAll(i)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
              <span className="text-text-muted text-xs w-5 text-right flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate text-sm">{track.title}</p>
                <p className="text-xs text-text-secondary truncate">{track.artistName} · <span className="capitalize">{track.primaryGenre}</span></p>
              </div>
              <span className="text-xs text-text-muted flex-shrink-0">{formatDuration(track.durationSeconds)}</span>
            </button>

            {/* Track menu */}
            <button
              onClick={(e) => { e.stopPropagation(); setMenuTrackId(menuTrackId === track.id ? null : track.id) }}
              className="p-1 text-text-muted hover:text-text-secondary flex-shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuTrackId === track.id && (
              <div className="absolute right-0 top-10 z-50 bg-surface border border-border rounded-xl shadow-xl overflow-hidden min-w-[140px]">
                <button
                  onClick={() => removeTrack.mutate(track.id)}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-card transition-colors"
                >
                  <X className="w-4 h-4" /> Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
