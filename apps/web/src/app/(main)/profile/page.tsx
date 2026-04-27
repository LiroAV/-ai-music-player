'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface TasteProfile {
  topGenres: Array<{ genre: string; score: number }>
  topMoods: Array<{ mood: string; score: number }>
  summary: string
  noveltyTolerance: number
}

export default function ProfilePage() {
  const { data: profile } = useQuery<TasteProfile>({
    queryKey: ['taste-profile'],
    queryFn: () => api.get<TasteProfile>('/profile'),
  })

  return (
    <div className="px-5 pt-12 pb-4">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Your taste profile</h1>

      {profile && (
        <>
          {/* Summary */}
          <div className="p-5 rounded-2xl bg-card border border-border mb-6">
            <p className="text-text-secondary text-sm leading-relaxed">{profile.summary}</p>
          </div>

          {/* Top genres */}
          {profile.topGenres.length > 0 && (
            <section className="mb-6">
              <h2 className="text-base font-semibold text-text-primary mb-3">Top genres</h2>
              <div className="flex flex-col gap-2">
                {profile.topGenres.map(({ genre, score }) => (
                  <div key={genre} className="flex items-center gap-3">
                    <span className="text-text-secondary text-sm w-24 capitalize">{genre}</span>
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${score * 100}%` }} />
                    </div>
                    <span className="text-text-muted text-xs w-8 text-right">{Math.round(score * 100)}%</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Top moods */}
          {profile.topMoods.length > 0 && (
            <section className="mb-6">
              <h2 className="text-base font-semibold text-text-primary mb-3">Top moods</h2>
              <div className="flex flex-wrap gap-2">
                {profile.topMoods.map(({ mood, score }) => (
                  <div
                    key={mood}
                    className="px-4 py-2 rounded-full bg-card border border-border text-sm capitalize"
                    style={{ borderColor: `rgba(124,58,237,${score})` }}
                  >
                    <span className="text-text-primary">{mood}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Novelty level */}
          <section className="mb-6">
            <h2 className="text-base font-semibold text-text-primary mb-3">Discovery openness</h2>
            <div className="flex items-center gap-3">
              <span className="text-text-muted text-xs">Familiar</span>
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-cyan-accent rounded-full" style={{ width: `${(profile.noveltyTolerance ?? 0.35) * 100}%` }} />
              </div>
              <span className="text-text-muted text-xs">Adventurous</span>
            </div>
          </section>
        </>
      )}

      {!profile && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg mb-2">No profile yet</p>
          <p className="text-sm">Listen to some tracks and your taste profile will form.</p>
        </div>
      )}

      {/* Settings */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-text-primary mb-3">Settings</h2>
        <div className="flex flex-col gap-2">
          {['Notification preferences', 'Privacy settings', 'Subscription', 'About'].map(item => (
            <button key={item} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border text-left">
              <span className="text-text-primary text-sm">{item}</span>
              <span className="text-text-muted">›</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
