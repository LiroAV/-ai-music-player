'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Play, Heart } from 'lucide-react'
import { api } from '@/lib/api'
import { usePlayerStore } from '@/store/player'
import { formatDuration } from '@/lib/utils'

interface Style {
  id: string
  name: string
  slug: string
  description: string | null
  isFollowed: boolean
  followerCount: number
}

interface Track {
  id: string
  title: string
  artistName: string
  audioUrl: string
  artworkUrl: string | null
  durationSeconds: number
  primaryGenre: string
  moodsJson: string[]
  qualityScore: number
}

export default function StylePage() {
  const { slug } = useParams<{ slug: string }>()
  const queryClient = useQueryClient()

  const { data: styles } = useQuery<Style[]>({ queryKey: ['styles'], queryFn: () => api.get<Style[]>('/styles') })
  const style = styles?.find(s => s.slug === slug)

  const { data: tracks } = useQuery<Track[]>({
    queryKey: ['style-tracks', style?.id],
    queryFn: () => api.get<Track[]>(`/tracks/by-style/${style!.id}`),
    enabled: !!style?.id,
  })

  const { data: related } = useQuery<Style[]>({
    queryKey: ['style-related', style?.id],
    queryFn: () => api.get<Style[]>(`/styles/${style!.id}/related`),
    enabled: !!style?.id,
  })

  const [followed, setFollowed] = useState<boolean | null>(null)
  const isFollowed = followed ?? style?.isFollowed ?? false

  const followMutation = useMutation({
    mutationFn: () =>
      isFollowed
        ? api.delete(`/styles/${style!.id}/follow`)
        : api.post(`/styles/${style!.id}/follow`, {}),
    onMutate: () => setFollowed(!isFollowed),
    onError: () => setFollowed(isFollowed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] })
      queryClient.invalidateQueries({ queryKey: ['followed-styles'] })
    },
  })

  const { loadQueue } = usePlayerStore()

  const playStyle = () => {
    if (!tracks) return
    loadQueue(
      tracks.map(t => ({
        id: t.id, title: t.title, artistName: t.artistName, audioUrl: t.audioUrl,
        artworkUrl: t.artworkUrl, durationSeconds: t.durationSeconds,
        primaryGenre: t.primaryGenre, moods: t.moodsJson ?? [], recommendationReason: null,
      })),
      0,
    )
  }

  if (!style) {
    return <div className="flex justify-center pt-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="px-5 pt-12 pb-4">
      <Link href="/discover" className="text-sm text-text-muted hover:text-text-secondary mb-6 inline-block">
        ← Discover
      </Link>

      <h1 className="text-3xl font-bold text-text-primary mt-2">{style.name}</h1>
      {style.description && <p className="text-text-secondary mt-2 text-sm leading-relaxed">{style.description}</p>}

      <div className="flex gap-3 mt-6">
        <button
          onClick={playStyle}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-white font-semibold"
        >
          <Play className="w-4 h-4" fill="white" /> Play
        </button>
        <button
          onClick={() => followMutation.mutate()}
          disabled={followMutation.isPending}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl border font-semibold transition-colors ${
            isFollowed
              ? 'bg-accent/20 border-accent/40 text-accent'
              : 'bg-card border-border text-text-secondary'
          }`}
        >
          <Heart className="w-4 h-4" fill={isFollowed ? 'currentColor' : 'none'} />
          {isFollowed ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Tracks */}
      {tracks && tracks.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary mb-4">Top tracks</h2>
          <div className="flex flex-col gap-2">
            {tracks.slice(0, 10).map((track, i) => (
              <div key={track.id} className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border hover:border-muted transition-colors">
                <span className="text-text-muted text-sm w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate text-sm">{track.title}</p>
                  <p className="text-xs text-text-secondary truncate">{track.artistName}</p>
                </div>
                <span className="text-xs text-text-muted">{formatDuration(track.durationSeconds)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related styles */}
      {related && related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-semibold text-text-primary mb-3">Related styles</h2>
          <div className="flex flex-wrap gap-3">
            {related.map(s => (
              <Link key={s.id} href={`/discover/${s.slug}`}>
                <div className="px-4 py-2 rounded-xl bg-card border border-border text-text-secondary text-sm hover:border-muted transition-colors">
                  {s.name}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
