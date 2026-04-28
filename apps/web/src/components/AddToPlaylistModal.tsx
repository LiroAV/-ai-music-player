'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { X, Plus } from 'lucide-react'
import { api } from '@/lib/api'

interface Playlist {
  id: string
  name: string
  _count: { tracks: number }
}

interface Props {
  trackId: string
  onClose: () => void
}

export function AddToPlaylistModal({ trackId, onClose }: Props) {
  const { data: playlists, isLoading } = useQuery<Playlist[]>({
    queryKey: ['playlists'],
    queryFn: () => api.get<Playlist[]>('/playlists'),
  })

  const addMutation = useMutation({
    mutationFn: (playlistId: string) =>
      api.post(`/playlists/${playlistId}/tracks`, { trackIds: [trackId] }),
    onSuccess: onClose,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-surface border border-border rounded-t-3xl p-6 pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">Add to playlist</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {playlists?.length === 0 && (
          <p className="text-text-muted text-sm text-center py-8">No playlists yet. Create one in Library.</p>
        )}

        <div className="flex flex-col gap-2">
          {playlists?.map(p => (
            <button
              key={p.id}
              onClick={() => addMutation.mutate(p.id)}
              disabled={addMutation.isPending}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-accent/40 transition-colors text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-muted flex-shrink-0">
                ♪
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{p.name}</p>
                <p className="text-xs text-text-secondary">{p._count.tracks} tracks</p>
              </div>
              <Plus className="w-4 h-4 text-text-muted flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
