'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const STYLES = [
  { slug: 'jazz', label: 'Jazz', desc: 'Warm, expressive, improvisational.' },
  { slug: 'classical', label: 'Classical', desc: 'Timeless orchestral depth.' },
  { slug: 'lofi', label: 'Lo-fi', desc: 'Hazy beats for calm focus.' },
  { slug: 'house', label: 'House', desc: 'Soulful, uplifting 4/4 groove.' },
  { slug: 'techno', label: 'Techno', desc: 'Minimal, hypnotic rhythms.' },
  { slug: 'ambient', label: 'Ambient', desc: 'Atmospheric textures.' },
  { slug: 'cinematic', label: 'Cinematic', desc: 'Sweeping soundscapes.' },
  { slug: 'funk', label: 'Funk', desc: 'Groove-heavy, punchy bass.' },
  { slug: 'soul', label: 'Soul', desc: 'Emotional warmth and harmony.' },
  { slug: 'hiphop', label: 'Hip-Hop', desc: 'Rhythmic, urban expression.' },
  { slug: 'electronic', label: 'Electronic', desc: 'Synths and digital sound.' },
  { slug: 'acoustic', label: 'Acoustic', desc: 'Raw, organic guitar and voice.' },
  { slug: 'orchestral', label: 'Orchestral', desc: 'Full orchestra, rich dynamics.' },
  { slug: 'piano', label: 'Piano', desc: 'Piano as the centrepiece.' },
  { slug: 'latin', label: 'Latin', desc: 'Salsa, bossa nova, tropical.' },
  { slug: 'synthwave', label: 'Synthwave', desc: '80s-inspired neon vibes.' },
  { slug: 'experimental', label: 'Experimental', desc: 'Boundary-pushing sound.' },
  { slug: 'study', label: 'Study', desc: 'Deep focus background music.' },
  { slug: 'workout', label: 'Workout', desc: 'High-energy push music.' },
  { slug: 'sleep', label: 'Sleep', desc: 'Gentle, restful sounds.' },
]

const MOODS = [
  'Calm', 'Energetic', 'Dark', 'Happy', 'Melancholic',
  'Dreamy', 'Epic', 'Warm', 'Minimal', 'Groovy',
  'Romantic', 'Mysterious', 'Intense', 'Peaceful',
]

type Step = 'styles' | 'moods'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('styles')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])

  const toggleStyle = (slug: string) => {
    setSelectedStyles(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : prev.length < 8 ? [...prev, slug] : prev,
    )
  }

  const toggleMood = (mood: string) => {
    const slug = mood.toLowerCase()
    setSelectedMoods(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug],
    )
  }

  const handleStylesNext = () => {
    if (selectedStyles.length >= 3) setStep('moods')
  }

  const handleFinish = async () => {
    // Save preferences and redirect to app
    try {
      await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedStyles, selectedMoods }),
      })
    } catch {
      // proceed even if API fails
    }
    router.push('/home')
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 max-w-2xl mx-auto">
      {step === 'styles' && (
        <>
          <div className="mb-8">
            <p className="text-sm text-accent font-medium mb-2">Step 1 of 2</p>
            <h1 className="text-3xl font-bold text-text-primary mb-2">What sounds call to you?</h1>
            <p className="text-text-secondary">Pick 3 to 8 styles. You can change these any time.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {STYLES.map(s => (
              <button
                key={s.slug}
                onClick={() => toggleStyle(s.slug)}
                className={cn(
                  'rounded-2xl p-4 text-left transition-all border',
                  selectedStyles.includes(s.slug)
                    ? 'bg-accent/20 border-accent text-text-primary'
                    : 'bg-card border-border text-text-secondary hover:border-muted',
                )}
              >
                <p className="font-semibold text-sm text-text-primary">{s.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{s.desc}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleStylesNext}
            disabled={selectedStyles.length < 3}
            className="w-full py-4 rounded-2xl bg-accent text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Continue ({selectedStyles.length} selected)
          </button>
        </>
      )}

      {step === 'moods' && (
        <>
          <div className="mb-8">
            <p className="text-sm text-accent font-medium mb-2">Step 2 of 2</p>
            <h1 className="text-3xl font-bold text-text-primary mb-2">How do you like to feel?</h1>
            <p className="text-text-secondary">Choose any moods that resonate with you.</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            {MOODS.map(mood => (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all border',
                  selectedMoods.includes(mood.toLowerCase())
                    ? 'bg-accent/20 border-accent text-text-primary'
                    : 'bg-card border-border text-text-secondary hover:border-muted',
                )}
              >
                {mood}
              </button>
            ))}
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-2xl bg-accent text-white font-semibold"
          >
            Start listening
          </button>
        </>
      )}
    </main>
  )
}
