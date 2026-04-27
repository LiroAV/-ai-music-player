'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Style {
  id: string
  name: string
  slug: string
  description: string | null
  tagsJson: string[]
}

const GENRE_GRADIENTS: Record<string, string> = {
  jazz: 'from-amber-800 to-orange-700',
  lofi: 'from-indigo-800 to-purple-800',
  ambient: 'from-teal-800 to-cyan-800',
  cinematic: 'from-slate-700 to-gray-600',
  synthwave: 'from-pink-800 to-purple-700',
  classical: 'from-stone-700 to-amber-800',
  funk: 'from-orange-800 to-yellow-700',
  house: 'from-blue-800 to-cyan-700',
  techno: 'from-gray-800 to-zinc-700',
  soul: 'from-rose-800 to-orange-700',
  hiphop: 'from-yellow-800 to-amber-700',
  electronic: 'from-cyan-800 to-blue-700',
  acoustic: 'from-lime-800 to-green-700',
  orchestral: 'from-red-900 to-rose-800',
  piano: 'from-violet-900 to-indigo-800',
  latin: 'from-orange-700 to-red-700',
  experimental: 'from-fuchsia-900 to-purple-900',
}

export default function DiscoverPage() {
  const { data: styles, isLoading } = useQuery<Style[]>({
    queryKey: ['styles'],
    queryFn: () => api.get<Style[]>('/styles'),
  })

  const genres = styles?.filter(s => !['study', 'workout', 'sleep', 'focus'].includes(s.slug)) ?? []
  const activities = styles?.filter(s => ['study', 'workout', 'sleep', 'focus'].includes(s.slug)) ?? []

  return (
    <div className="px-5 pt-12 pb-4">
      <h1 className="text-2xl font-bold text-text-primary mb-1">Discover</h1>
      <p className="text-text-secondary mb-8 text-sm">Explore genres, moods, and unexpected musical worlds.</p>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Genres */}
      {genres.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-text-primary mb-3">Explore by genre</h2>
          <div className="grid grid-cols-2 gap-3">
            {genres.map(style => (
              <Link key={style.id} href={`/discover/${style.slug}`}>
                <div
                  className={cn(
                    'rounded-2xl p-5 bg-gradient-to-br h-28 flex flex-col justify-end card-hover',
                    GENRE_GRADIENTS[style.slug] ?? 'from-violet-800 to-indigo-800',
                  )}
                >
                  <p className="font-bold text-white text-base">{style.name}</p>
                  {style.description && (
                    <p className="text-white/60 text-xs mt-0.5 line-clamp-1">{style.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Activities */}
      {activities.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-text-primary mb-3">Explore by activity</h2>
          <div className="flex flex-wrap gap-3">
            {activities.map(style => (
              <Link key={style.id} href={`/discover/${style.slug}`}>
                <div className="px-5 py-3 rounded-2xl bg-card border border-border card-hover">
                  <p className="font-semibold text-text-primary text-sm">{style.name}</p>
                  {style.description && (
                    <p className="text-xs text-text-muted mt-0.5">{style.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
