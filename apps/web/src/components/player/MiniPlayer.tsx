'use client'

import { Play, Pause, SkipForward, Heart, ChevronUp } from 'lucide-react'
import { usePlayerStore } from '@/store/player'
import { cn } from '@/lib/utils'

export function MiniPlayer() {
  const {
    currentTrack, status, positionSeconds,
    togglePlayPause, skipNext, setExpanded,
    interactions, toggleLike,
  } = usePlayerStore()

  if (!currentTrack) return null

  const pct = currentTrack.durationSeconds > 0
    ? (positionSeconds / currentTrack.durationSeconds) * 100
    : 0
  const isLiked = interactions[currentTrack.id]?.liked ?? false

  return (
    <div className="fixed bottom-16 left-0 right-0 mx-3 z-40">
      {/* Progress bar */}
      <div className="h-0.5 bg-border rounded-full overflow-hidden mx-1 mb-0.5">
        <div
          className="h-full bg-accent transition-all duration-1000"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      <div
        className="glass rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        {/* Artwork */}
        <div className="w-10 h-10 rounded-xl bg-card flex-shrink-0 overflow-hidden">
          {currentTrack.artworkUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentTrack.artworkUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ArtworkPlaceholder genre={currentTrack.primaryGenre} small />
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{currentTrack.title}</p>
          <p className="text-xs text-text-secondary truncate">{currentTrack.artistName}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              isLiked ? 'text-accent' : 'text-text-muted hover:text-text-secondary')}
          >
            <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={togglePlayPause}
            className="w-9 h-9 rounded-full bg-accent flex items-center justify-center"
          >
            {status === 'playing' ? (
              <Pause className="w-4 h-4 text-white" fill="white" />
            ) : (
              <Play className="w-4 h-4 text-white" fill="white" />
            )}
          </button>
          <button
            onClick={skipNext}
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={e => { e.stopPropagation(); setExpanded(true) }}
          className="text-text-muted hover:text-text-secondary"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

const GENRE_GRADIENTS: Record<string, string> = {
  jazz: 'from-amber-900 to-orange-800',
  lofi: 'from-indigo-900 to-purple-900',
  ambient: 'from-teal-900 to-cyan-900',
  cinematic: 'from-slate-900 to-gray-800',
  synthwave: 'from-pink-900 to-purple-900',
  classical: 'from-stone-800 to-amber-900',
  funk: 'from-orange-900 to-yellow-900',
  house: 'from-blue-900 to-cyan-900',
}

function ArtworkPlaceholder({ genre, small }: { genre: string; small?: boolean }) {
  const gradient = GENRE_GRADIENTS[genre] ?? 'from-violet-900 to-indigo-900'
  return (
    <div className={cn('w-full h-full bg-gradient-to-br', gradient, 'flex items-center justify-center')}>
      <span className={cn('text-white/40', small ? 'text-xs' : 'text-2xl')}>♪</span>
    </div>
  )
}

export { ArtworkPlaceholder }
