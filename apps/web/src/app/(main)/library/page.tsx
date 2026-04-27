'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const TABS = ['Playlists', 'Liked', 'Saved', 'Styles'] as const
type Tab = typeof TABS[number]

interface Playlist {
  id: string
  name: string
  visibility: string
  _count: { tracks: number }
  updatedAt: string
}

interface Style {
  id: string
  name: string
  slug: string
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Playlists')

  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ['playlists'],
    queryFn: () => api.get<Playlist[]>('/playlists'),
    enabled: activeTab === 'Playlists',
  })

  const { data: followedStyles } = useQuery<Style[]>({
    queryKey: ['followed-styles'],
    queryFn: () => api.get<Style[]>('/styles/followed'),
    enabled: activeTab === 'Styles',
  })

  return (
    <div className="px-5 pt-12 pb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Library</h1>
        {activeTab === 'Playlists' && (
          <button className="flex items-center gap-1 text-accent text-sm font-medium">
            <Plus className="w-4 h-4" /> New
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-colors',
              activeTab === tab
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'bg-card border border-border text-text-secondary hover:border-muted',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'Playlists' && (
        <div className="flex flex-col gap-3">
          {playlists?.length === 0 && (
            <div className="text-center py-16 text-text-muted">
              <p className="text-lg mb-2">No playlists yet</p>
              <p className="text-sm">Create your first playlist to organise your music.</p>
            </div>
          )}
          {playlists?.map(p => (
            <Link key={p.id} href={`/library/playlists/${p.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-muted transition-colors">
                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-text-muted">
                  ♪
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{p.name}</p>
                  <p className="text-sm text-text-secondary">{p._count.tracks} tracks · {p.visibility}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'Styles' && (
        <div className="flex flex-col gap-3">
          {followedStyles?.length === 0 && (
            <div className="text-center py-16 text-text-muted">
              <p className="text-lg mb-2">No followed styles</p>
              <p className="text-sm">Follow styles from the Discover tab.</p>
            </div>
          )}
          {followedStyles?.map(s => (
            <Link key={s.id} href={`/discover/${s.slug}`}>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-muted transition-colors">
                <p className="font-semibold text-text-primary">{s.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {(activeTab === 'Liked' || activeTab === 'Saved') && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">Coming soon</p>
          <p className="text-sm">Like and save tracks while listening to see them here.</p>
        </div>
      )}
    </div>
  )
}
