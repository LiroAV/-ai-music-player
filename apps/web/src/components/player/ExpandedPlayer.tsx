'use client'

import { useRef, useState } from 'react'
import { Play, Pause, SkipForward, SkipBack, Heart, Bookmark, ThumbsDown, X, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/player'
import { formatDuration } from '@/lib/utils'
import { ArtworkPlaceholder } from './MiniPlayer'
import { cn } from '@/lib/utils'
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal'

export function ExpandedPlayer() {
  const {
    currentTrack, status, positionSeconds,
    togglePlayPause, skipNext, skipPrev, setExpanded, isExpanded,
    seekTo, interactions, toggleLike, toggleSave, sendDislike,
  } = usePlayerStore()

  const [addModalOpen, setAddModalOpen] = useState(false)

  const interaction = currentTrack ? (interactions[currentTrack.id] ?? { liked: false, saved: false }) : { liked: false, saved: false }

  return (
    <AnimatePresence>
      {isExpanded && currentTrack && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 bg-background z-50 flex flex-col px-6 pt-12 pb-8"
        >
          {addModalOpen && (
            <AddToPlaylistModal trackId={currentTrack.id} onClose={() => setAddModalOpen(false)} />
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setExpanded(false)} className="text-text-secondary hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
            <p className="text-sm font-medium text-text-secondary">Now playing</p>
            <div className="w-5" />
          </div>

          {/* Artwork */}
          <div className="w-full aspect-square rounded-3xl overflow-hidden mb-8 shadow-2xl">
            {currentTrack.artworkUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentTrack.artworkUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <ArtworkPlaceholder genre={currentTrack.primaryGenre} />
            )}
          </div>

          {/* Track info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary">{currentTrack.title}</h2>
            <p className="text-text-secondary mt-1">{currentTrack.artistName}</p>

            {currentTrack.recommendationReason && (
              <p className="text-xs text-accent mt-2 bg-accent/10 px-3 py-1 rounded-full inline-block">
                {currentTrack.recommendationReason}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {currentTrack.moods.map(m => (
                <span key={m} className="text-xs text-text-muted bg-card px-2 py-0.5 rounded-full border border-border">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <SeekableProgressBar
            position={positionSeconds}
            duration={currentTrack.durationSeconds}
            onSeek={seekTo}
          />

          {/* Main controls */}
          <div className="flex items-center justify-between mt-6">
            <ActionButton
              icon={ThumbsDown}
              label="Dislike"
              onClick={() => sendDislike(currentTrack.id)}
              danger
            />
            <button onClick={skipPrev} className="text-text-secondary hover:text-text-primary">
              <SkipBack className="w-7 h-7" />
            </button>
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30"
            >
              {status === 'playing' ? (
                <Pause className="w-7 h-7 text-white" fill="white" />
              ) : (
                <Play className="w-7 h-7 text-white" fill="white" />
              )}
            </button>
            <button onClick={skipNext} className="text-text-secondary hover:text-text-primary">
              <SkipForward className="w-7 h-7" />
            </button>
            <ActionButton
              icon={Heart}
              label="Like"
              onClick={() => toggleLike(currentTrack.id)}
              active={interaction.liked}
              accent
            />
          </div>

          {/* Secondary controls */}
          <div className="flex items-center justify-around mt-8">
            <ActionButton
              icon={Bookmark}
              label="Save"
              onClick={() => toggleSave(currentTrack.id)}
              active={interaction.saved}
              small
            />
            <ActionButton
              icon={Plus}
              label="Add"
              onClick={() => setAddModalOpen(true)}
              small
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SeekableProgressBar({
  position, duration, onSeek,
}: { position: number; duration: number; onSeek: (s: number) => void }) {
  const barRef = useRef<HTMLDivElement>(null)
  const pct = duration > 0 ? (position / duration) * 100 : 0

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    onSeek(Math.max(0, Math.min(duration, ratio * duration)))
  }

  return (
    <div className="w-full">
      <div
        ref={barRef}
        onClick={handleClick}
        className="relative w-full h-1 bg-border rounded-full overflow-hidden cursor-pointer group"
      >
        <div
          className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${Math.min(100, pct)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-text-muted">{formatDuration(Math.floor(position))}</span>
        <span className="text-xs text-text-muted">{formatDuration(duration)}</span>
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon, label, onClick, small, active, accent, danger,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  small?: boolean
  active?: boolean
  accent?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 transition-colors',
        accent && active ? 'text-accent' :
        active ? 'text-accent' :
        danger ? 'text-red-400 hover:text-red-300' :
        'text-text-secondary hover:text-text-primary',
      )}
    >
      <Icon
        className={cn(small ? 'w-5 h-5' : 'w-6 h-6')}
        fill={active ? 'currentColor' : 'none'}
      />
      <span className="text-xs">{label}</span>
    </button>
  )
}
