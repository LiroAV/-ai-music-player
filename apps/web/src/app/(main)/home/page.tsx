'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Heart, ThumbsDown, SkipForward, Bookmark, Plus } from 'lucide-react'
import { usePlayerStore, type PlayerTrack } from '@/store/player'
import { api } from '@/lib/api'
import { ArtworkPlaceholder } from '@/components/player/MiniPlayer'

interface FeedTrack {
  id: string
  title: string
  artistName: string
  audioUrl: string
  artworkUrl: string | null
  durationSeconds: number
  primaryGenre: string
  moodsJson: string[]
  recommendationReason: string | null
}

function toPlayerTrack(t: FeedTrack): PlayerTrack {
  return {
    id: t.id,
    title: t.title,
    artistName: t.artistName,
    audioUrl: t.audioUrl,
    artworkUrl: t.artworkUrl,
    durationSeconds: t.durationSeconds,
    primaryGenre: t.primaryGenre,
    moods: t.moodsJson ?? [],
    recommendationReason: t.recommendationReason,
  }
}

export default function HomePage() {
  const { data: feed, isLoading } = useQuery<FeedTrack[]>({
    queryKey: ['feed'],
    queryFn: () => api.get<FeedTrack[]>('/tracks/feed'),
  })

  const { loadQueue, currentTrack, queue, skipNext } = usePlayerStore()

  useEffect(() => {
    if (feed && feed.length > 0 && queue.length === 0) {
      loadQueue(feed.map(toPlayerTrack), 0)
    }
  }, [feed, loadQueue, queue.length])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-6 text-center">
        <p className="text-text-secondary text-lg">No tracks in your feed yet.</p>
        <p className="text-text-muted text-sm">Try completing onboarding or seeding the database.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen px-6 pt-12 pb-4">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-text-muted text-sm">Your personalized feed</p>
        <h1 className="text-2xl font-bold text-text-primary">Good listening</h1>
      </div>

      {/* Main card */}
      <div className="flex-1 flex flex-col justify-center gap-6">
        {/* Artwork */}
        <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl max-h-72 mx-auto">
          {currentTrack.artworkUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentTrack.artworkUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ArtworkPlaceholder genre={currentTrack.primaryGenre} />
          )}
        </div>

        {/* Track info */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary">{currentTrack.title}</h2>
          <p className="text-text-secondary mt-1">{currentTrack.artistName}</p>

          {currentTrack.recommendationReason && (
            <p className="text-xs text-accent mt-2 bg-accent/10 px-3 py-1 rounded-full inline-block">
              {currentTrack.recommendationReason}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <span className="text-xs text-text-muted bg-card px-2 py-0.5 rounded-full border border-border capitalize">
              {currentTrack.primaryGenre}
            </span>
            {currentTrack.moods.slice(0, 2).map(m => (
              <span key={m} className="text-xs text-text-muted bg-card px-2 py-0.5 rounded-full border border-border">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Interaction controls */}
        <div className="flex items-center justify-center gap-6">
          <ActionBtn icon={ThumbsDown} label="Pass" onClick={() => skipNext()} danger />
          <ActionBtn icon={Heart} label="Like" onClick={() => {}} accent />
          <ActionBtn icon={SkipForward} label="Skip" onClick={() => skipNext()} />
          <ActionBtn icon={Bookmark} label="Save" onClick={() => {}} />
          <ActionBtn icon={Plus} label="Add" onClick={() => {}} />
        </div>
      </div>
    </div>
  )
}

function ActionBtn({
  icon: Icon, label, onClick, accent, danger,
}: { icon: React.ElementType; label: string; onClick: () => void; accent?: boolean; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all hover:scale-110 ${
        accent ? 'text-accent' : danger ? 'text-red-400' : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        accent ? 'bg-accent text-white' : 'bg-card border border-border'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
