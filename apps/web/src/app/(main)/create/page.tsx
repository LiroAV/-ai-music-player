'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { usePlayerStore } from '@/store/player'
import { cn } from '@/lib/utils'

const GENRES = ['jazz', 'lofi', 'ambient', 'cinematic', 'house', 'funk', 'piano', 'classical', 'synthwave', 'electronic']
const MOODS = ['calm', 'warm', 'dark', 'energetic', 'dreamy', 'epic', 'groovy', 'peaceful', 'mysterious']
const ACTIVITIES = ['focus', 'study', 'gym', 'sleep', 'cooking', 'walking', 'gaming', 'reading', 'deepwork']

type Mode = 'quick' | 'mood' | 'activity' | 'advanced'

export default function CreatePage() {
  const [mode, setMode] = useState<Mode | null>(null)
  const [genre, setGenre] = useState('')
  const [moods, setMoods] = useState<string[]>([])
  const [activity, setActivity] = useState('')
  const [vocals, setVocals] = useState(false)
  const [freeText, setFreeText] = useState('')
  const [result, setResult] = useState<{ mode: string; message?: string } | null>(null)

  const { loadQueue } = usePlayerStore()

  const mutation = useMutation({
    mutationFn: () =>
      api.post<{ mode: string; tracks: string[]; message?: string }>('/generate/request', {
        genre: genre || undefined,
        mood: moods.length > 0 ? moods : undefined,
        activity: activity || undefined,
        vocals,
        freeTextPrompt: freeText || undefined,
        durationSeconds: 120,
      }),
    onSuccess: (data) => {
      setResult(data)
    },
  })

  const toggleMood = (m: string) => setMoods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  if (!mode) {
    return (
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Find music</h1>
        <p className="text-text-secondary mb-8 text-sm">Tell us what you want to hear. We'll find or create it.</p>

        <div className="grid grid-cols-2 gap-4">
          {([
            { id: 'quick' as Mode, label: 'Quick style', desc: 'Genre + mood + energy', emoji: '⚡' },
            { id: 'mood' as Mode, label: 'Mood mix', desc: 'Combine your feelings', emoji: '◑' },
            { id: 'activity' as Mode, label: 'Activity mode', desc: 'Music for what you\'re doing', emoji: '◎' },
            { id: 'advanced' as Mode, label: 'Advanced', desc: 'Describe it yourself', emoji: '✦' },
          ] as const).map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className="p-5 rounded-2xl bg-card border border-border text-left hover:border-muted transition-colors"
            >
              <span className="text-2xl">{m.emoji}</span>
              <p className="font-semibold text-text-primary mt-2">{m.label}</p>
              <p className="text-xs text-text-secondary mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 pt-12 pb-4">
      <button onClick={() => { setMode(null); setResult(null) }} className="text-sm text-text-muted mb-6 inline-block">
        ← Back
      </button>

      {mode === 'quick' && (
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-6">Quick style</h1>

          <label className="block mb-4">
            <span className="text-sm text-text-secondary mb-2 block">Genre</span>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={cn('px-4 py-2 rounded-full text-sm border transition-colors', genre === g ? 'bg-accent/20 border-accent text-accent' : 'bg-card border-border text-text-secondary')}
                >
                  {g}
                </button>
              ))}
            </div>
          </label>

          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <div
              onClick={() => setVocals(!vocals)}
              className={cn('w-12 h-6 rounded-full transition-colors', vocals ? 'bg-accent' : 'bg-card border border-border')}
            >
              <div className={cn('w-5 h-5 rounded-full bg-white m-0.5 transition-transform', vocals ? 'translate-x-6' : 'translate-x-0')} />
            </div>
            <span className="text-text-secondary text-sm">Vocals</span>
          </label>
        </div>
      )}

      {mode === 'mood' && (
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-6">Mood mix</h1>
          <div className="flex flex-wrap gap-3 mb-6">
            {MOODS.map(m => (
              <button
                key={m}
                onClick={() => toggleMood(m)}
                className={cn('px-5 py-2.5 rounded-full text-sm border transition-colors', moods.includes(m) ? 'bg-accent/20 border-accent text-accent' : 'bg-card border-border text-text-secondary')}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'activity' && (
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-6">Activity mode</h1>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ACTIVITIES.map(a => (
              <button
                key={a}
                onClick={() => setActivity(a)}
                className={cn('p-4 rounded-2xl text-sm border transition-colors text-left', activity === a ? 'bg-accent/20 border-accent text-accent' : 'bg-card border-border text-text-secondary')}
              >
                <span className="capitalize font-medium">{a}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'advanced' && (
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-6">Describe it yourself</h1>
          <textarea
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            placeholder="e.g. Calm cinematic piano with soft strings, no vocals, slow tempo, emotional but not sad."
            className="w-full h-36 bg-card border border-border rounded-2xl p-4 text-text-primary text-sm resize-none focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      )}

      {result ? (
        <div className="mt-6 p-4 rounded-2xl bg-card border border-border">
          <p className="text-text-primary font-medium">
            {result.mode === 'reused_existing_tracks' ? 'Found matching tracks' :
             result.mode === 'generation_started' ? 'Creating a new track…' :
             'Playing similar music'}
          </p>
          <p className="text-text-secondary text-sm mt-1">{result.message}</p>
        </div>
      ) : (
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full mt-6 py-4 rounded-2xl bg-accent text-white font-semibold disabled:opacity-50 transition-opacity"
        >
          {mutation.isPending ? 'Searching…' : 'Find music'}
        </button>
      )}
    </div>
  )
}
